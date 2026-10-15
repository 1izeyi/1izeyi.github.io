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
} from "./interactions.js";

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
}
