---
title: Lumen
date: 2026-06-26
rarity: diamond
languages: [Rust, HTML, CSS, JavaScript]
tools: [VS Code]
profiles: [generalist, security-re]
link: https://github.com/HanazonoArchive/Lumen
image: ../data/projects/resources/Lumen.png
summary: Lumen - Hex Magic Signature Identifier
---

## Lumen

**What it is?**  
Lumen is a File Identifier specifically focused towards reverse engineering, where it will scan a file hex signature and compare it the database f 700+ signature to determine what kind of file type is the file.

**Why I built it?**  
It solve one specific problem in reverse engineering, which is identifying what kind of data type is the file they are working on.

**What is my role?**  
Sole developer and Designer — This project is AI-Assisted to develope the this tool faster and efficiently, while maintaing a complete control of the project and also ensuring the quality.

**Challenges**  
- Rust's borrow checker required significant refactoring of the hex scanning loop — naive string-based matching worked in tests but failed on edge-case file structures with embedded null bytes
- Packaging a CLI tool for non-technical reverse engineers meant building a cross-platform GUI layer on top of the Rust core, which introduced FFI complexity
- WinRAR archives had no native Rust extraction library that handled all format variants, so we had to shell out to external unarchivers with careful temp-file cleanup