import content from "../../data/site-content.js";
import { $, getLink, createButton } from "./utils.js";

export function renderMeta() {
  document.title = content.meta.title;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = content.meta.description;
  }
}

export function renderNavigation() {
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
    link.dataset.navTarget = item.href.slice(1);
    link.textContent = item.label;
    nav.appendChild(link);
  });
}

export function renderHero() {
  $("#hero-kicker").textContent = content.profile.kicker;
  $("#hero-name").textContent = content.profile.name;
  $("#hero-status").textContent = content.profile.status;
  $("#hero-advisors").textContent = (content.profile.advisors || []).join(" & ");
  $("#hero-affiliation").textContent = content.profile.affiliation;
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
        icon: action.icon,
      })
    );
  });
}

function renderAuthors(publication) {
  return publication.authors
    .map((author) => {
      const isHighlight = publication.highlightAuthors.includes(author);
      const isCo = (publication.coFirstAuthors || []).includes(author);
      const isCorresponding = (publication.correspondingAuthors || []).includes(author);
      const star = isCo ? `<sup>*</sup>` : "";
      const dagger = isCorresponding ? `<sup>&dagger;</sup>` : "";
      return isHighlight
        ? `<span class="author-emphasis">${author}${star}${dagger}</span>`
        : `<span>${author}${star}${dagger}</span>`;
    })
    .join(", ");
}

export function renderNews() {
  const section = $("#news");
  const list = $("#news-list");
  const items = content.news || [];

  section.hidden = items.length === 0;
  list.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "news-item";
    row.innerHTML = `
      <span class="news-date">${item.date || ""}</span>
      <p class="news-text">${item.text}</p>
    `;
    list.appendChild(row);
  });
}

export function renderPublications() {
  const grid = $("#publications-grid");
  grid.innerHTML = "";

  content.publications.forEach((publication, index) => {
    const card = document.createElement("article");
    const bodyId = `publication-body-${index}`;
    card.className = "publication-card glass-panel";
    card.dataset.reveal = "true";
    card.innerHTML = `
      <button class="publication-toggle" type="button" aria-expanded="false" aria-controls="${bodyId}">
        <span class="publication-badge">${publication.venue}</span>
        <span class="publication-title">${publication.title}</span>
      </button>
      <div class="publication-body" id="${bodyId}">
        <div class="publication-body-clip">
          <div class="publication-body-inner">
            <div class="publication-image-wrap">
              <img
                class="publication-image"
                src="${publication.image}"
                alt="${publication.title}"
                loading="lazy"
                decoding="async"
              >
            </div>
            <div class="publication-copy">
              <p class="publication-authors">${renderAuthors(publication)}</p>
              ${publication.note ? `<p class="publication-note">${publication.note}</p>` : ""}
              <div class="publication-actions">
                <a
                  class="glass-button secondary interactive-surface"
                  href="${publication.link}"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span>View</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const toggle = card.querySelector(".publication-toggle");
    toggle.addEventListener("click", () => {
      const wasOpen = card.classList.contains("is-open");

      grid.querySelectorAll(".publication-card.is-open").forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".publication-toggle").setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        card.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });

    grid.appendChild(card);
  });
}

export function renderHonors() {
  const section = $("#honors");
  const list = $("#honors-list");
  const items = content.honors || [];

  section.hidden = items.length === 0;
  list.innerHTML = "";

  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "honor-item glass-panel";
    row.dataset.reveal = "true";
    row.dataset.revealDelay = String(index * 120);
    row.innerHTML = `
      <p class="honor-title">${item.title}</p>
      <span class="honor-date">${item.date || ""}</span>
    `;
    list.appendChild(row);
  });
}

export function renderProjects() {
  const grid = $("#projects-grid");
  grid.innerHTML = "";

  (content.projects || []).forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "timeline-item glass-panel interactive-surface";
    card.dataset.reveal = "true";
    card.dataset.revealDelay = String(index * 120);
    card.innerHTML = `
      <div class="timeline-topline">
        <h3>${project.title}</h3>
        <span class="timeline-range">${project.range || ""}</span>
      </div>
      ${project.role ? `<p class="timeline-org">${project.role}</p>` : ""}
      ${project.description ? `<p class="project-desc">${project.description}</p>` : ""}
      ${project.link ? `
      <div class="publication-actions">
        <a class="glass-button secondary interactive-surface" href="${project.link}" target="_blank" rel="noreferrer noopener">
          <span>View Project</span>
        </a>
      </div>` : ""}
    `;
    grid.appendChild(card);
  });
}
