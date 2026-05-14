import { byId, formatDate, markdownToHtml } from "./utils.js";

const modal = byId("modal");
const modalTitle = byId("modal-title");
const modalKicker = byId("modal-kicker");
const modalMeta = byId("modal-meta");
const modalChips = byId("modal-chips");
const modalLinks = byId("modal-links");
const modalMarkdown = byId("modal-markdown");
const modalMedia = byId("modal-media");

function appendChips(container, label, items, accentFirst = false) {
  if (!items || items.length === 0) {
    return;
  }
  if (label) {
    const labelChip = document.createElement("span");
    labelChip.className = "chip";
    labelChip.textContent = label;
    container.appendChild(labelChip);
  }
  items.forEach((item, index) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    if (accentFirst && index === 0) {
      chip.classList.add("accent");
    }
    chip.textContent = item;
    container.appendChild(chip);
  });
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
