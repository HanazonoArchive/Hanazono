# Portfolio (Static)

A modular, scalable, and straightforward static portfolio built with HTML, CSS, and JavaScript.

## Structure
- index.html - main site
- generator.html - hidden markdown generator
- assets/css/styles.css - theme and layout
- assets/js - modular scripts
- data - profile, skills, and markdown content

## Quick start
1. Update your profile in data/profile.json.
2. Update your skills in data/skills.json.
3. Add markdown files to data/projects and data/certifications.

## Auto listing (no manual index)
Enable GitHub API listing so new markdown files show up automatically:
1. Open data/config.json.
2. Set github.enabled to true.
3. Fill github.user, github.repo, github.branch, and github.basePath.

When enabled, the site reads the contents of data/projects and data/certifications directly from GitHub.

## Local fallback
If github.enabled is false, update:
- data/projects/index.json
- data/certifications/index.json

## Markdown format
Use front matter at the top of each file:

---
title: Example Project
date: 2026-05-14
languages: [Python, JavaScript]
tools: [Docker, PostgreSQL]
link: https://example.com
image: assets/images/example.jpg
summary: Short summary used on cards.
---
Write the full project story here.

## Generator
Open generator.html directly (it is intentionally not linked on the main site).
