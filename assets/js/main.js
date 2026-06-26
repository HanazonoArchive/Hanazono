import { loadConfig, loadProfile, loadSkills, loadMarkdownItems, loadActiveProfile, loadActiveProfileSkills } from "./data-loader.js";
import { byId, extractSummary, formatDate, renderChips, getSkillIcon } from "./utils.js";
import { initModal, openModal, openMediaLightbox, initMediaLightbox } from "./modal.js";

const state = {
  projects: [],
  certifications: [],
  explorations: [],
  activeProfile: "generalist",
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
    skel.className = "code-card skeleton";
    skel.setAttribute("aria-hidden", "true");
    skel.innerHTML =
      '<div class="code-card-tab">' +
        '<span class="skeleton-line skeleton-short" style="width:50px;height:10px;"></span>' +
      '</div>' +
      '<div class="code-card-body" style="padding:12px;flex-direction:column;gap:10px;">' +
        '<div class="skeleton-line skeleton-short"></div>' +
        '<div class="skeleton-line skeleton-title"></div>' +
        '<div class="skeleton-line skeleton-body"></div>' +
        '<div class="skeleton-line skeleton-body"></div>' +
        '<div class="skeleton-chips">' +
          '<span class="skeleton-chip"></span>' +
          '<span class="skeleton-chip"></span>' +
          '<span class="skeleton-chip"></span>' +
        '</div>' +
      '</div>';
    grid.appendChild(skel);
  }
}

function showError(containerId, message, retryFn) {
  const grid = byId(containerId);
  if (!grid) return;
  grid.innerHTML = "";
  const err = document.createElement("div");
  err.className = "code-card error-card";
  err.setAttribute("role", "alert");
  err.innerHTML =
    '<div class="code-card-body" style="padding:20px;flex-direction:column;align-items:center;text-align:center;">' +
      '<p style="color:var(--syntax-keyword);margin:0 0 12px;"><i class="fas fa-exclamation-triangle"></i> ' + message + '</p>' +
      '<button class="button retry-btn">Try again</button>' +
    '</div>';
  grid.appendChild(err);
  err.querySelector(".retry-btn").addEventListener("click", retryFn);
}

// ── Profile rendering ──

function renderProfile(profile, skills) {
  if (!profile) return;

  setText("profile-name", profile.name || "Your Name");
  setText("profile-major", profile.major || "Major");
  setText("profile-summary", profile.summary || "");
  setText("profile-tagline", profile.tagline || "");

  // Set terminal commands from profile homeCommands
  const cmds = profile.homeCommands;
  if (cmds) {
    setText("cmd-whoami", cmds.whoami || "");
    setText("cmd-philosophy", cmds.philosophy || "");
    setText("cmd-focus", cmds.focus || "");
    setText("cmd-status", cmds.status || "");
    setText("cmd-current", cmds.current || "");
  }

  // Homepage terminal hero: focus output
  setText("profile-focus-output", profile.focus && profile.focus.length ? profile.focus.join(" / ") : "");

  // About-page bio
  setText("profile-bio", profile.bio || "");
  setText("profile-education", profile.education ? profile.education + ' (' + (profile.educationYears || "") + ')' : "");
  setText("profile-education-name", profile.education || "");
  setText("profile-education-years", profile.educationYears || "");
  setText("profile-edu-major", profile.major || "");
  setText("profile-edu-focus", profile.focus && profile.focus.length ? profile.focus.join(", ") : "");
  setText("profile-certifications", profile.certifications || "");

  // Focus chips (about page doc-card and homepage)
  const focusContainer = byId("profile-focus");
  if (focusContainer) {
    renderChips(focusContainer, profile.focus || [], true);
  }

  // Links
  const linksContainer = byId("profile-links");
  if (linksContainer) {
    linksContainer.innerHTML = "";
    if (profile.links && profile.links.length) {
      const linkIcons = {
        "GitHub": "fab fa-github",
        "LinkedIn": "fab fa-linkedin",
        "Resume": "fas fa-file-pdf",
        "Email": "fas fa-envelope"
      };
      profile.links.forEach((link) => {
        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.className = "chip";
        const icon = document.createElement("i");
        icon.className = linkIcons[link.label] || "fas fa-link";
        anchor.appendChild(icon);
        anchor.appendChild(document.createTextNode(link.label));
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.className = "chip";
        linksContainer.appendChild(anchor);
      });
    }
  }

  // Homepage: status line
  setText("profile-status", profile.status || "");

  // Certs on about page
  var certsContainer = byId("profile-certifications");
  if (certsContainer && profile.certifications) {
    certsContainer.textContent = profile.certifications;
  }

  // About: What I Do
  var whatIDoContainer = byId("what-i-do-container");
  if (whatIDoContainer && profile.whatIDo && profile.whatIDo.length) {
    whatIDoContainer.innerHTML = "";
    var introP = document.createElement("p");
    introP.textContent = "I build software across the stack — from web frontends to backend systems, from machine learning pipelines to reverse engineering tools. I don't chase hype. I pick the right tool for the job and make sure it works before moving on.";
    whatIDoContainer.appendChild(introP);
    profile.whatIDo.forEach(function(item, i) {
      var p = document.createElement("p");
      p.style.cssText = "margin-top: " + (i === 0 ? "16px" : "0") + ";";
      var strong = document.createElement("strong");
      strong.style.cssText = "color: var(--accent-2);";
      strong.textContent = item.title;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(" — " + item.description));
      whatIDoContainer.appendChild(p);
    });
  }

  // About: Philosophy
  var philosophyContainer = byId("philosophy-container");
  if (philosophyContainer && profile.philosophy && profile.philosophy.length) {
    philosophyContainer.innerHTML = "";
    profile.philosophy.forEach(function(line, i) {
      var p = document.createElement("p");
      if (i > 0) p.style.cssText = "margin-top: 12px;";
      p.textContent = line;
      philosophyContainer.appendChild(p);
    });
  }

  document.dispatchEvent(new CustomEvent("profile-ready"));
}

// ── Skills rendering (code block style) ──

function renderSkills(skills) {
  if (!skills) return;

  const linesEl = byId("skills-code-lines");
  const gutterEl = byId("skills-gutter");

  if (!linesEl) {
    // Fallback: old chip-list rendering
    const languages = byId("skills-languages");
    const tools = byId("skills-tools");
    const platforms = byId("skills-platforms");

    if (languages) renderSkillsWithIcons(languages, skills.languages || [], true);
    if (tools) renderSkillsWithIcons(tools, skills.tools || []);
    if (platforms) renderSkillsWithIcons(platforms, skills.platforms || []);
    return;
  }

  // Build code block lines
  var lines = [];

  // Comment header
  lines.push('<span class="comment">// Skills &amp; Toolkit</span>');
  lines.push("");
  lines.push('<span class="comment">// Languages (production dependencies)</span>');
  lines.push('<span class="keyword">const</span> <span class="variable">languages</span> <span class="operator">=</span> <span class="punctuation">[</span>');

  if (skills.languages && skills.languages.length) {
    skills.languages.forEach(function(lang, i) {
      var comma = i < skills.languages.length - 1 ? "," : "";
      lines.push('  <span class="string">"' + lang + '"</span>' + comma);
    });
  }

  lines.push('<span class="punctuation">];</span>');
  lines.push("");

  // Tools
  lines.push('<span class="comment">// Tools (dev dependencies)</span>');
  lines.push('<span class="keyword">const</span> <span class="variable">tools</span> <span class="operator">=</span> <span class="punctuation">[</span>');

  if (skills.tools && skills.tools.length) {
    skills.tools.forEach(function(tool, i) {
      var comma = i < skills.tools.length - 1 ? "," : "";
      lines.push('  <span class="string">"' + tool + '"</span>' + comma);
    });
  }

  lines.push('<span class="punctuation">];</span>');
  lines.push("");

  // Platforms
  lines.push('<span class="comment">// Platforms (engines)</span>');
  lines.push('<span class="keyword">const</span> <span class="variable">platforms</span> <span class="operator">=</span> <span class="punctuation">[</span>');

  if (skills.platforms && skills.platforms.length) {
    skills.platforms.forEach(function(platform, i) {
      var comma = i < skills.platforms.length - 1 ? "," : "";
      lines.push('  <span class="string">"' + platform + '"</span>' + comma);
    });
  }

  lines.push('<span class="punctuation">];</span>');
  lines.push("");
  lines.push('<span class="comment">// EOF</span>');

  // Render lines (gutter numbers come from CSS counters)
  var linesHtml = lines.map(function(line) { return '<div class="code-block-line">' + (line || "&nbsp;") + '</div>'; }).join("");
  linesEl.innerHTML = linesHtml;
}

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

// ── Cards (Code-Card style) ──

// Generate a safe filename slug from the title
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Determine the file extension for the card tab based on type
function getFileExtension(typeLabel) {
  if (typeLabel === "Project") return ".tsx";
  if (typeLabel === "Certification") return ".json";
  if (typeLabel === "Explorations") return ".md";
  return ".file";
}

function buildCardImage(item) {
  const wrap = document.createElement("div");
  wrap.className = "code-card-image";

  const path = item.image || "";

  if (!path) {
    const placeholder = document.createElement("div");
    placeholder.className = "code-card-image-placeholder";
    placeholder.innerHTML = '<i class="fas fa-folder-open"></i><span>No preview</span>';
    wrap.appendChild(placeholder);
    return wrap;
  }

  const isPdfFile = path.toLowerCase().endsWith(".pdf");
  const isVideoFile = [".mp4", ".webm", ".mov"].some((e) => path.toLowerCase().endsWith(e));
  const isImageFile = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((e) => path.toLowerCase().endsWith(e));

  if (isPdfFile) {
    wrap.classList.add("is-pdf");
    const base = path.split("#")[0];
    const frame = document.createElement("iframe");
    frame.src = base + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH';
    frame.title = item.title + ' preview';
    frame.loading = "lazy";
    frame.setAttribute("tabindex", "-1");
    wrap.appendChild(frame);

    const overlay = document.createElement("div");
    overlay.className = "code-card-image-overlay";
    overlay.innerHTML = '<i class="fas fa-expand"></i><span>Click to view PDF</span>';
    wrap.appendChild(overlay);
    return wrap;
  }

  if (isVideoFile || isImageFile) {
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
      img.alt = item.title + ' thumbnail';
      img.loading = "lazy";
      wrap.appendChild(img);
    }

    const overlay = document.createElement("div");
    overlay.className = "code-card-image-overlay";

    if (item.file) {
      overlay.innerHTML = '<i class="fas fa-expand"></i><span>Click to view document</span>';
    } else {
      overlay.innerHTML = '<i class="fas fa-expand"></i><span>Click to see full image or video</span>';
      wrap.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        openMediaLightbox(item);
      });
    }

    wrap.appendChild(overlay);
    return wrap;
  }

  // Fallback placeholder
  const placeholder = document.createElement("div");
  placeholder.className = "code-card-image-placeholder";
  placeholder.innerHTML = '<i class="fas fa-file"></i><span>View details</span>';
  wrap.appendChild(placeholder);
  return wrap;
}

function buildCard(item, typeLabel) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "code-card";
  if (item.rarity) card.classList.add("rarity-" + item.rarity);
  card.setAttribute("aria-label", item.title + " - " + typeLabel);

  // Tab bar at top of card
  var tab = document.createElement("div");
  tab.className = "code-card-tab";
  var filename = titleToSlug(item.title || "file");
  var ext = getFileExtension(typeLabel);

  // Rarity icon — leftmost
  var rarityHtml = '';
  if (item.rarity) {
    var rarityIcons = {
      diamond: 'fa-gem',
      platinum: 'fa-crown',
      gold: 'fa-star',
      silver: 'fa-medal',
      bronze: 'fa-medal'
    };
    var rarityColors = {
      diamond: '#b9f2ff',
      platinum: '#e5e4e2',
      gold: '#ffd700',
      silver: '#c0c0c0',
      bronze: '#cd7f32'
    };
    var iconClass = rarityIcons[item.rarity] || 'fa-star';
    var iconColor = rarityColors[item.rarity] || 'var(--muted)';
    var rarityTitle = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
    rarityHtml = '<span class="code-card-tab-rarity" title="' + rarityTitle + '" style="color:' + iconColor + ';font-size:0.75rem;opacity:0.9;flex-shrink:0;"><i class="fas ' + iconClass + '"></i></span>';
  }

  tab.innerHTML = rarityHtml +
    '<span class="code-card-tab-icon"><i class="fas fa-file-code"></i></span>' +
    '<span class="code-card-tab-filename">' + filename + ext + '</span>' +
    '<span class="code-card-tab-lang">' + typeLabel + '</span>';

  card.appendChild(tab);

  // Image/thumbnail
  const imgWrap = buildCardImage(item);
  card.appendChild(imgWrap);

  // Code body with gutter + lines
  const body = document.createElement("div");
  body.className = "code-card-body";

  // Gutter — line numbers
  var gutter = document.createElement("div");
  gutter.className = "code-card-gutter";
  for (var i = 1; i <= 5; i++) {
    var num = document.createElement("span");
    num.className = "line-num";
    num.textContent = String(i);
    gutter.appendChild(num);
  }

  // Code lines — raw aesthetic, no function/const keywords
  var lines = document.createElement("div");
  lines.className = "code-card-lines";

  // Build stack string
  var stackItems = [];
  if (item.languages && item.languages.length) stackItems = item.languages.slice(0, 5);
  else if (item.certifier) stackItems = [item.certifier];
  else if (item.tags && item.tags.length) stackItems = item.tags.slice(0, 5);

  // Compose lines
  var codeLines = [];

  // Line 1: comment with date
  var dateStr = item.date ? formatDate(item.date) : '';
  codeLines.push('<span class="comment">// ' + (dateStr || '----') + '</span>');

  // Line 2: title — keep original format
  codeLines.push('  <span class="function-name">' + (item.title || "untitled") + '</span>');

  // Line 3: summary as string
  var summary = item.summary || extractSummary(item.body, "");
  if (summary) {
    var escaped = summary.replace(/"/g, "&quot;");
    codeLines.push('  <span class="string">"' + escaped + '"</span>');
  } else {
    codeLines.push('  <span class="comment">// no description</span>');
  }

  // Line 4: stack
  if (stackItems.length) {
    codeLines.push('  <span class="variable">' + stackItems.join("  <span class=\"comment\">|</span>  ") + '</span>');
  } else {
    codeLines.push('  <span class="comment">// </span>');
  }

  // Line 5: empty
  codeLines.push('');

  // Render lines into the container
  var linesHtml = '';
  for (var j = 0; j < codeLines.length; j++) {
    linesHtml += '<div class="code-line">' + (codeLines[j] || '&nbsp;') + '</div>';
  }
  lines.innerHTML = linesHtml;

  body.appendChild(gutter);
  body.appendChild(lines);
  card.appendChild(body);

  return card;
}

function renderCardGrid(containerId, items, typeLabel) {
  const grid = byId(containerId);
  if (!grid) return;
  grid.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "code-card";
    empty.innerHTML = '<div class="code-card-body" style="padding:20px;justify-content:center;">' +
      '<span class="comment">// No items yet. Add a markdown file to the data folder.</span>' +
    '</div>';
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
    const card = event.target.closest(".code-card");
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
  const wantsProfile = Boolean(byId("profile-name") || byId("profile-major") || byId("profile-links"));
  const wantsSkills = Boolean(byId("skills-languages") || byId("skills-tools") || byId("skills-platforms") || byId("skills-code-lines"));
  const wantsProjects = Boolean(byId("projects-grid"));
  const wantsCertifications = Boolean(byId("certifications-grid"));
  const wantsExplorations = Boolean(byId("explorations-grid"));

  // Show skeletons while loading
  if (wantsProjects) showSkeleton("projects-grid", 4);
  if (wantsCertifications) showSkeleton("certifications-grid", 2);
  if (wantsExplorations) showSkeleton("explorations-grid", 3);

  try {
    const config = await loadConfig();
    const activeProfile = config?.profile || "generalist";
    state.activeProfile = activeProfile;

    const [profile, skills, projects, certifications, explorations] = await Promise.all([
      wantsProfile ? loadActiveProfile(config) : Promise.resolve(null),
      wantsSkills || wantsProfile ? loadActiveProfileSkills(config) : Promise.resolve(null),
      wantsProjects ? loadMarkdownItems("projects", config, activeProfile) : Promise.resolve([]),
      wantsCertifications ? loadMarkdownItems("certifications", config, activeProfile) : Promise.resolve([]),
      wantsExplorations ? loadMarkdownItems("explorations", config, activeProfile) : Promise.resolve([]),
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
    const retry = () => init();
    if (wantsProjects) showError("projects-grid", "Failed to load projects.", retry);
    if (wantsCertifications) showError("certifications-grid", "Failed to load certifications.", retry);
    if (wantsExplorations) showError("explorations-grid", "Failed to load explorations.", retry);
  }
}

document.addEventListener("DOMContentLoaded", init);
