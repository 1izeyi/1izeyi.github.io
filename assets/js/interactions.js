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
