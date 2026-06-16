# Hanazono Portfolio

A CLI/code-editor themed portfolio website — built with vanilla HTML, CSS, and JavaScript. Data-driven content from JSON and markdown files, deployed on Cloudflare Pages.

**Hanazono** (花園) means "flower garden" — subtly branded with a sakura petal motif.

## Design

VS Code / terminal hybrid aesthetic:
- **Editor chrome** — title bar, file-tab navigation, status bar footer
- **Terminal hero** — `$ whoami`, `$ cat philosophy.txt`, `$ ls ./focus/`
- **Code cards** — projects rendered as syntax-highlighted code files with CSS line numbers
- **Doc cards** — about/bio pages rendered as markdown documents
- **Skills code block** — toolkit displayed as JS array declarations
- **Shell-flag forms** — contact form with `--name`, `--email`, `--message` flags
- **Sakura petals** — subtle CSS-only falling animation (desktop, respects reduced motion)
- **Responsive** — 5 breakpoints (mobile through ultrawide)

## Project Structure

```
├── index.html              # Homepage — terminal hero
├── about/                  # About — doc-card with education & bio
├── projects/               # Projects — code-card grid with modals
├── certifications/         # Certifications — code-card grid
├── explorations/           # Explorations — git-log style cards
├── skills/                 # Skills — code-block card
├── contact/                # Contact — shell-flag form
├── generator.html          # Markdown generator tool
├── data/
│   ├── profile.json        # Name, bio, education, focus, links
│   ├── skills.json         # Languages, tools, platforms
│   ├── config.json         # Site & GitHub config
│   ├── projects/           # Project markdown files + index
│   ├── certifications/     # Certification markdown files + index
│   └── explorations/       # Exploration markdown files + index
└── assets/
    ├── css/styles.css      # All styles (~1400 lines, 17 sections)
    ├── js/
    │   ├── main.js         # Orchestrator — profile, skills, cards
    │   ├── data-loader.js  # JSON + markdown frontmatter loader
    │   ├── modal.js         # Modal + media lightbox
    │   ├── utils.js        # Icons, formatting, syntax highlighting
    │   ├── firebase-stats.js # View counter + visitor clock
    │   ├── contact-form.js # Formspree contact handler
    │   ├── generator.js    # Markdown generator
    │   └── stats.js        # Stats utilities
    └── images/             # Static images
```

## Local Development

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

No build step, no dependencies to install. Pure static HTML/CSS/JS.

## Deployment

Deployed on Cloudflare Pages via `wrangler`. Configuration in `wrangler.jsonc`.

## Content Management

All content lives in `/data/` as JSON (profile, skills, config) or markdown with YAML frontmatter (projects, certifications, explorations). The `generator.html` tool helps create new markdown files with proper frontmatter.

Tech Stack: HTML | JavaScript | CSS
