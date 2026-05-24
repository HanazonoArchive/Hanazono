import { byId, formatDate, markdownToHtml } from "./utils.js";

const modal = byId("modal");
const modalTitle = byId("modal-title");
const modalKicker = byId("modal-kicker");
const modalMeta = byId("modal-meta");
const modalChips = byId("modal-chips");
const modalLinks = byId("modal-links");
const modalMarkdown = byId("modal-markdown");
const modalMedia = byId("modal-media");

// Skill to icon mapping
const skillIconMap = {
  "Python": "fab fa-python",
  "Java": "fab fa-java",
  "JavaScript": "fab fa-js",
  "HTML": "fab fa-html5",
  "CSS": "fab fa-css3",
  "PHP": "fab fa-php",
  "C/C++": "fas fa-copyright",
  "Kotlin": "fas fa-k",
  "SQL": "fas fa-database",
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
  "Windows": "fab fa-windows",
  "Android": "fab fa-android",
  "Linux": "fab fa-linux",
  "macOS": "fab fa-apple",
};

function getSkillIcon(skillName) {
  return skillIconMap[skillName] || "fas fa-star";
}

function appendChips(container, label, items, accentFirst = false) {
  if (!items || items.length === 0) {
    return;
  }
  
  // Create a section for this category
  const section = document.createElement("div");
  section.className = "modal-chip-section";
  
  // Add label if provided
  if (label) {
    const labelEl = document.createElement("div");
    labelEl.className = "modal-chip-label";
    labelEl.textContent = label;
    section.appendChild(labelEl);
  }
  
  // Create chip list for items
  const chipList = document.createElement("div");
  chipList.className = "chip-list";
  
  items.forEach((item, index) => {
    const chip = document.createElement("span");
    chip.className = "chip chip-with-icon";
    if (accentFirst && index === 0) {
      chip.classList.add("accent");
    }
    
    const icon = document.createElement("i");
    icon.className = getSkillIcon(item);
    
    const text = document.createElement("span");
    text.textContent = item;
    
    chip.appendChild(icon);
    chip.appendChild(text);
    chipList.appendChild(chip);
  });
  
  section.appendChild(chipList);
  container.appendChild(section);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function buildPdfSrc(path) {
  if (!path) {
    return path;
  }
  const base = path.split("#")[0];
  return `${base}#toolbar=0&navpanes=0&scrollbar=0`;
}

export function openModal(item, typeLabel) {
  modalTitle.textContent = item.title;
  modalKicker.textContent = typeLabel;

  const metaParts = [];
  if (item.date) {
    metaParts.push(formatDate(item.date));
  }
  if (item.certifier) {
    metaParts.push(item.certifier);
  }
  if (item.credential) {
    metaParts.push(item.credential);
  }
  modalMeta.textContent = metaParts.length ? metaParts.join(" | ") : "";

  modalChips.innerHTML = "";
  appendChips(modalChips, "Languages", item.languages, true);
  appendChips(modalChips, "Tools", item.tools);
  appendChips(modalChips, "Tags", item.tags, true);

  const imagePath = item.image || "";
  const isPdf = imagePath.toLowerCase().endsWith(".pdf");

  modalLinks.innerHTML = "";
  if (item.link) {
    const link = document.createElement("a");
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Visit link";
    modalLinks.appendChild(link);
  }
  if (isPdf) {
    const fileLink = document.createElement("a");
    fileLink.href = imagePath;
    fileLink.target = "_blank";
    fileLink.rel = "noopener noreferrer";
    fileLink.textContent = "Open file";
    modalLinks.appendChild(fileLink);
  }

  modalMedia.innerHTML = "";
  if (imagePath) {
    if (isPdf) {
      const frame = document.createElement("iframe");
      frame.src = buildPdfSrc(imagePath);
      frame.title = `${item.title} file`;
      frame.loading = "lazy";
      modalMedia.appendChild(frame);
    } else {
      const image = document.createElement("img");
      image.src = imagePath;
      image.alt = `${item.title} image`;
      modalMedia.appendChild(image);
    }
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "chip";
    placeholder.textContent = "No image provided";
    modalMedia.appendChild(placeholder);
  }

  modalMarkdown.innerHTML = markdownToHtml(item.body || "");

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

export function initModal() {
  modal.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-close]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}
