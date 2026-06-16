// Skill to icon mapping using Font Awesome (single source of truth)
const skillIconMap = {
  // Languages
  "Python": "fab fa-python",
  "Java": "fab fa-java",
  "JavaScript": "fab fa-js",
  "HTML": "fab fa-html5",
  "CSS": "fab fa-css3",
  "PHP": "fab fa-php",
  "C/C++": "fas fa-copyright",
  "Kotlin": "fas fa-k",
  "SQL": "fas fa-database",

  // Tools & Frameworks
  "Git": "fab fa-git",
  "GitHub": "fab fa-github",
  "VS Code": "fas fa-code",
  "IntelliJ IDEA": "fas fa-terminal",
  "PyCharm": "fas fa-terminal",
  "Django": "fas fa-leaf",
  "Node.js": "fab fa-node-js",
  "React": "fab fa-react",
  "npm": "fab fa-npm",
  "Gradle": "fas fa-hammer",
  "Maven": "fas fa-hammer",
  "Docker": "fab fa-docker",
  "Jupyter": "fas fa-book",
  "MySQL": "fas fa-database",
  "SQLite": "fas fa-database",
  "Wireshark": "fas fa-network-wired",
  "GitHub Actions": "fab fa-github",
  "Electron": "fas fa-desktop",
  "Matplotlib": "fas fa-chart-bar",
  "Vue": "fab fa-vuejs",
  "Laravel": "fab fa-laravel",
  "JavaFX": "fab fa-java",
  "Ghidra": "fas fa-compass-drafting",
  "Hxd Hex Editor": "fas fa-compass-drafting",
  "x64dbg": "fas fa-compass-drafting",
  "Arduino IDE": "fas fa-microchip",
  "Android Studio": "fab fa-android",
  "Streamlit": "fas fa-crown",
  "Google Colab": "fab fa-google",
  "Scenebuilder": "fas fa-panorama",
  "LocalStorage API": "fas fa-database",
  "Python Environment": "fab fa-python",
  "Kokoro TTS": "fas fa-robot",
  "Live2D Cubism": "fas fa-palette",
  "Cheat Engine": "fas fa-compass-drafting",
  "Game Development": "fas fa-gamepad",
  "RPG": "fas fa-gamepad",
  "Award-Winning": "fas fa-trophy",
  "DAW": "fas fa-music",
  "Composition": "fas fa-music",
  "Sound Design": "fas fa-music",
  "Music Production": "fas fa-music",
  "Published": "fas fa-book-open",
  "Figma": "fab fa-figma",
  "Claude Code": "fas fa-robot",
  "Copilot": "fas fa-robot",
  "Deepseek": "fas fa-robot",

  // Platforms
  "Windows": "fab fa-windows",
  "Android": "fab fa-android",
  "Linux": "fab fa-linux",
  "macOS": "fab fa-apple",
};

export function getSkillIcon(skillName) {
  return skillIconMap[skillName] || "fas fa-star";
}

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

/**
 * Lightweight client-side syntax highlighting for code blocks.
 * Applies keyword/string/comment/function coloring via regex.
 */
export function syntaxHighlight(code, lang) {
  if (!code) return code;

  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments
  escaped = escaped.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

  // Strings (double and single quotes)
  escaped = escaped.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="string">$1</span>');
  escaped = escaped.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="string">$1</span>');

  // Template literals
  escaped = escaped.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="string">$1</span>');

  // Keywords
  escaped = escaped.replace(
    /\b(function|const|let|var|return|import|export|from|if|else|for|while|class|new|this|async|await|try|catch|throw|default|switch|case|break|continue|typeof|instanceof|extends|super|static|get|set)\b/g,
    '<span class="keyword">$1</span>'
  );

  // Numbers
  escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

  // Function calls: word followed by (
  escaped = escaped.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="function-name">$1</span>(');

  return escaped;
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
  // Post-process: apply syntax highlighting to code blocks
  const temp = document.createElement("div");
  temp.innerHTML = rawHtml;
  temp.querySelectorAll("pre code").forEach((block) => {
    block.innerHTML = syntaxHighlight(block.textContent || "");
  });
  return window.DOMPurify.sanitize(temp.innerHTML);
}
