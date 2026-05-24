const LIST_KEYS = new Set(["languages", "tools", "tags", "platforms"]);
const BASE_PATH = "/Hanazono"; // Set to "" for local development

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export async function loadConfig() {
  return loadJson(`${BASE_PATH}/data/config.json`);
}

export async function loadProfile() {
  return loadJson(`${BASE_PATH}/data/profile.json`);
}

export async function loadSkills() {
  return loadJson(`${BASE_PATH}/data/skills.json`);
}

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

  return { frontMatter, body };
}

async function fetchGitHubList(type, github) {
  // GitHub API doesn't use basePath - it always accesses from repo root
  const apiUrl = `https://api.github.com/repos/${github.user}/${github.repo}/contents/data/${type}?ref=${github.branch}`;
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  const items = await response.json();
  return items
    .filter((item) => item.type === "file" && item.name.endsWith(".md"))
    .map((item) => ({ name: item.name, url: item.download_url }));
}

async function fetchLocalIndex(type) {
  const index = await loadJson(`${BASE_PATH}/data/${type}/index.json`);
  return (index.items || []).map((name) => ({
    name,
    url: `${BASE_PATH}/data/${type}/${name}`,
  }));
}

function sortByDate(items) {
  return items.sort((a, b) => {
    const aTime = Date.parse(a.date || "");
    const bTime = Date.parse(b.date || "");
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
      return 0;
    }
    return bTime - aTime;
  });
}

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

  const items = [];
  for (const entry of list) {
    const response = await fetch(entry.url);
    if (!response.ok) {
      continue;
    }
    const raw = await response.text();
    const { frontMatter, body } = parseFrontMatter(raw);
    items.push({
      id: entry.name.replace(/\.md$/, ""),
      type,
      title: frontMatter.title || entry.name.replace(/\.md$/, ""),
      date: frontMatter.date || "",
      summary: frontMatter.summary || "",
      link: frontMatter.link || "",
      image: frontMatter.image || "",
      certifier: frontMatter.certifier || "",
      credential: frontMatter.credential || "",
      languages: frontMatter.languages || [],
      tools: frontMatter.tools || [],
      tags: frontMatter.tags || [],
      body,
    });
  }

  return sortByDate(items);
}
