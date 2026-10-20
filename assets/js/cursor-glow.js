import { reduceMotion } from "./utils.js";

export function initCursorGlow() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (reduceMotion || !finePointer) {
    return;
  }

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let visible = false;
  let rafId = 0;

  function tick() {
    rafId = 0;
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    if (visible) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  function setVisible(next) {
    if (visible === next) {
      return;
    }
    visible = next;
    glow.classList.toggle("is-visible", visible);

    if (visible && !rafId) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      setVisible(true);
    },
    { passive: true }
  );

  document.documentElement.addEventListener("pointerleave", () => setVisible(false));
  window.addEventListener("blur", () => setVisible(false));
}
