import { loadConfig, loadProfile, loadSkills, loadMarkdownItems } from "./data-loader.js";
import { byId, extractSummary, formatDate, renderChips, getSkillIcon } from "./utils.js";
import { initModal, openModal, openMediaLightbox, initMediaLightbox } from "./modal.js";

const state = {
  projects: [],
  certifications: [],
  explorations: [],
};

function setText(id, value) {
  const el = byId(id);
  if (el) {
    el.textContent = value || "";
  }
}

// ── Loading skeletons ──

function showSkeleton(containerId, count = 3) {
  const grid = byId(containerId);
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skel = document.createElement("div");
    skel.className = "card skeleton";
    skel.setAttribute("aria-hidden", "true");
    skel.innerHTML = `
      <div class="skeleton-line skeleton-short"></div>
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-body"></div>
      <div class="skeleton-line skeleton-body"></div>
      <div class="skeleton-chips">
        <span class="skeleton-chip"></span>
        <span class="skeleton-chip"></span>
        <span class="skeleton-chip"></span>
      </div>`;
    grid.appendChild(skel);
  }
}

function showError(containerId, message, retryFn) {
  const grid = byId(containerId);
  if (!grid) return;
  grid.innerHTML = "";
  const err = document.createElement("div");
  err.className = "card error-card";
  err.setAttribute("role", "alert");
  err.innerHTML = `
    <p style="color:var(--accent-1);margin:0 0 12px;"><i class="fas fa-exclamation-triangle"></i> ${message}</p>
    <button class="button retry-btn">Try again</button>`;
  grid.appendChild(err);
  err.querySelector(".retry-btn").addEventListener("click", retryFn);
}

// ── Profile rendering (also handles bio for the about page) ──

function renderProfile(profile, skills) {
  if (!profile) return;

  setText("profile-name", profile.name || "Your Name");
  setText("profile-major", profile.major || "Major");
  setText("profile-summary", profile.summary || "");
  setText("profile-tagline", profile.tagline || "");

  // About-page bio (data-driven)
  setText("profile-bio", profile.bio || "");
  setText("profile-education", profile.education ? `${profile.education} (${profile.educationYears || ""})` : "");
  setText("profile-education-name", profile.education || "");
  setText("profile-education-years", profile.educationYears || "");
  setText("profile-edu-major", profile.major || "");
  setText("profile-edu-focus", profile.focus?.length ? profile.focus.join(", ") : "");
  setText("profile-certifications", profile.certifications || "");

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

  // Certifications summary on about page
  const certsContainer = byId("profile-certifications");
  if (certsContainer && profile.certifications) {
    certsContainer.textContent = profile.certifications;
  }
}

// ── Skills ──

function renderSkillsWithIcons(container, skills, isAccent = false) {
  container.innerHTML = "";
  if (!skills || skills.length === 0) return;

  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "chip chip-with-icon";
    if (isAccent) chip.classList.add("accent");

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
  if (!skills) return;
  const languages = byId("skills-languages");
  const tools = byId("skills-tools");
  const platforms = byId("skills-platforms");

  if (languages) renderSkillsWithIcons(languages, skills.languages || [], true);
  if (tools) renderSkillsWithIcons(tools, skills.tools || []);
  if (platforms) renderSkillsWithIcons(platforms, skills.platforms || []);
}

// ── Cards ──

function buildCardImage(item) {
  const wrap = document.createElement("div");
  wrap.className = "card-image-wrap";

  const path = item.image || "";

  if (!path) {
    // Placeholder for items without any media
    const placeholder = document.createElement("div");
    placeholder.className = "card-image-placeholder";
    placeholder.innerHTML = `<i class="fas fa-folder-open"></i><span>No preview</span>`;
    wrap.appendChild(placeholder);
    return wrap;
  }

  const isPdfFile = path.toLowerCase().endsWith(".pdf");
  const isVideoFile = [".mp4", ".webm", ".mov"].some((e) => path.toLowerCase().endsWith(e));
  const isImageFile = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((e) => path.toLowerCase().endsWith(e));

  if (isPdfFile) {
    // Render PDF in the thumbnail — visually uniform with image/video cards
    wrap.classList.add("has-media", "is-pdf");
    const base = path.split("#")[0];
    const frame = document.createElement("iframe");
    frame.src = `${base}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    frame.title = `${item.title} preview`;
    frame.loading = "lazy";
    frame.setAttribute("tabindex", "-1");
    wrap.appendChild(frame);

    // Hover overlay
    const overlay = document.createElement("div");
    overlay.className = "card-image-overlay";
    overlay.innerHTML = `<i class="fas fa-expand"></i><span>Click to view PDF</span>`;
    wrap.appendChild(overlay);

    // No click handler — events fall through via pointer-events: none on the iframe
    return wrap;
  }

  if (isVideoFile || isImageFile) {
    wrap.classList.add("has-media");

    if (isVideoFile) {
      const vid = document.createElement("video");
      vid.src = path;
      vid.muted = true;
      vid.loop = false;
      vid.setAttribute("playsinline", "");
      wrap.appendChild(vid);
    } else {
      const img = document.createElement("img");
      img.src = path;
      img.alt = `${item.title} thumbnail`;
      img.loading = "lazy";
      wrap.appendChild(img);
    }

    // Hover overlay
    const overlay = document.createElement("div");
    overlay.className = "card-image-overlay";

    if (item.file) {
      // Has a separate file (e.g., PDF) — let card click open the modal instead
      overlay.innerHTML = `<i class="fas fa-expand"></i><span>Click to view document</span>`;
    } else {
      overlay.innerHTML = `<i class="fas fa-expand"></i><span>Click to see full image or video</span>`;
      // Click opens lightbox — stop propagation so card modal doesn't fire
      wrap.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        openMediaLightbox(item);
      });
    }

    wrap.appendChild(overlay);

    return wrap;
  }

  // Fallback placeholder for unrecognised media types
  const placeholder = document.createElement("div");
  placeholder.className = "card-image-placeholder";
  placeholder.innerHTML = `<i class="fas fa-file"></i><span>View details</span>`;
  wrap.appendChild(placeholder);
  return wrap;
}

function buildCard(item, typeLabel) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.setAttribute("aria-label", `${item.title} — ${typeLabel}`);

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
      if (index === 0) chip.classList.add("accent");
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
      if (index === 0) chip.classList.add("accent");
      const icon = document.createElement("i");
      icon.className = getSkillIcon(tag);
      const text = document.createElement("span");
      text.textContent = tag;
      chip.appendChild(icon);
      chip.appendChild(text);
      chips.appendChild(chip);
    });
  }

  // Uniform image section — thumbnail or placeholder
  const imgEl = buildCardImage(item);
  card.appendChild(imgEl);

  card.appendChild(top);
  card.appendChild(title);
  card.appendChild(summary);
  card.appendChild(chips);

  return card;
}

function renderCardGrid(containerId, items, typeLabel) {
  const grid = byId(containerId);
  if (!grid) return;
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

// ── Event delegation ──

function attachCardHandlers() {
  document.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card || !card.dataset.type) return;
    const typeLabel = card.dataset.type;
    const index = Number(card.dataset.index);
    if (Number.isNaN(index)) return;
    let list = [];
    if (typeLabel === "Project") list = state.projects;
    else if (typeLabel === "Certification") list = state.certifications;
    else if (typeLabel === "Explorations") list = state.explorations;
    const item = list[index];
    if (item) openModal(item, typeLabel);
  });
}

// ── Init ──

async function init() {
  const wantsProfile = Boolean(byId("profile-name") || byId("profile-major"));
  const wantsSkills = Boolean(byId("skills-languages") || byId("skills-tools") || byId("skills-platforms"));
  const wantsProjects = Boolean(byId("projects-grid"));
  const wantsCertifications = Boolean(byId("certifications-grid"));
  const wantsExplorations = Boolean(byId("explorations-grid"));

  // Show skeletons while loading
  if (wantsProjects) showSkeleton("projects-grid", 4);
  if (wantsCertifications) showSkeleton("certifications-grid", 2);
  if (wantsExplorations) showSkeleton("explorations-grid", 3);

  try {
    const config = await loadConfig();

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
      initMediaLightbox();
    }
  } catch (error) {
    console.error("Failed to load content:", error);
    // Show error states on any grids that were being loaded
    const retry = () => init();
    if (wantsProjects) showError("projects-grid", "Failed to load projects.", retry);
    if (wantsCertifications) showError("certifications-grid", "Failed to load certifications.", retry);
    if (wantsExplorations) showError("explorations-grid", "Failed to load explorations.", retry);
  }
}

document.addEventListener("DOMContentLoaded", init);
