# Jay Mark V. Agsoy — Developer Portfolio

A high-performance, dynamic portfolio centered on a 5-phase day-cycle vertical timeline and dedicated split-desk project case studies. Built with vanilla HTML, modern CSS, and modular JavaScript with automatic GitHub API telemetry fetching and client-side caching.

---

## Architecture & Layout

1. **Homepage (`index.html`)**:
   - **Hero**: Profile photo with sky-glow ring, academic badge, bio statement, GitHub link, and resume button.
   - **5-Phase Day-Cycle Timeline**:
     - `02:00 AM` · **Night** (`#060b16` / Sky Blue `#38bdf8`) · *Origins & Low-Level Tinkering*
     - `06:00 AM` · **Early Morning** (`#161220` / Sunrise Gold `#f59e0b`) · *Shipping Chromatic-Menu & Projects*
     - `12:00 PM` · **Daylight** (`#081e3a` / Solar Cyan `#00e5ff`) · *Certiport Database & Security Proofs*
     - `06:00 PM` · **Dusk** (`#1c0f26` / Sunset Coral `#fb7185`) · *Rust Systems & Binary Forensics*
     - `11:00 PM` · **Dark Night** (`#02050d` / Emerald Mint `#10b981`) · *Philosophy & Full Toolkit*
   - **Sticky Companion Desk**:
     - Pure developer perspective displaying dynamic clock, live thought quote, status, roots, and chapter quick-jump links.
   - **Vertical Timeline Spine**:
     - Animated scroll progress line tracking scroll position smoothly without jarring jumps.

2. **Project Case Study (`project.html?id=<slug>`)**:
   - **Split Sticky Desk Layout**:
     - Left Column: Narrative story sections (Design Problem, Solution, Architecture & Performance, screenshot/preview boxes).
     - Right Sticky Column: Repository telemetry (Version, Size, Latency, License), live GitHub stats (Stars, Forks, Language, Latest Commit SHA/message/time), technologies cluster, and other project switchers.

---

## Directory Structure

```
├── index.html                  # Overhauled dynamic homepage
├── project.html                # Dynamic dedicated project case study (?id=<slug>)
├── credentials.html            # Minimal certificate viewer with embedded PDF showcase
├── assets/
│   ├── css/
│   │   ├── portfolio.css       # Core design tokens, solid dark sky palette, typography
│   │   ├── home.css            # Hero, vertical timeline spine, sticky companion card
│   │   ├── project.css         # Split sticky desk layout and telemetry cards
│   │   └── credentials.css     # Clean certification presentation styling
│   ├── js/
│   │   ├── github.js           # Static cache & GitHub API fetcher with static cache fallback
│   │   ├── timeline.js         # Dynamic timeline hydrator & intersection observers
│   │   ├── project.js          # Dynamic case study hydrator (?id=...)
│   │   ├── credentials.js      # Dynamic certification showcase hydrator (?id=...)
│   │   └── transitions.js      # Minimal page navigation transitions
│   └── images/                 # Static branding assets & school logos
│
├── data/                       # Content Management via JSON
│   ├── profile.json            # Name, bio, education, avatar, social & resume links
│   ├── timeline.json           # 5-phase day-cycle timeline chapters & sky colors
│   ├── projects.json           # Projects list, story narratives, and GitHub repo links
│   ├── certifications.json     # Certiport credentials, issuers, tags, and PDF links
│   ├── explorations.json       # Systems explorations and technical ventures
│   ├── skills.json             # Categorized toolkit (Backend, Frontend, Systems, Mobile)
│   └── github-cache.json       # Automated pre-fetched GitHub telemetry cache (0 rate limit)
│
├── scripts/
│   └── update-github-cache.mjs # Pre-fetch script executing in GitHub Actions
│
└── .github/workflows/
    └── update-github-cache.yml # Automated CI workflow updating cache with GITHUB_TOKEN
```

---

## How to Add or Edit Content (Pure JSON)

### 1. Adding a New Project
Open [data/projects.json](data/projects.json) and add an entry:
```json
{
  "id": "my-tool",
  "title": "My Tool",
  "kicker": "CLI Utility",
  "summary": "High speed CLI utility for binary analysis.",
  "featured": true,
  "time": "08:00 AM",
  "githubRepo": "HanazonoArchive/my-tool",
  "githubUrl": "https://github.com/HanazonoArchive/my-tool",
  "version": "v1.0.0",
  "size": "2.4 MB",
  "latency": "< 0.5ms",
  "license": "MIT",
  "technologies": ["Rust", "Clap"],
  "tags": ["CLI", "Rust", "Systems"],
  "image": "/data/projects/resources/my-tool.png",
  "story": [
    {
      "heading": "The Challenge",
      "content": "Why this tool was needed..."
    },
    {
      "heading": "Architecture",
      "content": "How it was engineered with zero dependencies..."
    }
  ]
}
```
- It will **automatically appear** on the homepage timeline under Projects.
- Visiting `project.html?id=my-tool` will **automatically generate** the complete case study page.
- Specifying `githubRepo` will **automatically fetch live GitHub stars, forks, and latest commit info**!

### 2. Adding a Certification
Open [data/certifications.json](data/certifications.json) and add:
```json
{
  "id": "cert-id",
  "kicker": "Certiport Verified",
  "title": "IT Specialist: Cloud Computing",
  "issuer": "Certiport",
  "date": "2026-10-01",
  "description": "Cloud architecture, IAM, serverless compute.",
  "tags": ["Certiport", "Cloud", "Architecture"],
  "pdf": "/data/certifications/resources/Cloud.pdf"
}
```

### 3. Adding Skills
Open [data/skills.json](data/skills.json) and add tools under any category (`Backend`, `Frontend`, `Systems & RE`, `Mobile & Data`).

---

## GitHub API Telemetry & Rate-Limit Bypass

Unauthenticated client-side requests to GitHub REST API have an IP rate limit of only 60 requests/hour, which can easily be exhausted by visitors. To completely eliminate this restriction:

1. **Automated GitHub Actions Pre-fetching (`.github/workflows/update-github-cache.yml`)**:
   - Runs automatically on GitHub runners twice daily (`00:00` and `12:00` UTC), on pushes to `data/projects.json`, and on manual dispatch.
   - Uses the built-in `GITHUB_TOKEN` secret (with a dedicated **1,000–5,000 requests/hour** quota).
   - Pre-fetches stars, forks, commits, releases, branch list, language stats, and directory contents for all repositories listed in [data/projects.json](data/projects.json).
   - Writes the compiled snapshot into [data/github-cache.json](data/github-cache.json) and commits changes automatically.

2. **Zero-Latency Client Hydration (`assets/js/github.js`)**:
   - When visitors view project pages or the homepage timeline, `github.js` reads directly from [data/github-cache.json](data/github-cache.json).
   - Because it is served as a static asset, it doesn't count against GitHub API rate limits and loads like any other static file.
   - If a new repository is added locally before the CI workflow has run, `github.js` gracefully falls back to browser `localStorage` and direct API calls.

---

## Local Development

```bash
python -m http.server 8080
# Visit http://localhost:8080/
```
No build step or dependencies required.
