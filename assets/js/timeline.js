import { initPageTransitions, playIncomingTransition } from './transitions.js';

/**
 * Initializes and dynamically hydrates the Homepage Day-Cycle Timeline
 */
export async function initHomepage() {
  try {
    initSkyCanvas();
    initPageTransitions();

    const [profile, timeline, projects, certs, explorations, skills] = await Promise.all([
      fetch('data/profile.json').then(r => r.json()),
      fetch('data/timeline.json').then(r => r.json()),
      fetch('data/projects.json').then(r => r.json()),
      fetch('data/certifications.json').then(r => r.json()),
      fetch('data/explorations.json').then(r => r.json()),
      fetch('data/skills.json').then(r => r.json())
    ]);

    renderHero(profile);
    renderTimeline({ timeline, projects, certs, explorations, skills, profile });

    // Restore scroll position if returning from a project or credential view
    const savedScroll = sessionStorage.getItem('timeline_scroll_pos');
    if (savedScroll !== null) {
      const targetPos = parseInt(savedScroll, 10);
      window.scrollTo({ top: targetPos, behavior: 'instant' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetPos, behavior: 'instant' });
      });
      setTimeout(() => {
        window.scrollTo({ top: targetPos, behavior: 'instant' });
      }, 50);
      sessionStorage.removeItem('timeline_scroll_pos');
    } else if (window.location.hash) {
      setTimeout(() => {
        const hashEl = document.querySelector(window.location.hash);
        if (hashEl) {
          hashEl.scrollIntoView({ behavior: 'instant' });
        }
      }, 50);
    }

    initTimelineInteractions();

    // Trigger reverse circular collapse on arrival
    playIncomingTransition();
  } catch (err) {
    console.error('Error loading portfolio data:', err);
  }
}

/**
 * Render Hero Section from profile.json
 */
function renderHero(profile) {
  if (!profile) return;

  const badgeEl = document.getElementById('hero-badge');
  const nameEl = document.getElementById('hero-name');
  const bioEl = document.getElementById('hero-bio');
  const avatarEl = document.getElementById('hero-avatar');
  const fallbackEl = document.getElementById('hero-avatar-fallback');
  const resumeBtn = document.getElementById('hero-resume-btn');
  const githubBtn = document.getElementById('hero-github-btn');

  if (badgeEl && profile.badge) badgeEl.textContent = profile.badge;
  if (nameEl && profile.name) nameEl.textContent = profile.name;
  if (bioEl && profile.bio) bioEl.textContent = profile.bio;

  if (avatarEl && profile.avatar) {
    avatarEl.src = profile.avatar;
    avatarEl.alt = profile.name || 'Profile Avatar';
    avatarEl.onerror = () => {
      avatarEl.style.display = 'none';
      if (fallbackEl) {
        fallbackEl.style.display = 'flex';
        fallbackEl.textContent = profile.avatarFallback || 'JA';
      }
    };
  }

  if (githubBtn && profile.links && profile.links.github) {
    githubBtn.href = profile.links.github;
  }
  if (resumeBtn && profile.links && profile.links.resume) {
    resumeBtn.href = profile.links.resume;
  }

  // Hydrate Contact Section (mirrors hero)
  const contactAvatarEl = document.getElementById('contact-avatar');
  const contactFallbackEl = document.getElementById('contact-avatar-fallback');
  const contactEmailBtn = document.getElementById('contact-email-btn');
  const contactGithubBtn = document.getElementById('contact-github-btn');
  const contactLinkedinBtn = document.getElementById('contact-linkedin-btn');
  const contactResumeBtn = document.getElementById('contact-resume-btn');

  if (contactAvatarEl && profile.avatar) {
    contactAvatarEl.src = profile.avatar;
    contactAvatarEl.alt = profile.name || 'Profile Avatar';
    contactAvatarEl.onerror = () => {
      contactAvatarEl.style.display = 'none';
      if (contactFallbackEl) {
        contactFallbackEl.style.display = 'flex';
        contactFallbackEl.textContent = profile.avatarFallback || 'JA';
      }
    };
  }

  if (contactEmailBtn && profile.links && profile.links.email) {
    contactEmailBtn.href = profile.links.email;
  }
  if (contactGithubBtn && profile.links && profile.links.github) {
    contactGithubBtn.href = profile.links.github;
  }
  if (contactLinkedinBtn && profile.links && profile.links.linkedin) {
    contactLinkedinBtn.href = profile.links.linkedin;
  }
  if (contactResumeBtn && profile.links && profile.links.resume) {
    contactResumeBtn.href = profile.links.resume;
  }
}

/**
 * Render Timeline Chapters dynamically
 */
function renderTimeline({ timeline, projects, certs, explorations, skills, profile }) {
  const streamCol = document.querySelector('.stream-col');
  if (!streamCol) return;

  // Preserve spine element
  const spineHtml = `
    <div class="stream-line">
      <div class="stream-line-fill" id="spine-fill"></div>
    </div>
  `;

  let chaptersHtml = spineHtml;

  timeline.forEach((ch, idx) => {
    let cardContentHtml = '';

    // Chapter Header (No time element)
    cardContentHtml += `
      <span class="entry-phase">${ch.phase}</span>
      <h2>${ch.title}</h2>
    `;

    // Intro paragraphs
    if (ch.paragraphs && Array.isArray(ch.paragraphs)) {
      ch.paragraphs.forEach(p => {
        cardContentHtml += `<p>${p}</p>`;
      });
    }

    // Story Quote
    if (ch.quote) {
      cardContentHtml += `
        <div class="story-quote">
          "${ch.quote}"
        </div>
      `;
    }

    // Optional Sub-sections (e.g. What I Do pillars)
    if (ch.subsections && Array.isArray(ch.subsections)) {
      ch.subsections.forEach(sub => {
        cardContentHtml += `
          <div class="sub-section">
            <div class="sub-kicker">${escapeHtml(sub.kicker || 'Core Focus')}</div>
            <div class="sub-title">${escapeHtml(sub.title)}</div>
            <div class="sub-desc">${escapeHtml(sub.description)}</div>
          </div>
        `;
      });
    }

    // Chapter Specific Data Sources
    if (ch.dataSource === 'projects') {
      projects.forEach(proj => {
        cardContentHtml += `
          <div class="sub-section">
            <div class="sub-kicker">${proj.kicker || 'Project'}</div>
            <div class="sub-title">${proj.title}</div>
            <div class="sub-desc">${proj.summary}</div>
            <a href="project.html?id=${encodeURIComponent(proj.id)}" class="case-link-btn">
              Read Project Case Study &rarr;
            </a>
            ${renderTagCluster(proj.tags || [])}
          </div>
        `;
      });
    } else if (ch.dataSource === 'certifications') {
      certs.forEach(cert => {
        cardContentHtml += `
          <div class="sub-section">
            <div class="sub-kicker">${cert.kicker || cert.issuer}</div>
            <div class="sub-title">${cert.title}</div>
            <div class="sub-desc">${cert.description}</div>
            <a href="credentials.html?id=${encodeURIComponent(cert.id)}" class="case-link-btn">View Credential &rarr;</a>
            ${renderTagCluster(cert.tags || [])}
          </div>
        `;
      });
    } else if (ch.dataSource === 'explorations') {
      explorations.forEach(exp => {
        const linkHtml = exp.caseStudyId
          ? `<a href="project.html?id=${encodeURIComponent(exp.caseStudyId)}" class="case-link-btn">Inspect Architecture Details &rarr;</a>`
          : exp.githubUrl
          ? `<a href="${exp.githubUrl}" target="_blank" rel="noopener" class="case-link-btn">View Source Repository &rarr;</a>`
          : '';

        cardContentHtml += `
          <div class="sub-section">
            <div class="sub-kicker">${exp.kicker}</div>
            <div class="sub-title">${exp.title}</div>
            <div class="sub-desc">${exp.description}</div>
            ${linkHtml}
            ${renderTagCluster(exp.tags || [])}
          </div>
        `;
      });
    } else if (ch.dataSource === 'skills') {
      let gridHtml = '<div class="skills-grid">';
      for (const [category, items] of Object.entries(skills)) {
        gridHtml += `
          <div class="skill-group">
            <div class="sub-title">${category}</div>
            ${renderTagCluster(items)}
          </div>
        `;
      }
      gridHtml += '</div>';
      cardContentHtml += gridHtml;

      // Professional Experience
      if (profile && profile.experience && profile.experience.length) {
        profile.experience.forEach(exp => {
          const bullets = exp.bullets || (Array.isArray(exp.description) ? exp.description : [exp.description]);
          const bulletsHtml = bullets && bullets.length
            ? `<ul style="margin: 10px 0 16px 0; padding-left: 18px; color: var(--text-body); font-size: 13.5px; line-height: 1.75;">
                ${bullets.map(b => `<li style="margin-bottom: 6px;">${escapeHtml(b)}</li>`).join('')}
              </ul>`
            : (exp.description ? `<div class="sub-desc">${escapeHtml(exp.description)}</div>` : '');

          cardContentHtml += `
            <div class="sub-section" style="margin-top: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 4px;">
                <div class="sub-kicker">${escapeHtml(exp.kicker || 'Professional Experience')}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(exp.period || '')}</div>
              </div>
              <div class="sub-title">${escapeHtml(exp.role)} &middot; <span style="font-weight: 500; color: var(--sky-accent);">${escapeHtml(exp.company)}</span></div>
              ${bulletsHtml}
              ${renderTagCluster(exp.tags || [])}
            </div>
          `;
        });
      }
    } else if (ch.tags && ch.tags.length > 0) {
      cardContentHtml += renderTagCluster(ch.tags);
    }

    chaptersHtml += `
      <section class="story-entry" id="${ch.id}"
        data-thought="${escapeHtml(ch.thought || '')}"
        data-bg="${ch.bg}"
        data-accent="${ch.accent}"
        data-soft="${ch.soft}"
        data-glow="${ch.glow}"
        data-companion-bg="${ch.companionBg || ''}">
        <div class="node-bead"></div>
        <div class="card">
          ${cardContentHtml}
        </div>
      </section>
    `;
  });

  streamCol.innerHTML = chaptersHtml;
}

/**
 * Render tags
 */
function renderTagCluster(tags) {
  if (!tags || !tags.length) return '';
  return `
    <div class="tag-cluster">
      ${tags.map(t => `<span class="tag-item">${escapeHtml(t)}</span>`).join('')}
    </div>
  `;
}

/**
 * Synchronized Timeline Spine and Bead Interaction Engine
 * Single source of truth: Spine fill and bead states are calculated synchronously
 * from the exact same viewport-center measurement, guaranteeing 100% accuracy.
 */
function initTimelineInteractions() {
  const entries = [...document.querySelectorAll('.story-entry')];
  if (!entries.length) return;

  const thoughtEl = document.getElementById('companion-thought');
  const companion = document.getElementById('companion');
  const streamCol = document.querySelector('.stream-col');
  const line = document.querySelector('.stream-line');
  const spineFill = document.getElementById('spine-fill');
  const rootStyle = document.documentElement.style;

  // On mobile the companion is hidden, so show each chapter's thought inside its card
  entries.forEach(entry => {
    if (!entry.querySelector('.mobile-thought')) {
      const p = document.createElement('p');
      p.className = 'mobile-thought';
      p.textContent = `"${entry.dataset.thought || ''}"`;
      const card = entry.querySelector('.card');
      if (card && card.querySelector('h2')) {
        card.insertBefore(p, card.querySelector('h2').nextSibling);
      }
    }
  });

  let lastActiveIndex = -1;

  function updateTimeline() {
    if (!line || !spineFill) return;

    const lineRect = line.getBoundingClientRect();
    const scrollY = window.scrollY;
    const viewportHalf = window.innerHeight / 2;
    const triggerDoc = scrollY + viewportHalf;
    const lineTopDoc = lineRect.top + scrollY;
    const lineBottomDoc = lineRect.bottom + scrollY;
    const lineHeight = lineRect.height;

    // Calculate each bead's center in document coordinates
    const beadCenters = entries.map(entry => {
      const bead = entry.querySelector('.node-bead');
      if (bead) {
        const bRect = bead.getBoundingClientRect();
        return bRect.top + scrollY + bRect.height / 2;
      }
      const eRect = entry.getBoundingClientRect();
      return eRect.top + scrollY + 9;
    });

    const firstBeadCenter = beadCenters[0];

    // Calculate line fill height
    let filled = 0;
    const isAtPageBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60);
    const isPastTimeline = triggerDoc >= lineBottomDoc;

    if (isAtPageBottom || isPastTimeline) {
      filled = lineHeight;
    } else if (triggerDoc >= lineTopDoc) {
      filled = Math.max(0, Math.min(lineHeight, triggerDoc - lineTopDoc));
    } else {
      filled = 0;
    }
    spineFill.style.height = `${filled}px`;

    // Determine active chapter: exactly matching where the line has reached
    let activeIndex = -1;
    if (triggerDoc >= firstBeadCenter - 4) {
      for (let i = 0; i < beadCenters.length; i++) {
        if (triggerDoc >= beadCenters[i] - 4) {
          activeIndex = i;
        } else {
          break;
        }
      }
    }

    // Synchronize bead classes (.active for current, .passed for previously reached beads)
    entries.forEach((entry, idx) => {
      const isCurrent = idx === activeIndex;
      const isPassed = activeIndex !== -1 && idx < activeIndex;

      entry.classList.toggle('active', isCurrent);
      entry.classList.toggle('passed', isPassed);
    });

    // Update active chapter theme and companion thought
    if (activeIndex !== lastActiveIndex) {
      lastActiveIndex = activeIndex;
      if (activeIndex >= 0 && activeIndex < entries.length) {
        const currentEntry = entries[activeIndex];
        const d = currentEntry.dataset;
        if (thoughtEl && d.thought) {
          thoughtEl.textContent = `"${d.thought}"`;
        }
        if (d.bg) rootStyle.setProperty('--sky-bg', d.bg);
        if (d.accent) rootStyle.setProperty('--sky-accent', d.accent);
        if (d.soft) rootStyle.setProperty('--sky-accent-soft', d.soft);
        if (d.glow) rootStyle.setProperty('--sky-glow', d.glow);
        if (d.companionBg) rootStyle.setProperty('--companion-bg', d.companionBg);
      } else if (activeIndex === -1) {
        if (thoughtEl && entries[0] && entries[0].dataset.thought) {
          thoughtEl.textContent = `"${entries[0].dataset.thought}"`;
        }
        rootStyle.setProperty('--sky-bg', '#060b16');
        rootStyle.setProperty('--sky-accent', '#38bdf8');
        rootStyle.setProperty('--sky-accent-soft', 'rgba(56, 189, 248, 0.12)');
        rootStyle.setProperty('--sky-glow', 'rgba(56, 189, 248, 0.28)');
        rootStyle.setProperty('--companion-bg', '#0d1527');
      }
    }

    // Determine celestial sky phase:
    // • Night (Hero & About): activeIndex <= 0
    // • Early Morning (Projects): activeIndex === 1
    // • Day (Certifications): activeIndex === 2
    // • Dusk (Explorations): activeIndex === 3
    // • Dark Night & Contact: activeIndex === 4 || isPastTimeline || isAtPageBottom
    const skyCanvas = document.getElementById('sky-canvas');
    if (skyCanvas) {
      let phase = 'night';
      if (activeIndex === 1) {
        phase = 'early-morning';
      } else if (activeIndex === 2) {
        phase = 'day';
      } else if (activeIndex === 3) {
        phase = 'dusk';
      } else if (activeIndex === 4 || isPastTimeline || isAtPageBottom) {
        phase = 'dark-night';
      } else {
        phase = 'night';
      }

      if (skyCanvas.dataset.phase !== phase) {
        skyCanvas.dataset.phase = phase;
      }
    }

    // Companion card visibility (visible only while timeline stream is active in viewport)
    if (companion && streamCol) {
      const streamRect = streamCol.getBoundingClientRect();
      const isVisible = streamRect.top < window.innerHeight * 0.75 && streamRect.bottom > window.innerHeight * 0.2;
      companion.classList.toggle('visible', isVisible);
    }
  }

  // Use requestAnimationFrame for smooth 60/120fps sync without jank
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateTimeline();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateTimeline);

  // Initial calculation
  updateTimeline();
}

/**
 * Initialize dynamic celestial background canvas
 */
function initSkyCanvas() {
  const baseStarsEl = document.getElementById('sky-stars-base');
  const denseStarsEl = document.getElementById('sky-stars-dense');

  // Helper to create star elements
  function createStars(container, count, minSize, maxSize) {
    if (!container) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'sky-star';
      const size = minSize + Math.random() * (maxSize - minSize);
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const op = 0.45 + Math.random() * 0.5;
      const dur = 3 + Math.random() * 4;
      const delay = -(Math.random() * 6);

      star.style.width = `${size.toFixed(1)}px`;
      star.style.height = `${size.toFixed(1)}px`;
      star.style.top = `${top.toFixed(2)}%`;
      star.style.left = `${left.toFixed(2)}%`;
      star.style.setProperty('--star-op', op.toFixed(2));
      star.style.setProperty('--twinkle-dur', `${dur.toFixed(1)}s`);
      star.style.setProperty('--twinkle-delay', `${delay.toFixed(1)}s`);

      // Different white glows
      const glowRand = Math.random();
      if (glowRand > 0.7) {
        star.style.boxShadow = '0 0 6px 1px #ffffff';
      } else if (glowRand > 0.35) {
        star.style.boxShadow = '0 0 3px #ffffff';
      } else {
        star.style.boxShadow = 'none';
      }

      fragment.appendChild(star);
    }
    container.appendChild(fragment);
  }

  // Populate base night stars (~70 stars)
  if (baseStarsEl && !baseStarsEl.hasChildNodes()) {
    createStars(baseStarsEl, 70, 1.2, 2.8);
  }

  // Populate dense dark-night stars (~55 additional stars)
  if (denseStarsEl && !denseStarsEl.hasChildNodes()) {
    createStars(denseStarsEl, 55, 1.0, 2.4);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
