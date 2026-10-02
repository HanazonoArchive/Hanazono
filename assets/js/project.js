import {
  fetchGitHubRepo,
  fetchGitHubContents,
  fetchGitHubBranches,
  fetchGitHubLanguages,
  GITHUB_LANG_COLORS,
  formatBytes,
  formatNumber,
  formatRelativeTime
} from './github.js';
import { initPageTransitions, playIncomingTransition } from './transitions.js';

/**
 * Initializes and dynamically hydrates the dedicated project case study
 */
export async function initProjectPage() {
  initPageTransitions();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = (urlParams.get('id') || 'chromatic-menu').toLowerCase();

  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error('Failed to load projects.json');
    const projects = await res.json();

    const currentProject = projects.find(p => p.id.toLowerCase() === projectId) || projects[0];

    renderProjectDetails(currentProject);

    // Trigger reverse circular collapse on arrival
    playIncomingTransition();

    // If GitHub repo exists, fetch and display live GitHub telemetry & file tree
    if (currentProject.githubRepo) {
      enrichWithGitHubData(currentProject.githubRepo, currentProject);
      renderGitHubDirectory(currentProject.githubRepo, currentProject.githubUrl);
    } else {
      const versionEl = document.getElementById('telem-version');
      const licenseEl = document.getElementById('telem-license');
      if (versionEl) versionEl.textContent = currentProject.version || 'N/A';
      if (licenseEl) licenseEl.textContent = currentProject.license || 'N/A';
    }
  } catch (err) {
    console.error('Error hydrating project page:', err);
    playIncomingTransition();
  }
}

/**
 * Render main case study narrative, image, and static telemetry
 */
function renderProjectDetails(project) {
  // Document title
  document.title = `${project.title} — Jay Mark V. Agsoy`;

  // Header: Kicker, Title, Short Description
  const kickerEl = document.getElementById('project-kicker');
  const titleEl = document.getElementById('project-title');
  const summaryEl = document.getElementById('project-summary');

  if (kickerEl) kickerEl.textContent = project.kicker || 'Project Case Study';
  if (titleEl) titleEl.textContent = project.title;
  if (summaryEl) summaryEl.textContent = project.summary;

  // Main Project Image (fills the box, borderless, small radius)
  const imageContainer = document.getElementById('project-image-container');
  if (imageContainer) {
    if (project.image) {
      imageContainer.innerHTML = `
        <div class="project-image-box">
          <img src="${project.image}" alt="${escapeHtml(project.title)}" class="project-main-image" onerror="this.parentElement.style.display='none';">
        </div>
      `;
    } else {
      imageContainer.innerHTML = '';
    }
  }

  // Rest of descriptions (story sections)
  const storyCol = document.getElementById('story-content');
  if (storyCol) {
    let storyHtml = '';

    if (project.story && Array.isArray(project.story)) {
      project.story.forEach((sec) => {
        storyHtml += `
          <section class="story-section">
            <h2>${escapeHtml(sec.heading)}</h2>
        `;

        if (sec.content) {
          if (Array.isArray(sec.content)) {
            sec.content.forEach(p => {
              storyHtml += `<p>${p}</p>`;
            });
          } else {
            // Split multiline content by double-newline if paragraphs exist
            const paragraphs = sec.content.split(/\n\n+/);
            paragraphs.forEach(p => {
              storyHtml += `<p>${p}</p>`;
            });
          }
        }

        if (sec.items && Array.isArray(sec.items)) {
          storyHtml += `<ul class="story-list">`;
          sec.items.forEach(item => {
            const colonIdx = item.indexOf(':');
            let formatted;
            if (colonIdx > 0 && colonIdx < 45) {
              const label = item.substring(0, colonIdx);
              const rest = item.substring(colonIdx + 1);
              formatted = `<strong>${escapeHtml(label)}:</strong>${escapeHtml(rest)}`;
            } else {
              formatted = escapeHtml(item);
            }
            storyHtml += `<li>${formatted}</li>`;
          });
          storyHtml += `</ul>`;
        }

        storyHtml += `</section>`;
      });
    }

    storyCol.innerHTML = storyHtml;
  }

  // Telemetry Sidebar (Initial / Baseline)
  const versionEl = document.getElementById('telem-version');
  const licenseEl = document.getElementById('telem-license');
  const githubBtn = document.getElementById('btn-github');

  if (versionEl) versionEl.textContent = project.version || '—';
  if (licenseEl) licenseEl.textContent = project.license || 'N/A';

  if (githubBtn) {
    githubBtn.href = project.githubUrl || (project.githubRepo ? `https://github.com/${project.githubRepo}` : 'https://github.com/HanazonoArchive');
  }

  // Initial languages loading state
  const barEl = document.getElementById('lang-bar');
  const listEl = document.getElementById('lang-list');
  if (barEl) barEl.style.display = 'none';
  if (listEl) listEl.innerHTML = '<span class="lang-empty">Loading languages from GitHub...</span>';
}

/**
 * Fetch and render live GitHub file directory tree under story descriptions
 */
async function renderGitHubDirectory(repoSlug, repoUrl) {
  const container = document.getElementById('github-tree-container');
  if (!container) return;

  const targetUrl = repoUrl || `https://github.com/${repoSlug}`;

  container.innerHTML = `
    <section class="story-section file-tree-section">
      <h2>Repository Directory</h2>
      <div class="file-tree-card">
        <div class="file-tree-header">
          <div class="file-tree-header-left">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
            </svg>
            <span>${escapeHtml(repoSlug)}</span>
            <span class="file-tree-badge">main</span>
          </div>
          <a href="${targetUrl}" target="_blank" rel="noopener" class="file-tree-link">
            View on GitHub &rarr;
          </a>
        </div>
        <div class="file-tree-list" id="file-tree-list">
          <div class="file-tree-loading">Fetching repository structure from GitHub...</div>
        </div>
      </div>
    </section>
  `;

  const listEl = document.getElementById('file-tree-list');
  const items = await fetchGitHubContents(repoSlug);

  if (!items || !items.length) {
    if (listEl) {
      listEl.innerHTML = `
        <div class="file-tree-loading">
          <a href="${targetUrl}" target="_blank" rel="noopener" style="color:var(--sky-accent);">
            Explore repository files directly on GitHub &rarr;
          </a>
        </div>
      `;
    }
    return;
  }

  let rowsHtml = '';
  items.forEach(item => {
    const isDir = item.type === 'dir';
    const iconSvg = isDir
      ? `<svg class="file-tree-icon dir" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>`
      : `<svg class="file-tree-icon file" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;

    rowsHtml += `
      <a href="${item.htmlUrl}" target="_blank" rel="noopener" class="file-tree-row">
        <div class="file-tree-item-name">
          ${iconSvg}
          <span>${escapeHtml(item.name)}</span>
        </div>
        <div class="file-tree-size">
          ${isDir ? 'directory' : formatBytes(item.size)}
        </div>
      </a>
    `;
  });

  if (listEl) listEl.innerHTML = rowsHtml;
}

/**
 * Enriches sidebar with live GitHub Telemetry (Releases, License, Stars, Forks, Branches, Commit, Languages)
 */
async function enrichWithGitHubData(repoSlug, project) {
  // Fetch telemetry, branches, and languages in parallel
  const [telemetry, branches, languages] = await Promise.all([
    fetchGitHubRepo(repoSlug),
    fetchGitHubBranches(repoSlug),
    fetchGitHubLanguages(repoSlug)
  ]);

  if (!telemetry) return;

  // 1. Version based on release if it exists, otherwise project version or N/A
  const versionEl = document.getElementById('telem-version');
  if (versionEl) {
    if (telemetry.latestRelease && telemetry.latestRelease.tagName) {
      versionEl.textContent = telemetry.latestRelease.tagName;
    } else if (project && project.version) {
      versionEl.textContent = project.version;
    } else {
      versionEl.textContent = 'N/A';
    }
  }

  // 2. License if it exists, otherwise N/A
  const licenseEl = document.getElementById('telem-license');
  if (licenseEl) {
    if (telemetry.license) {
      licenseEl.textContent = telemetry.license;
    } else if (project && project.license) {
      licenseEl.textContent = project.license;
    } else {
      licenseEl.textContent = 'N/A';
    }
  }

  // 3. GitHub Stats Card
  const ghCard = document.getElementById('live-github-card');
  if (ghCard) {
    ghCard.style.display = 'block';

    const starsEl = document.getElementById('gh-stars');
    const forksEl = document.getElementById('gh-forks');
    const langEl = document.getElementById('gh-lang');
    const branchesEl = document.getElementById('gh-branches');
    const commitBox = document.getElementById('gh-commit-box');

    if (starsEl) starsEl.textContent = formatNumber(telemetry.stars);
    if (forksEl) forksEl.textContent = formatNumber(telemetry.forks);
    if (langEl) langEl.textContent = telemetry.language || 'Code';

    // List of branches
    if (branchesEl) {
      const branchList = (branches && branches.length > 0) ? branches : [telemetry.defaultBranch || 'main'];
      branchesEl.innerHTML = branchList.map(b => `
        <span class="branch-pill ${b === telemetry.defaultBranch ? 'default' : ''}" title="${b === telemetry.defaultBranch ? 'Default branch: ' + b : 'Branch: ' + b}">
          <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 3.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0z"/></svg>
          ${escapeHtml(b)}
        </span>
      `).join('');
    }

    // Latest Commit
    if (commitBox && telemetry.latestCommit) {
      commitBox.style.display = 'block';
      const c = telemetry.latestCommit;
      commitBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="commit-sha">${c.sha}</span>
          <span class="commit-time">${formatRelativeTime(c.date)}</span>
        </div>
        <span class="commit-msg" title="${escapeHtml(c.message)}">${escapeHtml(c.message)}</span>
      `;
    }
  }

  // 4. Languages breakdown
  renderLanguages(languages, project);
}

function renderLanguages(languages, project) {
  const barEl = document.getElementById('lang-bar');
  const listEl = document.getElementById('lang-list');
  if (!barEl || !listEl) return;

  if (languages && languages.length > 0) {
    barEl.style.display = 'flex';
    barEl.innerHTML = languages.map(l => `
      <div class="lang-segment" style="width: ${l.percent}%; background-color: ${l.color};" title="${escapeHtml(l.name)}: ${l.percentDisplay}"></div>
    `).join('');

    listEl.innerHTML = languages.map(l => `
      <div class="lang-item">
        <span class="lang-dot" style="background-color: ${l.color};"></span>
        <span class="lang-name">${escapeHtml(l.name)}</span>
        <span class="lang-percent">${l.percentDisplay}</span>
      </div>
    `).join('');
  } else {
    // If GitHub API language stats are not available, do NOT fabricate fake percentages
    barEl.style.display = 'none';
    const tech = project?.technologies || [];
    if (tech.length > 0) {
      listEl.innerHTML = tech.map(t => {
        const color = GITHUB_LANG_COLORS[t] || '#38bdf8';
        return `
          <div class="lang-item">
            <span class="lang-dot" style="background-color: ${color};"></span>
            <span class="lang-name">${escapeHtml(t)}</span>
          </div>
        `;
      }).join('');
    } else {
      listEl.innerHTML = '<span class="lang-empty">No language data available</span>';
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
