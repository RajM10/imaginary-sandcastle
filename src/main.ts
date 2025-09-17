import Castle from "./helper/castle";
import GateAsset from "./helper/GateAsset";
import GateNight from "./helper/GateNight";
import MainRock from "./helper/MainRock";
import moon from "./helper/moon";
import NightCastle from "./helper/NightCastle";
import Pedestal from "./helper/Pedestal";
import PedestalNight from "./helper/PedestalNight";
import River from "./helper/River";
import SandDune1 from "./helper/SandDune1";
import SandDune2 from "./helper/SandDune2";
import SandDune3 from "./helper/SandDune3";
import SmallRock2 from "./helper/SmallRock2";
import SmallRock3 from "./helper/SmallRock3";
import Sun from "./helper/sun";
import Tree from "./helper/Tree";
const html =
  Castle() +
  MainRock() +
  SandDune1() +
  SandDune2() +
  SandDune3() +
  SmallRock2() +
  SmallRock3() +
  Sun() +
  moon() +
  Tree() +
  River() +
  NightCastle();
// GateDay() +
// GateNight();
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `${html}<div id="bg">
</div>
<button id="music" aria-label="Toggle music"></button>
<div id="pedestal" class="interactive-object">
<div id="pedestal-img"></div>
<div id="pedestal-clue"></div>
</div>
<div id="archway-lock" class="interactive-object"></div>
<div id="story-text"></div>
`;

//@constants
let TIME = 30; // in seconds for full cycle
const orbSize = 80;

//@global variable
let lastProgress = 0;
let hasToggledInCycle = false;
let isNight = false;
let animationFrameId: number | null = null; // To manage the animation loop
let playerHasTool = false;
let cycleStage = 0; // 0: first day, 1: night, 2: back to day and lock

// audio state
let currentTrack: "day" | "night" | "neutral" = "day";
const audio = new Audio();
audio.preload = "auto";
audio.loop = true;
const audioSources = {
  day: "/audio/day.ogg",
  night: "/audio/night.mp3",
  neutral: "/audio/neutral.ogg",
};
audio.src = audioSources.day;

// Initialize audio to play on page load
audio.addEventListener(
  "canplaythrough",
  () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // Auto-play blocked, user will need to click music button
      });
    }
  },
  { once: true },
);

//elements
const SUN = document.getElementById("sun") as HTMLElement;
const MOON = document.getElementById("moon") as HTMLElement;
const pedestal = document.getElementById("pedestal-clue")!;
const pedestalImg = document.getElementById("pedestal-img")!;
const archway = document.getElementById("archway-lock")!;
const storyBox = document.getElementById("story-text")!;
const musicBtn = document.getElementById("music") as HTMLButtonElement;
const castle = document.getElementById("castle-svg")!;
const nightCastle = document.getElementById("NightCastle")!;
const tree = document.getElementById("Tree")!;
const river = document.getElementById("River")!;
const pedestalContainer = document.getElementById("pedestal")!;

archway.innerHTML = GateAsset();
pedestalImg.innerHTML = Pedestal();

// setup music button behavior using CSS classes
if (musicBtn) {
  // cross overlay when paused/muted
  const cross = document.createElement("span");
  cross.textContent = "✕";
  cross.className = "music-cross"; // initially showing (not playing)
  musicBtn.appendChild(cross);

  function updateCross() {
    const shouldShow = audio.paused || audio.muted === true;
    cross.classList.toggle("hidden", !shouldShow);
  }

  function syncAudioWithPhase() {
    const shouldPlay = !audio.paused;

    if (cycleStage === 0 && currentTrack !== "day") {
      currentTrack = "day";
      audio.src = audioSources.day;
      audio.loop = true;
      if (shouldPlay) {
        audio.play().catch(() => {});
      }
    } else if (cycleStage === 1 && currentTrack !== "night") {
      currentTrack = "night";
      audio.src = audioSources.night;
      audio.loop = true;
      if (shouldPlay) {
        audio.play().catch(() => {});
      }
    } else if (cycleStage >= 2 && currentTrack !== "neutral") {
      currentTrack = "neutral";
      audio.src = audioSources.neutral;
      audio.loop = true;
      if (shouldPlay) {
        audio.play().catch(() => {});
      }
    }
  }

  musicBtn.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        syncAudioWithPhase();
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (_) {
      // ignore
    } finally {
      updateCross();
    }
  });

  audio.addEventListener("play", updateCross);
  audio.addEventListener("pause", updateCross);
  audio.addEventListener("volumechange", updateCross);
  updateCross();
}

pedestalContainer.addEventListener("click", handlePedestalClick);
archway.addEventListener("click", handleArchwayClick);

function animate() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const duration = TIME * 1000;
  let startTime: number | null = null;

  function animationStep(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsedTime = timestamp - startTime;
    const progress = (elapsedTime / duration) % 1;

    if (progress < lastProgress) {
      hasToggledInCycle = false;
    }
    if (progress > 0.95 && !hasToggledInCycle) {
      // Only allow two toggles total: day -> night -> day, then lock in day
      if (cycleStage < 2) {
        document.body.classList.toggle("dark-mode");
        hasToggledInCycle = true;
        isNight = !isNight;
        cycleStage += 1;
        archway.innerHTML = GateNight();
        pedestalImg.innerHTML = PedestalNight();
        handlePhaseAudioChange();
        updateCursorForPhase();
        clearPedestal();
        castle.style.opacity = "0";
        if (cycleStage === 2) {
          pedestalImg.innerHTML = Pedestal();
          pedestalContainer.removeEventListener("click", handlePedestalClick);
          nightCastle.remove();
          tree.remove();
          river?.remove();
          castle.style.opacity = "1";
          archway.innerHTML = GateAsset();
        }
      } else {
        hasToggledInCycle = true; // prevent repeated work within the same cycle end
        document.body.classList.toggle("dark-mode");
        isNight = !isNight;
      }
    }
    lastProgress = progress;

    // --- SIMPLIFIED POSITION LOGIC ---
    // No more checking for dark mode here. Just calculate the position once.
    const x = (screenWidth - orbSize) * progress;
    const y =
      screenHeight - orbSize - screenHeight * Math.sin(progress * Math.PI);
    const transformValue = `translate(${x}px, ${y}px)`;

    // Apply the transform to BOTH elements. CSS handles which one is visible.
    SUN.style.transform = transformValue;
    MOON.style.transform = transformValue;

    // --- BACKGROUND LOGIC (UNCHANGED, but you could simplify this too) ---
    const isDarkMode = document.body.classList.contains("dark-mode");
    const orbCenterXPercent = ((x + orbSize / 2) / screenWidth) * 100;
    const orbCenterYPercent = ((y + orbSize / 2) / screenHeight) * 100;

    document.body.style.background = isDarkMode
      ? "var(--sky-end)"
      : `radial-gradient(circle at ${orbCenterXPercent}% ${orbCenterYPercent}%, var(--sky-origin) 6.25%, var(--sky-end) 100%)`;

    animationFrameId = requestAnimationFrame(animationStep);
  }
  animationFrameId = requestAnimationFrame(animationStep);
}
animate();

function handlePhaseAudioChange() {
  const wasPlaying = !audio.paused;

  // cycleStage after increment: 1 means switched to night, 2 means switched back to day forever
  if (cycleStage === 1) {
    // switched to night
    if (currentTrack !== "night") {
      currentTrack = "night";
      audio.src = audioSources.night;
      audio.loop = true;
      if (wasPlaying) {
        audio.play().catch(() => {});
      }
    }
  } else if (cycleStage >= 2) {
    // switched back to day, now neutral forever
    if (currentTrack !== "neutral") {
      currentTrack = "neutral";
      audio.src = audioSources.neutral;
      audio.loop = true;
      if (wasPlaying) {
        audio.play().catch(() => {});
      }
    }
  }
}

function handlePedestalClick() {
  console.log("Hello");
  if (isNight === false) {
    storyBox.textContent =
      "You see a broken pedestal with a faint inscription: '...hold the memory of night...'";
    pedestal.textContent = "...hold the memory of night...";
  } else {
    storyBox.textContent =
      "The pedestal is whole. A ghostly queen places a [Memory Crystal] upon it. You take the crystal.";
    pedestal.textContent = "...against the solid truth of day.";
  }
}

function handleArchwayClick() {
  if (playerHasTool === true && isNight === false) {
    // SUCCESS: Player has the tool AND it is day time.
    storyBox.innerHTML =
      "You press the crystal against the solid stone. The archway shimmers and a path opens! <a href='/scenes/mount-miniscule-based-camp/'>You escape to the Based Camp.</a>";
    // Puzzle solved!
  } else if (playerHasTool === true && isNight === true) {
    // FAIL: Player has the tool but it's night.
    storyBox.textContent =
      "You hold the crystal to the arch, but it's like pressing a ghost against a ghost. Nothing happens. The inscription said 'against the solid truth of day.'";
  } else {
    // FAIL: Player doesn't have the tool yet.
    storyBox.textContent =
      "It's a large, inert stone archway. It feels ancient, but it does nothing.";
  }
}

function clearPedestal() {
  pedestal.textContent = "";
}
function updateCursorForPhase() {
  // Use the crystal ball SVG during night; default during day
  if (isNight) {
    document.body.style.cursor = "url('/assets/cryastal_ball.svg') 16 16, auto";
  } else {
    document.body.style.cursor = "auto";
  }
}

window.addEventListener("resize", animate);
