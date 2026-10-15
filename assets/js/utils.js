import content from "../../data/site-content.js";
import { ICONS } from "./icons.js";

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function $(selector) {
  return document.querySelector(selector);
}

export function getLink(key) {
  return content.links && content.links[key] ? content.links[key] : "";
}

export function isExternalHref(href) {
  return /^https?:/i.test(href) || /^mailto:/i.test(href);
}

export function createButton({ label, href, style = "ghost", icon }) {
  const anchor = document.createElement("a");
  const iconSvg = icon && ICONS[icon] ? ICONS[icon] : "";

  anchor.className = `glass-button ${style} interactive-surface${iconSvg ? " has-icon" : ""}`;
  anchor.href = href;
  anchor.innerHTML = iconSvg ? `${iconSvg}<span class="sr-only">${label}</span>` : `<span>${label}</span>`;

  if (iconSvg) {
    anchor.setAttribute("aria-label", label);
  }

  if (isExternalHref(href)) {
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
  }

  return anchor;
}
