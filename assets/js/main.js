import content from "../../data/site-content.js";
import {
  renderMeta,
  renderNavigation,
  renderHero,
  renderNews,
  renderPublications,
  renderProjects,
  renderHonors,
} from "./render.js";
import {
  initScrollSpy,
  initReveal,
  initTopbarState,
  initInteractiveSurfaces,
  initPublicationFilter,
  initMagneticButtons,
  initHeroParallax,
  initPortraitHolo,
  initScrollProgress,
} from "./interactions.js";
import { initCursorGlow } from "./cursor-glow.js";

if (content) {
  renderMeta();
  renderNavigation();
  renderHero();
  renderNews();
  renderPublications();
  renderProjects();
  renderHonors();
  initScrollSpy();
  initReveal();
  initTopbarState();
  initInteractiveSurfaces();
  initPublicationFilter();
  initMagneticButtons();
  initHeroParallax();
  initPortraitHolo();
  initScrollProgress();
  initCursorGlow();
}
