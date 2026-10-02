/**
 * GitHub API Cache Generator Script
 * 
 * Pre-fetches telemetry (stars, forks, commits, releases, branches, languages, and directory tree)
 * for all repositories listed in data/projects.json using GITHUB_TOKEN (1,000-5,000 req/hr).
 * 
 * Output: data/github-cache.json
 * This eliminates client-side rate limits (60 req/hr) by serving pre-computed static JSON.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

const PROJECTS_FILE = resolve(ROOT_DIR, 'data', 'projects.json');
const CACHE_FILE = resolve(ROOT_DIR, 'data', 'github-cache.json');

const GITHUB_LANG_COLORS = {
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

function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Hanazono-Cache-Bot'
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && token.trim().length > 0) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

async function fetchRepoData(repoSlug) {
  const headers = getHeaders();
  console.log(`[Cache Builder] Fetching data for ${repoSlug}...`);

  // 1. Repo base details
  const repoRes = await fetch(`https://api.github.com/repos/${repoSlug}`, { headers });
  if (!repoRes.ok) {
    const errorText = await repoRes.text().catch(() => '');
    throw new Error(`Failed to fetch repo ${repoSlug}: HTTP ${repoRes.status} ${errorText}`);
  }
  const repoData = await repoRes.json();

  // 2. Latest commit
  let latestCommit = null;
  try {
    const commitRes = await fetch(`https://api.github.com/repos/${repoSlug}/commits?per_page=1`, { headers });
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
  } catch (err) {
    console.warn(`[Cache Builder] Warning: Could not fetch commit for ${repoSlug}:`, err.message);
  }

  // 3. Latest release
  let latestRelease = null;
  try {
    const relRes = await fetch(`https://api.github.com/repos/${repoSlug}/releases/latest`, { headers });
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
  } catch (err) {
    console.warn(`[Cache Builder] Warning: Could not fetch release for ${repoSlug}:`, err.message);
  }

  // 4. Branches
  let branches = [repoData.default_branch || 'main'];
  try {
    const branchRes = await fetch(`https://api.github.com/repos/${repoSlug}/branches`, { headers });
    if (branchRes.ok) {
      const branchData = await branchRes.json();
      if (Array.isArray(branchData)) {
        branches = branchData.map(b => b.name);
      }
    }
  } catch (err) {
    console.warn(`[Cache Builder] Warning: Could not fetch branches for ${repoSlug}:`, err.message);
  }

  // 5. Languages
  let languages = [];
  try {
    const langRes = await fetch(`https://api.github.com/repos/${repoSlug}/languages`, { headers });
    if (langRes.ok) {
      const langData = await langRes.json();
      if (langData && typeof langData === 'object') {
        let totalBytes = 0;
        for (const bytes of Object.values(langData)) {
          totalBytes += bytes;
        }
        if (totalBytes > 0) {
          languages = Object.entries(langData).map(([name, bytes]) => {
            const rawPercent = (bytes / totalBytes) * 100;
            const percent = rawPercent < 0.2 ? 0.2 : parseFloat(rawPercent.toFixed(1));
            const percentDisplay = rawPercent < 0.1 ? '< 0.1%' : `${parseFloat(rawPercent.toFixed(1))}%`;
            const color = GITHUB_LANG_COLORS[name] || '#38bdf8';
            return { name, bytes, percent, percentDisplay, color };
          }).sort((a, b) => b.bytes - a.bytes);
        }
      }
    }
  } catch (err) {
    console.warn(`[Cache Builder] Warning: Could not fetch languages for ${repoSlug}:`, err.message);
  }

  // 6. Contents (Root file tree)
  let contents = null;
  try {
    const contentRes = await fetch(`https://api.github.com/repos/${repoSlug}/contents`, { headers });
    if (contentRes.ok) {
      const contentData = await contentRes.json();
      if (Array.isArray(contentData)) {
        contents = contentData.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size || 0,
          htmlUrl: item.html_url
        })).sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'dir' ? -1 : 1;
        });
      }
    }
  } catch (err) {
    console.warn(`[Cache Builder] Warning: Could not fetch contents for ${repoSlug}:`, err.message);
  }

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

  return {
    telemetry,
    branches,
    languages,
    contents,
    cachedAt: new Date().toISOString()
  };
}

async function main() {
  console.log('[Cache Builder] Starting GitHub API telemetry pre-fetcher...');
  const hasToken = Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim());
  console.log(`[Cache Builder] Auth state: ${hasToken ? 'Authenticated via GITHUB_TOKEN (high rate limit)' : 'Unauthenticated (standard 60 req/hr limit)'}`);

  // Load existing cache to preserve entries on individual failures
  let existingCache = { generatedAt: null, repos: {} };
  try {
    const rawCache = await readFile(CACHE_FILE, 'utf-8');
    existingCache = JSON.parse(rawCache);
    if (!existingCache.repos) existingCache.repos = {};
  } catch (_) {
    // No existing cache file yet
  }

  // Read projects.json
  const rawProjects = await readFile(PROJECTS_FILE, 'utf-8');
  const projects = JSON.parse(rawProjects);
  const repoSlugs = [...new Set(projects.map(p => p.githubRepo).filter(Boolean))];

  console.log(`[Cache Builder] Found ${repoSlugs.length} unique repository target(s): ${repoSlugs.join(', ')}`);

  const updatedRepos = { ...existingCache.repos };

  for (const slug of repoSlugs) {
    try {
      const data = await fetchRepoData(slug);
      updatedRepos[slug] = data;
      console.log(`[Cache Builder] Successfully cached ${slug}`);
    } catch (err) {
      console.error(`[Cache Builder] Failed to update ${slug}:`, err.message);
      if (existingCache.repos[slug]) {
        console.log(`[Cache Builder] Retaining previously cached entry for ${slug}`);
      }
    }
  }

  const finalOutput = {
    generatedAt: new Date().toISOString(),
    repos: updatedRepos
  };

  await writeFile(CACHE_FILE, JSON.stringify(finalOutput, null, 2) + '\n', 'utf-8');
  console.log(`[Cache Builder] Cache file successfully saved to ${CACHE_FILE}`);
}

main().catch(err => {
  console.error('[Cache Builder] Fatal error during cache generation:', err);
  process.exit(1);
});
