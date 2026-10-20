import { $, reduceMotion } from "./utils.js";

export function initScrollSpy() {
  const nav = $("#site-nav");
  const navLinks = [...document.querySelectorAll("[data-nav-target]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  const topbar = document.querySelector(".topbar");
  const indicator = nav ? nav.querySelector(".nav-indicator") : null;
  let lockedTarget = "";
  let lockTimer = 0;

  if (!navLinks.length || !sections.length) {
    return;
  }

  function getHeaderOffset() {
    if (!topbar) {
      return 120;
    }

    return Math.ceil(topbar.getBoundingClientRect().height + 24);
  }

  function setActiveNav(targetId) {
    navLinks.forEach((link) => {
      const active = link.dataset.navTarget === targetId;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    syncNavIndicator(targetId);
  }

  function syncNavIndicator(targetId) {
    if (!indicator || !nav) {
      return;
    }

    const activeLink = navLinks.find((link) => link.dataset.navTarget === targetId);

    if (!activeLink) {
      indicator.classList.remove("is-visible");
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    const top = linkRect.top - navRect.top;

    indicator.style.width = `${linkRect.width}px`;
    indicator.style.height = `${linkRect.height}px`;
    indicator.style.transform = `translate(${left}px, ${top}px)`;
    indicator.classList.add("is-visible");
  }

  function findActiveSection() {
    const offset = getHeaderOffset() + 14;
    const reachedPageBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    if (reachedPageBottom) {
      return sections[sections.length - 1].id;
    }

    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        activeId = section.id;
      }
    });

    return activeId;
  }

  function releaseLock() {
    lockedTarget = "";
    window.clearTimeout(lockTimer);
  }

  function updateActiveNav() {
    if (lockedTarget) {
      const targetSection = document.getElementById(lockedTarget);

      if (!targetSection) {
        releaseLock();
      } else {
        const reachedTarget = targetSection.getBoundingClientRect().top <= getHeaderOffset() + 16;
        const reachedPageBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

        if (!reachedTarget && !reachedPageBottom) {
          setActiveNav(lockedTarget);
          return;
        }

        releaseLock();
      }
    }

    setActiveNav(findActiveSection());
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      lockedTarget = link.dataset.navTarget || "";
      setActiveNav(lockedTarget);
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(updateActiveNav, reduceMotion ? 0 : 1200);
    });
  });

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  window.addEventListener("resize", updateActiveNav);
  window.addEventListener("hashchange", updateActiveNav);
  window.addEventListener("load", updateActiveNav);
  if (nav) {
    nav.addEventListener(
      "scroll",
      () => {
        const activeLink = navLinks.find((link) => link.classList.contains("active"));

        if (activeLink) {
          syncNavIndicator(activeLink.dataset.navTarget || "");
        }
      },
      { passive: true }
    );
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateActiveNav).catch(() => {});
  }
  updateActiveNav();
}

export function initReveal() {
  if (reduceMotion) {
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const delay = Number(entry.target.dataset.revealDelay || 0);
        window.setTimeout(() => entry.target.classList.add("is-visible"), delay);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    observer.observe(element);
  });
}

export function initTopbarState() {
  const topbar = document.querySelector(".topbar");

  if (!topbar) {
    return;
  }

  function syncTopbar() {
    topbar.classList.toggle("is-condensed", window.scrollY > 28);
  }

  window.addEventListener("scroll", syncTopbar, { passive: true });
  window.addEventListener("resize", syncTopbar);
  window.addEventListener("load", syncTopbar);
  syncTopbar();
}

export function initPublicationFilter() {
  const button = $("#publications-filter");
  const grid = $("#publications-grid");

  if (!button || !grid) {
    return;
  }

  button.addEventListener("click", () => {
    const filtered = grid.classList.toggle("is-filtered");
    button.setAttribute("aria-pressed", String(filtered));
  });
}

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function initMagneticButtons() {
  if (reduceMotion || !finePointer) {
    return;
  }

  const buttons = [...document.querySelectorAll(".glass-button")];
  const radius = 90;
  const strength = 0.025;
  const maxOffset = 1;

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      buttons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);

        if (Math.hypot(dx, dy) < radius + Math.max(rect.width, rect.height) / 2) {
          const ox = Math.max(-maxOffset, Math.min(maxOffset, dx * strength));
          const oy = Math.max(-maxOffset, Math.min(maxOffset, dy * strength));
          button.style.translate = `${ox}px ${oy}px`;
        } else if (button.style.translate) {
          button.style.translate = "";
        }
      });
    },
    { passive: true }
  );
}

export function initHeroParallax() {
  const hero = $(".hero");

  if (reduceMotion || !finePointer || !hero) {
    return;
  }

  const shell = hero.querySelector(".hero-shell");

  hero.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      const rect = hero.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;

      shell.style.setProperty("--parallax-x", nx.toFixed(3));
      shell.style.setProperty("--parallax-y", ny.toFixed(3));
    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    shell.style.setProperty("--parallax-x", "0");
    shell.style.setProperty("--parallax-y", "0");
  });
}

export function initPortraitHolo() {
  const panel = document.querySelector(".portrait-panel");

  if (reduceMotion || !finePointer || !panel) {
    return;
  }

  const frame = panel.querySelector(".portrait-frame");

  if (!frame) {
    return;
  }

  panel.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      frame.style.setProperty("--portrait-rx", `${((0.5 - py) * 20).toFixed(2)}deg`);
      frame.style.setProperty("--portrait-ry", `${((px - 0.5) * 24).toFixed(2)}deg`);
      frame.style.setProperty("--glare-x", (px * 100).toFixed(1));
      frame.style.setProperty("--glare-y", (py * 100).toFixed(1));
    },
    { passive: true }
  );

  panel.addEventListener("pointerleave", () => {
    frame.style.setProperty("--portrait-rx", "0deg");
    frame.style.setProperty("--portrait-ry", "0deg");
  });
}

export function initScrollProgress() {
  const navShell = document.querySelector(".nav-shell");

  if (!navShell) {
    return;
  }

  const bar = document.createElement("span");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  navShell.appendChild(bar);

  function syncProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.transform = `scaleX(${progress})`;
  }

  window.addEventListener("scroll", syncProgress, { passive: true });
  window.addEventListener("resize", syncProgress);
  window.addEventListener("load", syncProgress);
  syncProgress();
}

function spawnRipple(event) {
  const target = event.currentTarget;
  const ripple = document.createElement("span");
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 0.85;

  ripple.className = "interaction-ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;

  target.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

export function initInteractiveSurfaces() {
  const surfaces = document.querySelectorAll(".interactive-surface");

  surfaces.forEach((surface) => {
    surface.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      spawnRipple(event);
    });

    if (reduceMotion) {
      return;
    }

    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 100;
      const py = ((event.clientY - rect.top) / rect.height) * 100;
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 6;

      surface.style.setProperty("--pointer-x", `${px}%`);
      surface.style.setProperty("--pointer-y", `${py}%`);
      surface.style.setProperty("--lift-x", `${offsetX}px`);
      surface.style.setProperty("--lift-y", `${offsetY * -0.45}px`);
      surface.style.setProperty("--rotate-y", `${offsetX * 0.08}deg`);
      surface.style.setProperty("--rotate-x", `${offsetY * -0.08}deg`);
    });

    surface.addEventListener("pointerleave", () => {
      surface.style.removeProperty("--pointer-x");
      surface.style.removeProperty("--pointer-y");
      surface.style.removeProperty("--lift-x");
      surface.style.removeProperty("--lift-y");
      surface.style.removeProperty("--rotate-x");
      surface.style.removeProperty("--rotate-y");
    });
  });
}
