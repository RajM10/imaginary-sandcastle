import Castle from "./helper/castle";
import MainRock from "./helper/MainRock";
import moon from "./helper/moon";
import SandDune1 from "./helper/SandDune1";
import SandDune2 from "./helper/SandDune2";
import SandDune3 from "./helper/SandDune3";
import SandDune4 from "./helper/SandDune4";
import SmallRock2 from "./helper/SmallRock2";
import SmallRock3 from "./helper/SmallRock3";
import Sun from "./helper/sun";
const html =
  Castle() +
  MainRock() +
  SandDune1() +
  SandDune2() +
  SandDune3() +
  SandDune4() +
  SmallRock2() +
  SmallRock3() +
  Sun() +
  moon();
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `${html}<div id="bg"></div>`;
let hasToggledInCycle = false;
let lastProgress = 0;
const TIME = 10; // in seconds for full cycle
const SUN = document.getElementById("sun") as HTMLElement;
const MOON = document.getElementById("moon") as HTMLElement;
let animationFrameId: number | null = null; // To manage the animation loop
const orbSize = 80;

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

    // --- TOGGLE LOGIC (UNCHANGED) ---
    if (progress < lastProgress) {
      hasToggledInCycle = false;
    }
    if (progress > 0.95 && !hasToggledInCycle) {
      document.body.classList.toggle("dark-mode");
      hasToggledInCycle = true;
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

window.addEventListener("resize", animate);
