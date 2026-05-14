import { loadConfig, loadProfile, loadSkills, loadMarkdownItems } from "./data-loader.js";
import { byId, extractSummary, formatDate, renderChips } from "./utils.js";
import { initModal, openModal } from "./modal.js";

const state = {
  projects: [],
  certifications: [],
  unrelated: [],
};

function setText(id, value) {
  const el = byId(id);
  if (el) {
    el.textContent = value || "";
  }
}

function renderProfile(profile, skills) {
  if (!profile) {
    return;
  }
  setText("profile-name", profile.name || "Your Name");
  setText("profile-major", profile.major || "Major");
  setText("profile-summary", profile.summary || "");
  setText("profile-tagline", profile.tagline || "");

  const focusPanel = profile.focus?.length ? profile.focus.join(" + ") : "";
  setText("profile-focus-panel", focusPanel);

  const stackPanel = skills?.languages?.length
    ? skills.languages.slice(0, 6).join(", ")
    : "";
  setText("profile-stack-panel", stackPanel);

  const focusContainer = byId("profile-focus");
  if (focusContainer) {
    renderChips(focusContainer, profile.focus || [], true);
  }

  const linksContainer = byId("profile-links");
  if (linksContainer) {
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
}

function renderSkills(skills) {
  if (!skills) {
    return;
  }
  const languages = byId("skills-languages");
  const tools = byId("skills-tools");
  const platforms = byId("skills-platforms");
  if (languages) {
    renderChips(languages, skills.languages || [], true);
  }
  if (tools) {
    renderChips(tools, skills.tools || []);
  }
  if (platforms) {
    renderChips(platforms, skills.platforms || []);
  }
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
  } else if (item.tags?.length) {
    item.tags.slice(0, 3).forEach((tag, index) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      if (index === 0) {
        chip.classList.add("accent");
      }
      chip.textContent = tag;
      chips.appendChild(chip);
    });
  }

  card.appendChild(top);
  card.appendChild(title);
  card.appendChild(summary);
  card.appendChild(chips);

  return card;
}

function renderCardGrid(containerId, items, typeLabel) {
  const grid = byId(containerId);
  if (!grid) {
    return;
  }
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
    let list = [];
    if (typeLabel === "Project") {
      list = state.projects;
    } else if (typeLabel === "Certification") {
      list = state.certifications;
    } else if (typeLabel === "Unrelated") {
      list = state.unrelated;
    }
    const item = list[index];
    if (item) {
      openModal(item, typeLabel);
    }
  });
}

async function init() {
  try {
    const config = await loadConfig();
    const wantsProfile = Boolean(byId("profile-name") || byId("profile-major"));
    const wantsSkills = Boolean(
      byId("skills-languages") || byId("skills-tools") || byId("skills-platforms")
    );
    const wantsProjects = Boolean(byId("projects-grid"));
    const wantsCertifications = Boolean(byId("certifications-grid"));
    const wantsUnrelated = Boolean(byId("unrelated-grid"));

    const [profile, skills, projects, certifications, unrelated] = await Promise.all([
      wantsProfile ? loadProfile() : Promise.resolve(null),
      wantsSkills || wantsProfile ? loadSkills() : Promise.resolve(null),
      wantsProjects ? loadMarkdownItems("projects", config) : Promise.resolve([]),
      wantsCertifications ? loadMarkdownItems("certifications", config) : Promise.resolve([]),
      wantsUnrelated ? loadMarkdownItems("unrelated", config) : Promise.resolve([]),
    ]);

    state.projects = projects;
    state.certifications = certifications;
    state.unrelated = unrelated;

    renderProfile(profile, skills);
    renderSkills(skills);
    renderCardGrid("projects-grid", projects, "Project");
    renderCardGrid("certifications-grid", certifications, "Certification");
    renderCardGrid("unrelated-grid", unrelated, "Unrelated");

    if (wantsProjects || wantsCertifications || wantsUnrelated) {
      attachCardHandlers();
      initModal();
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", init);
