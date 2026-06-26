---
title: Lumen
date: 2026-06-26
rarity: diamond
languages: [Rust, HTML, CSS, JavaScript]
tools: [VS Code]
profiles: [generalist, security-re]
category: Reverse Engineering
link: https://github.com/HanazonoArchive/Lumen
image: ../data/projects/resources/Lumen.png
summary: Lumen - Hex Magic Signature Identifier
---

## Lumen

**What it is?**  
Lumen is a File Identifier specifically focused towards reverse engineering, where it will scan a file's hex signature and compare it to the database of 700+ signatures to determine what kind of extension it originally has.

**Why I built it?**  
It solves one specific problem in reverse engineering, which is identifying what kind of data extension the file is.

**What is my role?**  
Sole developer and Designer — This project is AI-assisted to develop, while maintaining complete control of the project and ensuring the quality.

**Challenges**  
- Rust's borrow checker required significant refactoring of the hex scanning loop — naive string-based matching worked in tests but failed on edge-case file structures with embedded null bytes
- Packaging a CLI tool for non-technical reverse engineers meant building a cross-platform GUI layer on top of the Rust core, which introduced FFI complexity
- WinRAR had no native Rust library that handled all of it, so we had to shell out to an external application with careful temp-file cleanup
