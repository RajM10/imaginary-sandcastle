import Castle from "./helper/castle";
import Crack1 from "./helper/crack/crack1";
import crack2 from "./helper/crack/crack2";
import crack3 from "./helper/crack/crack3";
import crack4 from "./helper/crack/crack4";
import crack5 from "./helper/crack/crack5";
import crack6 from "./helper/crack/crack6";
import crack7 from "./helper/crack/crack7";
import crack8 from "./helper/crack/crack8";
import FlyingRock from "./helper/FlyingRock";
import GateAsset from "./helper/GateAsset";
import GateNight from "./helper/GateNight";
import MainRock from "./helper/MainRock";
import moon from "./helper/moon";
import NightCastle from "./helper/NightCastle";
import Pedestal from "./helper/Pedestal";
import PedestalDynamic from "./helper/PedestalDynamic";
import PedestalNight from "./helper/PedestalNight";
import Portal from "./helper/Portal";
import Queen from "./helper/Queen";
import River from "./helper/River";
import SandDune1 from "./helper/SandDune1";
import SandDune2 from "./helper/SandDune2";
import SandDune3 from "./helper/SandDune3";
import SmallRock2 from "./helper/SmallRock2";
import SmallRock3 from "./helper/SmallRock3";
import Sun from "./helper/sun";
import Tree from "./helper/Tree";

// Generate initial HTML
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
  NightCastle() +
  Queen() +
  FlyingRock() +
  Crack1() +
  crack2() +
  crack3() +
  crack4() +
  crack5() +
  crack6() +
  crack7() +
  crack8();
// Initialize DOM
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
<div id="flavortown-path" style="position: fixed; bottom: 20px; left: 20px; padding: 10px; background: rgba(0,0,0,0.7); border-radius: 5px;">
<a href="/scenes/flavortown/" style="color: #fff; text-decoration: none;">🏃‍♂️ Path to Flavortown</a>
</div>
<div id="magic-particles"></div>
`;

// Game Constants
const TIME = 30; // seconds for full cycle
const orbSize = 80;

// Game State
let lastProgress = 0;
let hasToggledInCycle = false;
let isNight = false;
let animationFrameId: number | null = null;

let puzzleSolved = false;
let pedestalClickCount = 0; // Track pedestal clicks
let isStationary = true; // Sun/moon start stationary
let normalCycleActive = false; // Normal day/night cycle

// Audio state
let currentTrack: "day" | "night" | "resolution" = "day";
const audio = new Audio();
audio.preload = "auto";
audio.loop = true;
const audioSources = {
  day: "./audio/day.ogg",
  night: "./audio/night.mp3",
  resolution: "./audio/neutral.ogg",
};
audio.src = audioSources.day;
// Sound effects
const chimeSound = new Audio("./audio/chime.ogg");
const crackSound = new Audio("./audio/crack.wav");

// DOM elements
const SUN = document.getElementById("sun") as HTMLElement;
const MOON = document.getElementById("moon") as HTMLElement;
const pedestal = document.getElementById("pedestal-clue")!;
const pedestalImg = document.getElementById("pedestal-img")!;
const pedestalElement = document.getElementById("pedestal")!;
const archway = document.getElementById("archway-lock")!;
const storyBox = document.getElementById("story-text")!;
const musicBtn = document.getElementById("music") as HTMLButtonElement;
const castle = document.getElementById("castle-svg")!;
const nightCastle = document.getElementById("NightCastle")!;
const tree = document.getElementById("Tree")!;
const queen = document.getElementById("Queen")!;
const river = document.getElementById("River")!;
const magicParticles = document.getElementById("magic-particles")!;

// Initialize audio
function initializeAudio(): void {
  audio.addEventListener(
    "canplaythrough",
    () => {
      if (audio.paused) {
        audio.play().catch(() => {
          // Auto-play blocked
        });
      }
    },
    { once: true }
  );
}

// Setup music button
function setupMusicButton(): void {
  if (!musicBtn) return;

  const cross = document.createElement("span");
  cross.textContent = "✕";
  cross.className = "music-cross";
  musicBtn.appendChild(cross);

  function updateCross() {
    const shouldShow = audio.paused || audio.muted === true;
    cross.classList.toggle("hidden", !shouldShow);
  }

  function syncAudioWithPhase() {
    const shouldPlay = !audio.paused;

    if (isNight && currentTrack !== "night") {
      currentTrack = "night";
      audio.src = audioSources.night;
      audio.loop = true;
    } else if (!isNight && currentTrack !== "day") {
      currentTrack = "day";
      audio.src = audioSources.day;
      audio.loop = true;
    }

    if (shouldPlay) {
      audio.play().catch(() => {});
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

// Initialize UI
function initializeUI(): void {
  // Set initial styles for night elements (hidden initially)
  queen.style.opacity = "0";
  queen.style.transition = "opacity 2s ease-in-out";
  nightCastle.style.transition = "opacity 2s ease-in-out";
  nightCastle.style.opacity = "0";
  tree.style.transition = "opacity 2s ease-in-out";
  tree.style.opacity = "0";
  river.style.transition = "opacity 2s ease-in-out";
  river.style.opacity = "0";

  // Initial stationary positions - center screen with pink/red magical background
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const sunX = (screenWidth - orbSize) * 0.3; // Sun on left
  const moonX = (screenWidth - orbSize) * 0.7; // Moon on right
  const orbY = (screenHeight - orbSize) * 0.3; // Both at top-middle

  SUN.style.transform = `translate(${sunX}px, ${orbY}px)`;
  MOON.style.transform = `translate(${moonX}px, ${orbY}px)`;
  SUN.style.opacity = "1";
  MOON.style.opacity = "1";

  // Set magical pink/red background initially
  document.body.style.background = `url('./img/back.png')`;

  // Initial content
  archway.innerHTML = GateAsset();
  pedestalImg.innerHTML = Pedestal();
  storyBox.textContent =
    "A mystical realm where sun and moon hang motionless in an enchanted sky. The pedestal beckons...";
  pedestal.textContent = "";

  // Style magic particles container
  magicParticles.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transition: opacity 2s ease-in-out;
  `;
}

// Create magic particle effect
function createMagicParticles(): void {
  magicParticles.innerHTML = "";
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, #fff 0%, #88f 50%, transparent 100%);
      border-radius: 50%;
      animation: sparkle ${2 + Math.random() * 3}s ease-in-out infinite;
      top: ${Math.random() * 100}vh;
      left: ${Math.random() * 100}vw;
      animation-delay: ${Math.random() * 2}s;
    `;
    magicParticles.appendChild(particle);
  }

  // Add sparkle animation
  if (!document.getElementById("sparkle-keyframes")) {
    const style = document.createElement("style");
    style.id = "sparkle-keyframes";
    style.textContent = `
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Handle pedestal clicks
function handlePedestalClick(): void {
  pedestalClickCount++;

  if (pedestalClickCount === 1) {
    // First click - change to dark side
    storyBox.textContent =
      "The pedestal responds! Darkness spreads across the realm...";
    pedestal.textContent = "...hold the memory of night...";

    // Add magic particles
    createMagicParticles();
    magicParticles.style.opacity = "1";

    // Change to dark mode
    document.body.classList.add("dark-mode");
    isNight = true;

    // Change to dark background
    document.body.style.background = `
      radial-gradient(circle at 50% 30%, #1a0033 0%, #000511 100%)
    `;

    // Show night elements
    archway.innerHTML = GateNight();
    castle.style.opacity = "0";
    nightCastle.style.opacity = "1";
    tree.style.opacity = "1";
    river.style.opacity = "1";

    // Change audio to night
    if (!audio.paused) {
      currentTrack = "night";
      audio.src = audioSources.night;
      audio.play().catch(() => {});
    }
  } else if (pedestalClickCount === 2) {
    // Second click - trigger the transformation sequence
    storyBox.textContent =
      "The ghostly queen appears and places a [Memory Crystal] upon the pedestal. You take it.";
    // Play chime sound
    chimeSound.play().catch(() => {});

    // Show queen
    queen.style.opacity = "1";

    // Change cursor to crystal
    document.body.style.cursor = "url('./img/crystal_cursor.png') 8 8, auto";

    // Update pedestal
    pedestal.textContent = "...against the solid truth of day.";
    pedestal.style.color = "#ffff88";
    pedestalImg.innerHTML = PedestalNight();

    // After 3 seconds, trigger the transformation
    setTimeout(() => {
      triggerTransformation();
    }, 3000);
  }
}

// Trigger the transformation sequence
function triggerTransformation(): void {
  storyBox.textContent =
    "The Memory Crystal resonates! The spell transforms the realm!";

  // Play crack sound
  crackSound.play().catch(() => {});

  // Screen flash effect
  document.body.style.backgroundColor = "white";
  setTimeout(() => {
    document.body.style.backgroundColor = "";
  }, 200);

  // Hide magic particles
  magicParticles.style.opacity = "0";

  // Sun disappears temporarily
  SUN.style.opacity = "0";

  // Night castle disappears
  nightCastle.style.opacity = "0";
  tree.style.opacity = "0";
  river.style.opacity = "0";

  // Queen stays visible briefly
  setTimeout(() => {
    // Moon starts setting, sun starts rising
    moonSetsAndSunRises();
  }, 1000);
}

// Moon sets and sun rises sequence
function moonSetsAndSunRises(): void {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Moon sets (moves down and fades)
  const moonSetY = screenHeight + orbSize;
  MOON.style.transition = "transform 3s ease-in-out, opacity 2s ease-in-out";
  MOON.style.transform = `translate(${
    (screenWidth - orbSize) * 0.7
  }px, ${moonSetY}px)`;
  MOON.style.opacity = "0";

  // Sun rises (appears and moves up)
  setTimeout(() => {
    const sunRiseStartY = screenHeight + orbSize;
    const sunRiseEndY = (screenHeight - orbSize) * 0.3;

    SUN.style.transform = `translate(${
      (screenWidth - orbSize) * 0.3
    }px, ${sunRiseStartY}px)`;
    SUN.style.opacity = "1";
    SUN.style.transition = "transform 3s ease-in-out";

    setTimeout(() => {
      SUN.style.transform = `translate(${
        (screenWidth - orbSize) * 0.3
      }px, ${sunRiseEndY}px)`;
    }, 100);

    // Remove dark mode and restore normal background
    setTimeout(() => {
      document.body.classList.remove("dark-mode");
      isNight = false;
      document.body.style.background = "";

      // Show normal castle
      castle.style.opacity = "1";
      archway.innerHTML = GateAsset() + Portal();
      pedestalImg.innerHTML = PedestalDynamic();

      // Reset cursor
      document.body.style.cursor = "auto";

      // Start normal day/night rrrrrr
      puzzleSolved = true;
      isStationary = false;
      normalCycleActive = true;

      // Change audio back to day
      if (!audio.paused) {
        currentTrack = "day";
        audio.src = audioSources.day;
        audio.play().catch(() => {});
      }

      // Queen fades away
      queen.style.opacity = "0";

      // Permanently remove night elements - they should never appear again
      setTimeout(() => {
        nightCastle.remove();
        tree.remove();
        river.remove();
        queen.remove();
      }, 2000);

      storyBox.textContent =
        "The realm awakens! Natural cycles have returned. The archway glows with gentle power.";

      // Update archway to show it's active
      archway.style.filter = "brightness(1.2) drop-shadow(0 0 10px #88f)";

      // Reset orb styles - only sun visible initially for day cycle
      SUN.style.transition = "";
      MOON.style.transition = "";
      MOON.style.opacity = "0"; // Moon hidden during day

      // Start the animation loop
      animate();
    }, 2000);
  }, 500);
}

// Handle archway clicks (optional exit)
function handleArchwayClick(): void {
  if (puzzleSolved) {
    storyBox.innerHTML =
      "<a href='/scenes/75/'>Enter the Flavortown.</a> The archway hums with peaceful energy. <a href='/scenes/68/'>Enter the Based Camp.</a>";
  } else {
    storyBox.textContent =
      "It's a large, inert stone archway. It feels ancient, but it does nothing.";
  }
}

// Handle normal day/night transitions (only after puzzle solved)
function handlePhaseTransition(): void {
  if (!normalCycleActive) return;

  document.body.classList.toggle("dark-mode");
  isNight = !isNight;

  // Sync audio
  const wasPlaying = !audio.paused;
  if (isNight && currentTrack !== "night") {
    currentTrack = "night";
    audio.src = audioSources.night;
    if (wasPlaying) audio.play().catch(() => {});
  } else if (!isNight && currentTrack !== "day") {
    currentTrack = "day";
    audio.src = audioSources.day;
    if (wasPlaying) audio.play().catch(() => {});
  }

  if (isNight) {
    storyBox.textContent = "Natural night falls over the peaceful realm.";
    // Keep normal archway - no more night gate
    // Keep normal castle - no more night castle
    SUN.style.opacity = "0"; // Hide sun during night
    MOON.style.opacity = "1"; // Show moon during night
  } else {
    storyBox.textContent = "Dawn breaks over the restored realm.";
    SUN.style.opacity = "1"; // Show sun during day
    MOON.style.opacity = "0"; // Hide moon during day
  }
}

// Animation loop (only starts after puzzle solved)
function animate(): void {
  if (!normalCycleActive || isStationary) return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const duration = TIME * 1000;
  let startTime: number | null = null;

  function animationStep(timestamp: number) {
    if (!normalCycleActive) return;

    if (!startTime) startTime = timestamp;
    const elapsedTime = timestamp - startTime;
    const progress = (elapsedTime / duration) % 1;

    // Handle cycle transitions
    if (progress < lastProgress) {
      hasToggledInCycle = false;
    }

    if (progress > 0.95 && !hasToggledInCycle && normalCycleActive) {
      hasToggledInCycle = true;
      handlePhaseTransition();
    }

    lastProgress = progress;

    // Update orb positions - normal animation
    const x = (screenWidth - orbSize) * progress;
    const y =
      screenHeight - orbSize - screenHeight * Math.sin(progress * Math.PI);
    const transformValue = `translate(${x}px, ${y}px)`;

    // Apply transform to both but only visible one shows
    SUN.style.transform = transformValue;
    MOON.style.transform = transformValue;

    // Update background gradient
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

// Add click handlers for environmental elements
function addEnvironmentalClickHandlers(): void {
  // Castle click handlers
  castle.addEventListener("click", () => {
    if (puzzleSolved) {
      storyBox.textContent =
        "The castle stands peacefully in the natural light.";
    } else {
      storyBox.textContent =
        "An old castle, waiting for something to change...";
    }
  });

  // Night castle click handler (only if still exists)
  if (nightCastle && !puzzleSolved) {
    nightCastle.addEventListener("click", () => {
      storyBox.textContent =
        "The magical castle shimmers with ethereal energy.";
    });
  }

  // Environmental elements
  [
    document.getElementById("SandDune1"),
    document.getElementById("SandDune2"),
    document.getElementById("SandDune3"),
  ].forEach((dune) => {
    dune?.addEventListener("click", () => {
      storyBox.textContent = "Soft sand dunes shaped by ancient winds.";
    });
  });

  [
    document.getElementById("MainRock"),
    document.getElementById("SmallRock2"),
    document.getElementById("SmallRock3"),
  ].forEach((rock) => {
    rock?.addEventListener("click", () => {
      storyBox.textContent = "Weathered stones that have witnessed ages pass.";
    });
  });

  // Tree, river, queen click handlers (only if still exist)
  if (tree && !puzzleSolved) {
    tree.addEventListener("click", () => {
      if (tree.style.opacity !== "0") {
        storyBox.textContent = "A spectral tree born from pure magic.";
      }
    });
  }

  if (river && !puzzleSolved) {
    river.addEventListener("click", () => {
      if (river.style.opacity !== "0") {
        storyBox.textContent = "A ghostly river flowing with ancient memories.";
      }
    });
  }

  if (queen && !puzzleSolved) {
    queen.addEventListener("click", () => {
      if (queen.style.opacity !== "0") {
        storyBox.textContent =
          "The ghostly queen, keeper of the Memory Crystal.";
      }
    });
  }

  SUN.addEventListener("click", () => {
    if (puzzleSolved) {
      storyBox.textContent = "The sun follows its natural path once more.";
    } else {
      storyBox.textContent = "The sun hangs motionless in the enchanted sky.";
    }
  });

  MOON.addEventListener("click", () => {
    if (puzzleSolved) {
      storyBox.textContent = "The moon glows softly in its proper cycle.";
    } else {
      storyBox.textContent = "The moon waits silently beside the sun.";
    }
  });
}

// Initialize everything
function init(): void {
  initializeAudio();
  setupMusicButton();
  initializeUI();
  addEnvironmentalClickHandlers();

  // Main puzzle event listeners
  pedestalElement.addEventListener("click", handlePedestalClick);
  archway.addEventListener("click", handleArchwayClick);

  // Window resize handler
  window.addEventListener("resize", () => {
    if (normalCycleActive && !isStationary) {
      animate();
    }
  });

  // Don't start animation initially - orbs are stationary
}

// Start the game
init();
