const LIST_KEYS = new Set(["languages", "tools", "tags", "platforms"]);

// Compute the relative path to the site root based on the current page depth.
// Root page "/" or "/index.html" → "."; "/about/" → ".."; etc.
function getRoot() {
  const path = window.location.pathname.replace(/\/$/, "");
  const depth = path.split("/").filter(Boolean).length;
  return depth === 0 ? "." : Array(depth).fill("..").join("/");
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`);
  }
  return response.json();
}

// ── Config (loaded relatively — works locally, on Cloudflare Pages, and on GitHub Pages) ──
let _configPromise = null;

export function loadConfig() {
  if (!_configPromise) {
    const root = getRoot();
    _configPromise = loadJson(`${root}/data/config.json`);
  }
  return _configPromise;
}

// ── Build the CDN base from config after it loads ──
async function getCdnBase() {
  const config = await loadConfig();
  const g = config.github || {};
  return `https://raw.githubusercontent.com/${g.user || "HanazonoArchive"}/${g.repo || "Hanazono"}/${g.branch || "main"}`;
}

// ── Profile & skills (loaded relatively — always reflects local state) ──
let _profilePromise = null;
let _skillsPromise = null;

export async function loadProfile() {
  if (!_profilePromise) {
    const root = getRoot();
    _profilePromise = loadJson(`${root}/data/profile.json`);
  }
  return _profilePromise;
}

export async function loadSkills() {
  if (!_skillsPromise) {
    const root = getRoot();
    _skillsPromise = loadJson(`${root}/data/skills.json`);
  }
  return _skillsPromise;
}

// ── Frontmatter parser ──
function parseFrontMatter(raw) {
  if (!raw.startsWith("---")) {
    return { frontMatter: {}, body: raw.trim() };
  }
  const end = raw.indexOf("\n---");
  if (end === -1) {
    return { frontMatter: {}, body: raw.trim() };
  }
  const frontMatterRaw = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();
  const frontMatter = {};

  frontMatterRaw.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) {
      return;
    }
    const key = match[1].trim();
    let value = match[2].trim();
    if (LIST_KEYS.has(key)) {
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value.slice(1, -1);
      }
      frontMatter[key] = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return;
    }
    if (value === "\"\"" || value === "''") {
      value = "";
    }
    frontMatter[key] = value;
  });

  // Validate rarity if present
  if (frontMatter.rarity) {
    const valid = ["gold", "silver", "bronze", "platinum", "diamond"];
    const r = String(frontMatter.rarity).toLowerCase().trim();
    frontMatter.rarity = valid.includes(r) ? r : undefined;
  }

  return { frontMatter, body };
}

// ── Fetch a single markdown item and parse it ──
async function fetchMarkdownItem(entry) {
  try {
    const response = await fetch(entry.url);
    if (!response.ok) {
      return null;
    }
    const raw = await response.text();
    const { frontMatter, body } = parseFrontMatter(raw);
    return {
      id: entry.name.replace(/\.md$/, ""),
      title: frontMatter.title || entry.name.replace(/\.md$/, ""),
      date: frontMatter.date || "",
      summary: frontMatter.summary || "",
      link: frontMatter.link || "",
      image: frontMatter.image || "",
      file: frontMatter.file || "",
      certifier: frontMatter.certifier || "",
      credential: frontMatter.credential || "",
      rarity: frontMatter.rarity || "",
      languages: frontMatter.languages || [],
      tools: frontMatter.tools || [],
      tags: frontMatter.tags || [],
      body,
    };
  } catch {
    return null;
  }
}

// ── GitHub API listing (only when github.enabled is true) ──
async function fetchGitHubList(type, github) {
  const apiUrl = `https://api.github.com/repos/${github.user}/${github.repo}/contents/data/${type}?ref=${github.branch}`;
  const response = await fetch(apiUrl, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  const items = await response.json();
  return items
    .filter((item) => item.type === "file" && item.name.endsWith(".md"))
    .map((item) => ({ name: item.name, url: item.download_url }));
}

// ── Local index.json fallback ──
async function fetchLocalIndex(type) {
  const base = await getCdnBase();
  const index = await loadJson(`${base}/data/${type}/index.json`);
  return (index.items || []).map((name) => ({
    name,
    url: `${base}/data/${type}/${name}`,
  }));
}

// ── Rarity ranking (highest → lowest) ──
const RARITY_RANK = { diamond: 0, platinum: 1, gold: 2, silver: 3, bronze: 4 };

function sortByRarity(items) {
  return items.sort((a, b) => {
    const ar = RARITY_RANK[a.rarity] ?? 5;
    const br = RARITY_RANK[b.rarity] ?? 5;
    return ar - br;
  });
}

// ── Main entry: load all markdown items for a content type ──
export async function loadMarkdownItems(type, config) {
  let list = [];
  if (config?.github?.enabled) {
    try {
      list = await fetchGitHubList(type, config.github);
    } catch (error) {
      console.warn("GitHub listing failed, falling back to local index.", error);
      list = await fetchLocalIndex(type);
    }
  } else {
    list = await fetchLocalIndex(type);
  }

  // Fetch all markdown files in parallel
  const results = await Promise.all(list.map((entry) => fetchMarkdownItem(entry)));

  const items = results.filter(Boolean);
  return sortByRarity(items);
}
