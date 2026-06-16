import { byId, formatDate, markdownToHtml, getSkillIcon } from "./utils.js";

const modal = byId("modal");
const modalTitle = byId("modal-title");
const modalKicker = byId("modal-kicker");
const modalMeta = byId("modal-meta");
const modalChips = byId("modal-chips");
const modalLinks = byId("modal-links");
const modalMarkdown = byId("modal-markdown");
const modalMedia = byId("modal-media");
const modalFilename = byId("modal-filename");

function appendChips(container, label, items, accentFirst = false) {
  if (!items || items.length === 0) {
    return;
  }

  const section = document.createElement("div");
  section.className = "modal-chip-section";

  if (label) {
    const labelEl = document.createElement("div");
    labelEl.className = "modal-chip-label";
    labelEl.textContent = label;
    section.appendChild(labelEl);
  }

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
  if (!path) return path;
  const base = path.split("#")[0];
  return `${base}#toolbar=0&navpanes=0&scrollbar=0`;
}

function isImage(path) {
  if (!path) return false;
  const extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"];
  return extensions.some(ext => path.toLowerCase().endsWith(ext));
}

function isVideo(path) {
  if (!path) return false;
  const extensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  return extensions.some(ext => path.toLowerCase().endsWith(ext));
}

function isPdf(path) {
  if (!path) return false;
  return path.toLowerCase().endsWith(".pdf");
}

// Map type label to file extension for the modal tab
function getTypeExtension(typeLabel) {
  const map = {
    "Project": ".project.tsx",
    "Certification": ".cert.json",
    "Explorations": ".exploration.md",
  };
  return map[typeLabel] || ".file";
}

// Generate a safe filename slug from the title
function getFilename(item, typeLabel) {
  if (item.title) {
    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const ext = getTypeExtension(typeLabel);
    return slug + ext;
  }
  return "file" + getTypeExtension(typeLabel);
}

export function openModal(item, typeLabel) {
  modalTitle.textContent = item.title;
  modalKicker.textContent = typeLabel;

  // Set the modal tab filename
  if (modalFilename) {
    modalFilename.textContent = getFilename(item, typeLabel);
  }

  const metaParts = [];
  if (item.date) metaParts.push(formatDate(item.date));
  if (item.certifier) metaParts.push(item.certifier);
  if (item.credential) metaParts.push(item.credential);
  modalMeta.textContent = metaParts.length ? metaParts.join(" | ") : "";

  modalChips.innerHTML = "";
  appendChips(modalChips, "Languages", item.languages, true);
  appendChips(modalChips, "Tools", item.tools);
  appendChips(modalChips, "Tags", item.tags, true);

  const mediaPath = item.file || item.image || "";
  const isPdfFile = isPdf(mediaPath);
  const isImageFile = isImage(mediaPath);
  const isVideoFile = isVideo(mediaPath);

  modalLinks.innerHTML = "";
  if (item.link) {
    const link = document.createElement("a");
    link.href = item.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Visit link";
    modalLinks.appendChild(link);
  }
  if (isPdfFile) {
    const fileLink = document.createElement("a");
    fileLink.href = mediaPath;
    fileLink.target = "_blank";
    fileLink.rel = "noopener noreferrer";
    fileLink.textContent = "Open file";
    modalLinks.appendChild(fileLink);
  }

  modalMedia.innerHTML = "";
  if (mediaPath) {
    if (isPdfFile) {
      const frame = document.createElement("iframe");
      frame.src = buildPdfSrc(mediaPath);
      frame.title = `${item.title} file`;
      frame.loading = "lazy";
      modalMedia.appendChild(frame);
    } else if (isVideoFile) {
      const video = document.createElement("video");
      video.src = mediaPath;
      video.controls = true;
      video.autoplay = false;
      video.loop = false;
      video.muted = false;
      video.setAttribute("playsinline", "");
      video.style.width = "100%";
      video.style.maxHeight = "400px";
      video.style.borderRadius = "8px";
      modalMedia.appendChild(video);
    } else if (isImageFile) {
      const image = document.createElement("img");
      image.src = mediaPath;
      image.alt = `${item.title} image`;
      modalMedia.appendChild(image);
    } else {
      const unsupported = document.createElement("div");
      unsupported.className = "chip";
      unsupported.textContent = "Unsupported media type";
      modalMedia.appendChild(unsupported);
    }
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "chip";
    placeholder.textContent = "No media provided";
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

// ── Full-screen media lightbox ──

let _lightbox = null;

function getLightbox() {
  if (!_lightbox) {
    _lightbox = document.createElement("div");
    _lightbox.className = "media-lightbox";
    _lightbox.setAttribute("aria-hidden", "true");
    _lightbox.innerHTML = `
      <div class="media-lightbox-overlay" data-lb-close></div>
      <div class="media-lightbox-container">
        <button class="media-lightbox-close" data-lb-close aria-label="Close lightbox">&times;</button>
        <div class="media-lightbox-media" id="lightbox-media"></div>
        <div class="media-lightbox-caption" id="lightbox-caption"></div>
      </div>`;
    document.body.appendChild(_lightbox);
  }
  return _lightbox;
}

function closeMediaLightbox() {
  const lb = getLightbox();
  lb.classList.remove("is-open");
  lb.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  const video = lb.querySelector("video");
  if (video) video.pause();
}

export function openMediaLightbox(item) {
  const mediaPath = item.image || "";
  if (!mediaPath) return;

  const isImageFile = isImage(mediaPath);
  const isVideoFile = isVideo(mediaPath);

  const lb = getLightbox();
  const mediaEl = lb.querySelector("#lightbox-media");
  const captionEl = lb.querySelector("#lightbox-caption");

  mediaEl.innerHTML = "";

  if (isImageFile) {
    const img = document.createElement("img");
    img.src = mediaPath;
    img.alt = `${item.title} image`;
    mediaEl.appendChild(img);
    captionEl.innerHTML = `<strong>${item.title}</strong>`;
  } else if (isVideoFile) {
    const video = document.createElement("video");
    video.src = mediaPath;
    video.controls = true;
    video.autoplay = true;
    video.setAttribute("playsinline", "");
    mediaEl.appendChild(video);
    captionEl.innerHTML = `<strong>${item.title}</strong>`;
  } else {
    return;
  }

  lb.classList.add("is-open");
  lb.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

export function initMediaLightbox() {
  const lb = getLightbox();

  lb.addEventListener("click", (event) => {
    if (event.target.matches("[data-lb-close]")) {
      closeMediaLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lb.classList.contains("is-open")) {
      closeMediaLightbox();
    }
  });
}
