import { loadConfig, loadProfile, loadSkills, loadMarkdownItems } from "./data-loader.js";
import { byId, extractSummary, formatDate, renderChips } from "./utils.js";
import { initModal, openModal } from "./modal.js";

const state = {
  projects: [],
  certifications: [],
};

function renderProfile(profile, skills) {
  byId("profile-name").textContent = profile.name || "Your Name";
  byId("profile-major").textContent = profile.major || "Major";
  byId("profile-summary").textContent = profile.summary || "";
  byId("profile-tagline").textContent = profile.tagline || "";

  const focusPanel = profile.focus?.length ? profile.focus.join(" + ") : "";
  byId("profile-focus-panel").textContent = focusPanel;

  const stackPanel = skills.languages?.length
    ? skills.languages.slice(0, 6).join(", ")
    : "";
  byId("profile-stack-panel").textContent = stackPanel;

  const focusContainer = byId("profile-focus");
  renderChips(focusContainer, profile.focus || [], true);

  const linksContainer = byId("profile-links");
  linksContainer.innerHTML = "";
  if (profile.links && profile.links.length) {
    profile.links.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.textContent = link.label;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "chip";
      linksContainer.appendChild(anchor);
    });
  }
}

function renderSkills(skills) {
  renderChips(byId("skills-languages"), skills.languages || [], true);
  renderChips(byId("skills-tools"), skills.tools || []);
  renderChips(byId("skills-platforms"), skills.platforms || []);
}

function buildCard(item, typeLabel) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";

  const top = document.createElement("div");
  top.className = "card-top";
  const type = document.createElement("span");
  type.textContent = typeLabel;
  const date = document.createElement("span");
  date.textContent = item.date ? formatDate(item.date) : "";
  top.appendChild(type);
  top.appendChild(date);

  const title = document.createElement("h3");
  title.textContent = item.title;

  const summary = document.createElement("p");
  summary.className = "card-summary";
  summary.textContent = item.summary || extractSummary(item.body, "Add a short summary.");

  const chips = document.createElement("div");
  chips.className = "chip-list";
  if (item.languages?.length) {
    item.languages.slice(0, 3).forEach((lang, index) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      if (index === 0) {
        chip.classList.add("accent");
      }
      chip.textContent = lang;
      chips.appendChild(chip);
    });
  } else if (item.certifier) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item.certifier;
    chips.appendChild(chip);
  }

  card.appendChild(top);
  card.appendChild(title);
  card.appendChild(summary);
  card.appendChild(chips);

  return card;
}

function renderCardGrid(containerId, items, typeLabel) {
  const grid = byId(containerId);
  grid.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.textContent = "No items yet. Add a markdown file to the data folder.";
    grid.appendChild(empty);
    return;
  }
  items.forEach((item, index) => {
    const card = buildCard(item, typeLabel);
    card.dataset.index = String(index);
    card.dataset.type = typeLabel;
    grid.appendChild(card);
  });
}

function attachCardHandlers() {
  document.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card || !card.dataset.type) {
      return;
    }
    const typeLabel = card.dataset.type;
    const index = Number(card.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    const list = typeLabel === "Project" ? state.projects : state.certifications;
    const item = list[index];
    if (item) {
      openModal(item, typeLabel);
    }
  });
}

async function init() {
  try {
    const config = await loadConfig();
    const [profile, skills, projects, certifications] = await Promise.all([
      loadProfile(),
      loadSkills(),
      loadMarkdownItems("projects", config),
      loadMarkdownItems("certifications", config),
    ]);

    state.projects = projects;
    state.certifications = certifications;

    renderProfile(profile, skills);
    renderSkills(skills);
    renderCardGrid("projects-grid", projects, "Project");
    renderCardGrid("certifications-grid", certifications, "Certification");

    attachCardHandlers();
    initModal();
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", init);
