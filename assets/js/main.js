import { loadConfig, loadProfile, loadSkills, loadMarkdownItems } from "./data-loader.js";
import { byId, extractSummary, formatDate, renderChips } from "./utils.js";
import { initModal, openModal } from "./modal.js";

const state = {
  projects: [],
  certifications: [],
  explorations: [],
};

// Skill to icon mapping using Font Awesome
const skillIconMap = {
  // Languages
  "Python": "fab fa-python",
  "Java": "fab fa-java",
  "JavaScript": "fab fa-js",
  "HTML": "fab fa-html5",
  "CSS": "fab fa-css3",
  "PHP": "fab fa-php",
  "C/C++": "fas fa-copyright",
  "Kotlin": "fas fa-k",
  "SQL": "fas fa-database",
  
  // Tools & Frameworks
  "Git": "fab fa-git",
  "GitHub": "fab fa-github",
  "VS Code": "fas fa-code",
  "IntelliJ IDEA": "fas fa-terminal",
  "PyCharm": "fas fa-terminal",
  "Django": "fas fa-leaf",
  "Node.js": "fab fa-node-js",
  "React": "fab fa-react",
  "npm": "fab fa-npm",
  "Gradle": "fas fa-hammer",
  "Maven": "fas fa-hammer",
  "Docker": "fab fa-docker",
  "Jupyter": "fas fa-book",
  "MySQL": "fas fa-database",
  "SQLite": "fas fa-database",
  "Wireshark": "fas fa-network-wired",
  "GitHub Actions": "fab fa-github",
  "Electron": "fas fa-desktop",
  "Matplotlib": "fas fa-chart-bar",
  
  // Platforms
  "Windows": "fab fa-windows",
  "Android": "fab fa-android",
  "Linux": "fab fa-linux",
  "macOS": "fab fa-apple",
};

function getSkillIcon(skillName) {
  return skillIconMap[skillName] || "fas fa-star";
}

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

function renderSkillsWithIcons(container, skills, isAccent = false) {
  container.innerHTML = "";
  if (!skills || skills.length === 0) {
    return;
  }
  
  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "chip chip-with-icon";
    if (isAccent) {
      chip.classList.add("accent");
    }
    
    const icon = document.createElement("i");
    icon.className = getSkillIcon(skill);
    
    const text = document.createElement("span");
    text.textContent = skill;
    
    chip.appendChild(icon);
    chip.appendChild(text);
    container.appendChild(chip);
  });
}

function renderSkills(skills) {
  if (!skills) {
    return;
  }
  const languages = byId("skills-languages");
  const tools = byId("skills-tools");
  const platforms = byId("skills-platforms");
  
  if (languages) {
    renderSkillsWithIcons(languages, skills.languages || [], true);
  }
  if (tools) {
    renderSkillsWithIcons(tools, skills.tools || []);
  }
  if (platforms) {
    renderSkillsWithIcons(platforms, skills.platforms || []);
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
      chip.className = "chip chip-with-icon";
      if (index === 0) {
        chip.classList.add("accent");
      }
      
      const icon = document.createElement("i");
      icon.className = getSkillIcon(lang);
      
      const text = document.createElement("span");
      text.textContent = lang;
      
      chip.appendChild(icon);
      chip.appendChild(text);
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
      chip.className = "chip chip-with-icon";
      if (index === 0) {
        chip.classList.add("accent");
      }
      
      const icon = document.createElement("i");
      icon.className = getSkillIcon(tag);
      
      const text = document.createElement("span");
      text.textContent = tag;
      
      chip.appendChild(icon);
      chip.appendChild(text);
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
    } else if (typeLabel === "Explorations") {
      list = state.explorations;
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
    const wantsExplorations = Boolean(byId("explorations-grid"));

    const [profile, skills, projects, certifications, explorations] = await Promise.all([
      wantsProfile ? loadProfile() : Promise.resolve(null),
      wantsSkills || wantsProfile ? loadSkills() : Promise.resolve(null),
      wantsProjects ? loadMarkdownItems("projects", config) : Promise.resolve([]),
      wantsCertifications ? loadMarkdownItems("certifications", config) : Promise.resolve([]),
      wantsExplorations ? loadMarkdownItems("explorations", config) : Promise.resolve([]),
    ]);

    state.projects = projects;
    state.certifications = certifications;
    state.explorations = explorations;

    renderProfile(profile, skills);
    renderSkills(skills);
    renderCardGrid("projects-grid", projects, "Project");
    renderCardGrid("certifications-grid", certifications, "Certification");
    renderCardGrid("explorations-grid", explorations, "Explorations");

    if (wantsProjects || wantsCertifications || wantsExplorations) {
      attachCardHandlers();
      initModal();
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", init);
