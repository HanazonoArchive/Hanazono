/**
 * GitHub API Integration & LocalStorage Caching Helper
 * Caches telemetry data with a 30-minute TTL to stay well within GitHub's 60 req/hr rate limit.
 */

const GITHUB_CACHE_PREFIX = 'gh_cache_';
const GITHUB_BRANCHES_PREFIX = 'gh_branches_';
const GITHUB_LANGS_PREFIX = 'gh_langs_';
const GITHUB_CONTENTS_PREFIX = 'gh_contents_';
const GITHUB_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const GITHUB_LANG_COLORS = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'C#': '#178600',
  'C++': '#f34b7d',
  'C': '#555555',
  'Rust': '#dea584',
  'Java': '#b07219',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'SCSS': '#c6538c',
  'Shell': '#89e051',
  'PowerShell': '#255ab0',
  'Batchfile': '#C1F12E',
  'Dart': '#00B4AB',
  'Go': '#00ADD8',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'Vue': '#41b883',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Lua': '#000080',
  'GLSL': '#5686a5',
  'ShaderLab': '#455a71',
  'Markdown': '#3b82f6',
  'Jupyter Notebook': '#DA5B0B'
};

/**
 * Format a timestamp into relative time ("3 days ago", "just now", etc.)
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const then = new Date(dateString).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)}mo ago`;
  return `${Math.floor(diffSec / 31536000)}y ago`;
}

/**
 * Format large numbers (e.g., 1420 -> 1.4k)
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

/**
 * Format bytes into human readable size
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Helper to construct GitHub API headers with optional token for 5,000 req/hr rate limit
 */
export function getGitHubHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  try {
    const token = localStorage.getItem('gh_token') || (typeof window !== 'undefined' && window.GITHUB_TOKEN);
    if (token && typeof token === 'string' && token.trim().length > 0) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }
  } catch (_) {}
  return headers;
}

/**
 * Configure GitHub personal access token in localStorage for 5,000 req/hr limit
 */
export function setGitHubToken(token) {
  try {
    if (token) {
      localStorage.setItem('gh_token', token.trim());
    } else {
      localStorage.removeItem('gh_token');
    }
  } catch (_) {}
}

/**
 * Pre-fetched static cache loader (eliminates client rate limits)
 */
let staticCachePromise = null;

async function getStaticCache() {
  if (staticCachePromise) return staticCachePromise;
  staticCachePromise = (async () => {
    try {
      const res = await fetch('data/github-cache.json');
      if (!res.ok) return {};
      const data = await res.json();
      return (data && typeof data === 'object' && data.repos) ? data.repos : {};
    } catch (_) {
      return {};
    }
  })();
  return staticCachePromise;
}

/**
 * Fetch GitHub repo details and commit telemetry with static & local storage caching
 * @param {string} repoSlug - e.g. "HanazonoArchive/Chromatic-Menu"
 * @returns {Promise<Object>} Telemetry object
 */
export async function fetchGitHubRepo(repoSlug) {
  if (!repoSlug) return null;

  // 1. Check static cache first (Instant 0ms, zero rate-limit impact)
  try {
    const staticCache = await getStaticCache();
    if (staticCache && staticCache[repoSlug] && staticCache[repoSlug].telemetry) {
      return staticCache[repoSlug].telemetry;
    }
  } catch (_) {}

  const cacheKey = GITHUB_CACHE_PREFIX + repoSlug.replace('/', '_');

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < GITHUB_CACHE_TTL && parsed.data) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('GitHub cache read error:', e);
  }

  // 3. Network fetch fallback
  try {
    const repoRes = await fetch(`https://api.github.com/repos/${repoSlug}`, {
      headers: getGitHubHeaders()
    });
    if (!repoRes.ok) {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : null;
    }
    const repoData = await repoRes.json();

    // Fetch latest commit
    let latestCommit = null;
    try {
      const commitRes = await fetch(`https://api.github.com/repos/${repoSlug}/commits?per_page=1`, {
        headers: getGitHubHeaders()
      });
      if (commitRes.ok) {
        const commits = await commitRes.json();
        if (Array.isArray(commits) && commits.length > 0) {
          const c = commits[0];
          latestCommit = {
            sha: c.sha ? c.sha.substring(0, 7) : '',
            message: c.commit && c.commit.message ? c.commit.message.split('\n')[0] : '',
            date: c.commit && c.commit.author ? c.commit.author.date : null,
            author: c.commit && c.commit.author ? c.commit.author.name : ''
          };
        }
      }
    } catch (_) {}

    // Fetch latest release
    let latestRelease = null;
    try {
      const relRes = await fetch(`https://api.github.com/repos/${repoSlug}/releases/latest`, {
        headers: getGitHubHeaders()
      });
      if (relRes.ok) {
        const relData = await relRes.json();
        if (relData && (relData.tag_name || relData.name)) {
          latestRelease = {
            tagName: relData.tag_name || relData.name,
            name: relData.name || relData.tag_name,
            publishedAt: relData.published_at
          };
        }
      }
    } catch (_) {}

    const telemetry = {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      language: repoData.language || 'Code',
      defaultBranch: repoData.default_branch || 'main',
      htmlUrl: repoData.html_url,
      updatedAt: repoData.updated_at,
      pushedAt: repoData.pushed_at,
      license: repoData.license ? (repoData.license.spdx_id || repoData.license.name) : null,
      latestCommit,
      latestRelease
    };

    // Save to cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: telemetry
      }));
    } catch (e) {
      console.warn('GitHub cache write error:', e);
    }

    return telemetry;
  } catch (err) {
    console.warn(`Failed to fetch GitHub info for ${repoSlug}:`, err);
    try {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : null;
    } catch (_) {
      return null;
    }
  }
}

/**
 * Fetch branches list of a repository with static & localStorage caching
 * @param {string} repoSlug - e.g. "HanazonoArchive/Chromatic-Menu"
 * @returns {Promise<Array<string>>}
 */
export async function fetchGitHubBranches(repoSlug) {
  if (!repoSlug) return ['main'];

  // 1. Check static cache first
  try {
    const staticCache = await getStaticCache();
    if (staticCache && staticCache[repoSlug] && Array.isArray(staticCache[repoSlug].branches)) {
      return staticCache[repoSlug].branches;
    }
  } catch (_) {}

  const cacheKey = GITHUB_BRANCHES_PREFIX + repoSlug.replace('/', '_');

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < GITHUB_CACHE_TTL && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    }
  } catch (e) {}

  // 3. Network fetch fallback
  try {
    const res = await fetch(`https://api.github.com/repos/${repoSlug}/branches`, {
      headers: getGitHubHeaders()
    });
    if (!res.ok) {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : ['main'];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return ['main'];

    const branches = data.map(b => b.name);

    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: branches
      }));
    } catch (e) {}

    return branches;
  } catch (err) {
    console.warn(`Failed to fetch branches for ${repoSlug}:`, err);
    try {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : ['main'];
    } catch (_) {
      return ['main'];
    }
  }
}

/**
 * Fetch language breakdown for a repository with static & localStorage caching
 * @param {string} repoSlug - e.g. "HanazonoArchive/Chromatic-Menu"
 * @returns {Promise<Array<{name: string, percent: number, color: string, bytes: number}>>}
 */
export async function fetchGitHubLanguages(repoSlug) {
  if (!repoSlug) return [];

  // 1. Check static cache first
  try {
    const staticCache = await getStaticCache();
    if (staticCache && staticCache[repoSlug] && Array.isArray(staticCache[repoSlug].languages)) {
      return staticCache[repoSlug].languages;
    }
  } catch (_) {}

  const cacheKey = GITHUB_LANGS_PREFIX + repoSlug.replace('/', '_');

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < GITHUB_CACHE_TTL && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    }
  } catch (e) {}

  // 3. Network fetch fallback
  try {
    const res = await fetch(`https://api.github.com/repos/${repoSlug}/languages`, {
      headers: getGitHubHeaders()
    });
    if (!res.ok) {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : [];
    }
    const data = await res.json();
    if (!data || typeof data !== 'object') return [];

    let totalBytes = 0;
    for (const bytes of Object.values(data)) {
      totalBytes += bytes;
    }

    if (totalBytes === 0) return [];

    const languages = Object.entries(data).map(([name, bytes]) => {
      const rawPercent = (bytes / totalBytes) * 100;
      const percent = rawPercent < 0.2 ? 0.2 : parseFloat(rawPercent.toFixed(1));
      const percentDisplay = rawPercent < 0.1 ? '< 0.1%' : `${parseFloat(rawPercent.toFixed(1))}%`;
      const color = GITHUB_LANG_COLORS[name] || '#38bdf8';
      return { name, bytes, percent, percentDisplay, color };
    }).sort((a, b) => b.bytes - a.bytes);

    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: languages
      }));
    } catch (e) {}

    return languages;
  } catch (err) {
    console.warn(`Failed to fetch languages for ${repoSlug}:`, err);
    try {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : [];
    } catch (_) {
      return [];
    }
  }
}

/**
 * Fetch top-level file directory of a repository with static & localStorage caching
 * @param {string} repoSlug - e.g. "HanazonoArchive/Chromatic-Menu"
 * @returns {Promise<Array|null>} Array of file/directory objects
 */
export async function fetchGitHubContents(repoSlug) {
  if (!repoSlug) return null;

  // 1. Check static cache first
  try {
    const staticCache = await getStaticCache();
    if (staticCache && staticCache[repoSlug] && Array.isArray(staticCache[repoSlug].contents)) {
      return staticCache[repoSlug].contents;
    }
  } catch (_) {}

  const cacheKey = GITHUB_CONTENTS_PREFIX + repoSlug.replace('/', '_');

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < GITHUB_CACHE_TTL && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    }
  } catch (e) {}

  // 3. Network fetch fallback
  try {
    const res = await fetch(`https://api.github.com/repos/${repoSlug}/contents`, {
      headers: getGitHubHeaders()
    });
    if (!res.ok) {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : null;
    }
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    // Sort: directories first, then files alphabetically
    const items = data.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type, // 'dir' or 'file'
      size: item.size || 0,
      htmlUrl: item.html_url
    })).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'dir' ? -1 : 1;
    });

    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: items
      }));
    } catch (e) {}

    return items;
  } catch (err) {
    console.warn(`Failed to fetch GitHub contents for ${repoSlug}:`, err);
    try {
      const stale = localStorage.getItem(cacheKey);
      return stale ? JSON.parse(stale).data : null;
    } catch (_) {
      return null;
    }
  }
}

