import { toList } from "./utils.js";

const projectForm = document.getElementById("project-form");
const projectOutput = document.getElementById("project-output");
const projectCopy = document.getElementById("project-copy");

const certForm = document.getElementById("cert-form");
const certOutput = document.getElementById("cert-output");
const certCopy = document.getElementById("cert-copy");

const explorationsForm = document.getElementById("explorations-form");
const explorationsOutput = document.getElementById("explorations-output");
const explorationsCopy = document.getElementById("explorations-copy");

const skillsForm = document.getElementById("skills-form");
const skillsOutput = document.getElementById("skills-output");
const skillsCopy = document.getElementById("skills-copy");

function buildFrontMatter(lines) {
  return ["---", ...lines, "---", ""].join("\n");
}

function addLine(lines, key, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  lines.push(`${key}: ${value}`);
}

function addList(lines, key, list) {
  if (!list || list.length === 0) {
    return;
  }
  lines.push(`${key}: [${list.join(", ")}]`);
}

function buildProjectMarkdown() {
  const data = new FormData(projectForm);
  const lines = [];
  addLine(lines, "title", data.get("title"));
  addLine(lines, "date", data.get("date"));
  addList(lines, "languages", toList(data.get("languages")));
  addList(lines, "tools", toList(data.get("tools")));
  addLine(lines, "link", data.get("link"));
  addLine(lines, "image", data.get("image"));
  addLine(lines, "summary", data.get("summary"));

  const body = data.get("body") || "Write the project story here.";
  return `${buildFrontMatter(lines)}${body}`;
}

function buildCertificationMarkdown() {
  const data = new FormData(certForm);
  const lines = [];
  addLine(lines, "title", data.get("title"));
  addLine(lines, "date", data.get("date"));
  addLine(lines, "certifier", data.get("certifier"));
  addLine(lines, "credential", data.get("credential"));
  addLine(lines, "link", data.get("link"));
  addLine(lines, "image", data.get("image"));
  addLine(lines, "summary", data.get("summary"));

  const body = data.get("body") || "Add coverage notes here.";
  return `${buildFrontMatter(lines)}${body}`;
}

function buildExplorationsMarkdown() {
  const data = new FormData(explorationsForm);
  const lines = [];
  addLine(lines, "title", data.get("title"));
  addLine(lines, "date", data.get("date"));
  addList(lines, "tags", toList(data.get("tags")));
  addLine(lines, "summary", data.get("summary"));

  const body = data.get("body") || "Write the exploration notes here.";
  return `${buildFrontMatter(lines)}${body}`;
}

function buildSkillsJson() {
  const data = new FormData(skillsForm);
  const payload = {
    languages: toList(data.get("languages")),
    tools: toList(data.get("tools")),
    platforms: toList(data.get("platforms")),
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function updateOutputs() {
  projectOutput.value = buildProjectMarkdown();
  certOutput.value = buildCertificationMarkdown();
  explorationsOutput.value = buildExplorationsMarkdown();
  skillsOutput.value = buildSkillsJson();
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  temp.remove();
}

projectForm.addEventListener("input", updateOutputs);
certForm.addEventListener("input", updateOutputs);
explorationsForm.addEventListener("input", updateOutputs);
skillsForm.addEventListener("input", updateOutputs);

projectCopy.addEventListener("click", () => copyToClipboard(projectOutput.value));
certCopy.addEventListener("click", () => copyToClipboard(certOutput.value));
explorationsCopy.addEventListener("click", () => copyToClipboard(explorationsOutput.value));
skillsCopy.addEventListener("click", () => copyToClipboard(skillsOutput.value));

updateOutputs();
