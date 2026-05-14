export function byId(id) {
  return document.getElementById(id);
}

export function toList(value) {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function renderChips(container, items, accentFirst = false) {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (!items || items.length === 0) {
    return;
  }
  items.forEach((item, index) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    if (accentFirst && index === 0) {
      chip.classList.add("accent");
    }
    chip.textContent = item;
    container.appendChild(chip);
  });
}

export function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function extractSummary(markdown, fallback = "") {
  if (!markdown) {
    return fallback;
  }
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) {
    return fallback;
  }
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export function markdownToHtml(markdown) {
  if (!window.marked || !window.DOMPurify) {
    return markdown;
  }
  window.marked.setOptions({
    gfm: true,
    breaks: false,
    mangle: false,
    headerIds: false,
  });
  const rawHtml = window.marked.parse(markdown);
  return window.DOMPurify.sanitize(rawHtml);
}
