/**
 * Hanazono Portfolio — Dynamic Page Transitions & Auto-Cache Engine
 *
 * Features:
 * 1. Auto Cache on Hover:
 *    - Prefetches HTML document on mouseover / touchstart.
 *    - Prefetches project JSON and preview assets for zero-latency transitions.
 * 2. Radial Circle Wipe Transition:
 *    - On click, a circle appears at exact (clientX, clientY).
 *    - Grows smoothly with the current page's background and accent color rim.
 *    - Fills the viewport completely before navigating.
 * 3. Reverse Collapse Transition on Target Page:
 *    - The new page starts with the circle covering the viewport.
 *    - The circle collapses back down into the mouse coordinates, revealing the page.
 * 4. Timeline Scroll State Retention:
 *    - Remembers exact scroll position on index.html and restores it upon return.
 * 5. Strict Page/Section Color Respect:
 *    - Dynamically evaluates --sky-bg and --sky-accent from computed root styles.
 */

const prefetchedUrls = new Set();
const prefetchedAssets = new Set();

/**
 * Prefetch target page and associated assets for instant loading
 */
export function prefetchProjectTarget(href) {
  if (!href || prefetchedUrls.has(href)) return;
  prefetchedUrls.add(href);

  // Prefetch target HTML document
  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  } catch (e) {}

  // If targeting a project page, prefetch project data and preview image
  try {
    const url = new URL(href, window.location.href);
    const projectId = url.searchParams.get('id');
    if (projectId) {
      fetch('data/projects.json')
        .then(r => r.json())
        .then(projects => {
          const p = projects.find(item => item.id.toLowerCase() === projectId.toLowerCase());
          if (p && p.image && !prefetchedAssets.has(p.image)) {
            prefetchedAssets.add(p.image);
            const img = new Image();
            img.src = p.image;
          }
        })
        .catch(() => {});
    } else if (href.includes('credentials.html')) {
      fetch('data/certifications.json').catch(() => {});
    } else if (href.includes('index.html')) {
      // If returning to timeline, prefetch timeline data
      fetch('data/timeline.json').catch(() => {});
    }
  } catch (err) {}
}

/**
 * Dynamically evaluate current page's theme colors
 */
export function getPageThemeColors() {
  const root = getComputedStyle(document.documentElement);
  const bg = root.getPropertyValue('--sky-bg').trim() || '#161220';
  const accent = root.getPropertyValue('--sky-accent').trim() || '#f59e0b';
  return { bg, accent };
}

/**
 * Calculate circle radius required to completely cover the viewport from (x, y)
 */
function getCoverRadius(x, y) {
  const corners = [
    Math.hypot(x, y),
    Math.hypot(window.innerWidth - x, y),
    Math.hypot(x, window.innerHeight - y),
    Math.hypot(window.innerWidth - x, window.innerHeight - y)
  ];
  return Math.ceil(Math.max(...corners)) + 120;
}

let isTransitioning = false;

/**
 * Outgoing transition: circle expands from click locus until it fills the screen
 */
export function navigateWithRadialTransition(x, y, targetHref) {
  if (isTransitioning) return;
  isTransitioning = true;

  const { bg, accent } = getPageThemeColors();
  const maxRadius = getCoverRadius(x, y);

  const isProject = !!document.querySelector('.project-page') || window.location.pathname.includes('project');
  const isCredentials = !!document.querySelector('.credentials-page') || window.location.pathname.includes('credential');
  const isTimeline = !isProject && !isCredentials && !!document.querySelector('.stream-col, .story-entry');

  // Save transition state to sessionStorage
  const state = {
    x,
    y,
    bg,
    accent,
    from: isTimeline ? 'timeline' : (isCredentials ? 'credentials' : 'project'),
    timestamp: Date.now()
  };

  if (isTimeline) {
    sessionStorage.setItem('timeline_scroll_pos', window.scrollY.toString());
    const activeEntry = document.querySelector('.story-entry.active') || document.querySelector('.story-entry');
    if (activeEntry && activeEntry.id) {
      sessionStorage.setItem('timeline_active_chapter', activeEntry.id);
    }
  }
  sessionStorage.setItem('page_transition_state', JSON.stringify(state));

  // Get or create overlay
  let overlay = document.getElementById('page-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
  }

  overlay.style.display = 'block';
  overlay.style.backgroundColor = 'transparent';
  overlay.innerHTML = `<div class="page-transition-circle" id="trans-circle"></div>`;
  const circle = document.getElementById('trans-circle');

  // Configure initial circle at click point with 0 radius
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.style.width = '0px';
  circle.style.height = '0px';
  circle.style.backgroundColor = bg;
  circle.style.border = 'none';
  circle.style.boxShadow = 'none';

  // Force reflow
  void circle.offsetWidth;

  // Animate growth
  circle.classList.add('animate-grow');
  circle.style.width = `${maxRadius * 2}px`;
  circle.style.height = `${maxRadius * 2}px`;

  // Navigate when screen is completely filled
  setTimeout(() => {
    overlay.style.backgroundColor = bg;
    window.location.href = targetHref;
  }, 440);
}

/**
 * Incoming transition: circle begins covering the screen and collapses back into the mouse coordinate
 */
export function playIncomingTransition(onComplete) {
  const rawState = sessionStorage.getItem('page_transition_state');
  if (!rawState) {
    if (onComplete) onComplete();
    return;
  }

  let state;
  try {
    state = JSON.parse(rawState);
  } catch (e) {
    sessionStorage.removeItem('page_transition_state');
    if (onComplete) onComplete();
    return;
  }

  // Discard stale states older than 10s
  if (Date.now() - state.timestamp > 10000) {
    sessionStorage.removeItem('page_transition_state');
    if (onComplete) onComplete();
    return;
  }

  const x = typeof state.x === 'number' ? state.x : window.innerWidth / 2;
  const y = typeof state.y === 'number' ? state.y : window.innerHeight / 2;
  const bg = state.bg || '#161220';
  const accent = state.accent || '#f59e0b';
  const maxRadius = getCoverRadius(x, y);

  let overlay = document.getElementById('page-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
  }

  overlay.style.display = 'block';
  overlay.innerHTML = `<div class="page-transition-circle" id="trans-circle"></div>`;
  const circle = document.getElementById('trans-circle');

  // Start at full-screen size covering the whole viewport (borderless)
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.style.width = `${maxRadius * 2}px`;
  circle.style.height = `${maxRadius * 2}px`;
  circle.style.backgroundColor = bg;
  circle.style.border = 'none';
  circle.style.boxShadow = 'none';

  // Force layout reflow so circle is painted covering the entire screen
  void circle.offsetWidth;

  // Now hand over from solid curtain to shrinking circle with zero flicker
  document.documentElement.classList.remove('transitioning');
  overlay.style.backgroundColor = 'transparent';

  // On next frame, animate shrinking back to the mouse coordinate
  requestAnimationFrame(() => {
    circle.classList.add('animate-shrink');
    circle.style.width = '0px';
    circle.style.height = '0px';

    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.innerHTML = '';
      sessionStorage.removeItem('page_transition_state');
      if (onComplete) onComplete();
    }, 480);
  });
}

/**
 * Setup global auto-cache on hover and click listener for eligible links
 */
export function initPageTransitions() {
  const eligibleSelector = 'a[href*="project"], a[href*="credential"], a.back-link, a[href*="index.html"], a[href="./"], .project-switcher-link';

  // 1. Auto Cache on Hover / Touch
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest(eligibleSelector);
    if (link && link.href) {
      prefetchProjectTarget(link.href);
    }
  }, { passive: true });

  document.addEventListener('touchstart', (e) => {
    const link = e.target.closest(eligibleSelector);
    if (link && link.href) {
      prefetchProjectTarget(link.href);
    }
  }, { passive: true });

  // 2. Intercept Click for Radial Wipe
  document.addEventListener('click', (e) => {
    const link = e.target.closest(eligibleSelector);
    if (!link) return;

    // Ignore external or modifier clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank') return;

    const targetHref = link.href;
    if (!targetHref || targetHref === window.location.href) return;

    // Don't intercept anchor links that stay on the exact same page
    const currentUrlWithoutHash = window.location.href.split('#')[0];
    const targetUrlWithoutHash = targetHref.split('#')[0];
    if (currentUrlWithoutHash === targetUrlWithoutHash) {
      return; // intra-page anchor navigation (like #top or #timeline)
    }

    e.preventDefault();
    navigateWithRadialTransition(e.clientX, e.clientY, targetHref);
  });
}
