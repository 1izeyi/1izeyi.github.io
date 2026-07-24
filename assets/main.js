(function () {
  const content = window.siteContent;

  if (!content) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const linkLabels = {
    email: "Email",
    github: "GitHub",
    scholar: "Google Scholar",
    cv: "CV",
  };

  function $(selector) {
    return document.querySelector(selector);
  }

  function getLink(key) {
    return content.links && content.links[key] ? content.links[key] : "";
  }

  function isExternalHref(href) {
    return /^https?:/i.test(href) || /^mailto:/i.test(href);
  }

  function createButton({ label, href, style = "ghost" }) {
    const anchor = document.createElement("a");
    const arrow = href.startsWith("#") ? "&darr;" : "&nearr;";

    anchor.className = `glass-button ${style} interactive-surface`;
    anchor.href = href;
    anchor.dataset.magnetic = "true";
    anchor.innerHTML = `<span>${label}</span><span class="button-arrow" aria-hidden="true">${arrow}</span>`;

    if (isExternalHref(href)) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer noopener";
    }

    return anchor;
  }

  function renderMeta() {
    document.title = content.meta.title;

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = content.meta.description;
    }

    $("#brand-name").textContent = content.profile.name;
    $("#brand-subtitle").textContent = content.brand.subtitle || "";
    $("#footer-brand").textContent = content.profile.name;
    $("#footer-year").textContent = new Date().getFullYear();
  }

  function renderNavigation() {
    const nav = $("#site-nav");
    const indicator = document.createElement("span");

    nav.innerHTML = "";
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.appendChild(indicator);

    content.navigation.forEach((item) => {
      const link = document.createElement("a");
      link.className = "nav-link interactive-surface";
      link.href = item.href;
      link.dataset.magnetic = "true";
      link.dataset.navTarget = item.href.slice(1);
      link.textContent = item.label;
      nav.appendChild(link);
    });
  }

  function renderHero() {
    $("#hero-kicker").textContent = content.profile.kicker;
    $("#hero-name").textContent = content.profile.name;
    $("#hero-headline").textContent = content.profile.headline;
    $("#hero-summary").textContent = content.profile.summary || "";
    $("#hero-affiliation").textContent = content.profile.affiliation;
    $("#hero-location").textContent = content.profile.location;
    $("#hero-status").textContent = content.profile.availability || "";
    $("#hero-avatar").src = content.profile.avatar;
    $("#hero-avatar").alt = `Portrait of ${content.profile.name}`;

    const actions = $("#hero-actions");
    actions.innerHTML = "";
    content.heroActions.forEach((action) => {
      const href =
        action.type === "external"
          ? getLink(action.key)
          : action.type === "anchor"
            ? action.href
            : "";

      if (!href) {
        return;
      }

      actions.appendChild(
        createButton({
          label: action.label,
          href,
          style: action.style,
        })
      );
    });
  }

  function renderAuthors(publication) {
    return publication.authors
      .map((author) => {
        const isHighlight = publication.highlightAuthors.includes(author);
        const isCo = (publication.coFirstAuthors || []).includes(author);
        const star = isCo ? `<sup>*</sup>` : "";
        return isHighlight
          ? `<span class="author-emphasis">${author}${star}</span>`
          : `<span>${author}${star}</span>`;
      })
      .join(", ");
  }

  function renderPublications() {
    const grid = $("#publications-grid");
    grid.innerHTML = "";

    content.publications.forEach((publication, index) => {
      const card = document.createElement("article");
      card.className =
        index === 0
          ? "publication-card glass-panel interactive-surface publication-featured"
          : "publication-card glass-panel interactive-surface";
      card.dataset.magnetic = "true";
      card.dataset.reveal = "true";
      card.innerHTML = `
        <div class="publication-image-wrap">
          <span class="publication-badge">${publication.venue}</span>
          <img
            class="publication-image"
            src="${publication.image}"
            alt="${publication.title}"
            loading="lazy"
            decoding="async"
          >
        </div>
        <div class="publication-copy">
          <h3>${publication.title}</h3>
          <p class="publication-authors">${renderAuthors(publication)}</p>
          ${publication.note ? `<p class="publication-note">${publication.note}</p>` : ""}
          <div class="publication-actions">
            <a
              class="glass-button secondary interactive-surface"
              data-magnetic
              href="${publication.link}"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>View Publication</span>
              <span class="button-arrow" aria-hidden="true">&nearr;</span>
            </a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderTimeline() {
    const list = $("#timeline-list");
    list.innerHTML = "";

    content.timeline.forEach((item) => {
      const card = document.createElement("article");
      card.className = "timeline-item glass-panel interactive-surface";
      card.dataset.magnetic = "true";
      card.dataset.reveal = "true";
      card.innerHTML = `
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-topline">
          <span class="timeline-range">${item.range}</span>
        </div>
        <h3>${item.title}</h3>
        <p class="timeline-org">${item.org}</p>
      `;
      list.appendChild(card);
    });
  }

  function renderAwards() {
    const grid = $("#awards-grid");
    grid.innerHTML = "";

    content.awards.forEach((award) => {
      const card = document.createElement("article");
      card.className = "award-card glass-panel interactive-surface";
      card.dataset.magnetic = "true";
      card.dataset.reveal = "true";
      card.innerHTML = `
        <span class="award-year">${award.year}</span>
        <h3>${award.title}</h3>
      `;
      grid.appendChild(card);
    });
  }

  function renderContact() {
    $("#contact-title").textContent = content.contact.title;
    $("#contact-body").textContent = content.contact.body;
    const footerNote = $("#footer-note");
    footerNote.textContent = content.contact.footnote || "";
    footerNote.hidden = !content.contact.footnote;

    const actions = $("#contact-actions");
    actions.innerHTML = "";

    ["email", "github", "scholar", "cv"].forEach((key) => {
      const href = getLink(key);
      if (!href) {
        return;
      }

      actions.appendChild(
        createButton({
          label: linkLabels[key],
          href,
          style: key === "email" ? "primary" : "secondary",
        })
      );
    });
  }

  function initScrollSpy() {
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

  function initReveal() {
    if (reduceMotion) {
      document.querySelectorAll("[data-reveal]").forEach((element) => {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
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

  function initTopbarState() {
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

  function initInteractiveSurfaces() {
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

  function renderProjects() {
    const grid = $("#projects-grid");
    grid.innerHTML = "";

    (content.projects || []).forEach((project) => {
      const card = document.createElement("article");
      card.className = "timeline-item glass-panel interactive-surface";
      card.dataset.magnetic = "true";
      card.dataset.reveal = "true";
      card.innerHTML = `
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-topline">
          <span class="timeline-range">${project.range || ""}</span>
        </div>
        <h3>${project.title}</h3>
        ${project.role ? `<p class="timeline-org">${project.role}</p>` : ""}
        ${project.description ? `<p class="project-desc">${project.description}</p>` : ""}
        ${project.link ? `
        <div class="publication-actions">
          <a class="glass-button secondary interactive-surface" data-magnetic href="${project.link}" target="_blank" rel="noreferrer noopener">
            <span>View Project</span>
            <span class="button-arrow" aria-hidden="true">&nearr;</span>
          </a>
        </div>` : ""}
      `;
      grid.appendChild(card);
    });
  }

  renderMeta();
  renderNavigation();
  renderHero();
  renderPublications();
  renderProjects();
  renderTimeline();
  renderAwards();
  renderContact();
  initScrollSpy();
  initReveal();
  initTopbarState();
  initInteractiveSurfaces();
})();
