---
title: .DDS and IDO Header Decompiler & Compiler
date: 2025-12-11
rarity: platinum
languages: [JavaScript, HTML, Python, CSS]
tools: [VS Code]
link: https://github.com/HanazonoArchive/.DDS-Decompiler-Compiler
image:
summary: A cross-platform desktop GUI tool for working with proprietary `.ido` game asset files and `.dds` textures. The application provides decompilation, compilation, and format conversion capabilities through an intuitive dark-themed Electron interface backed by Python processing scripts.
---

## .DDS and IDO Header Decompiler & Compiler

**What it is?**  
A cross-platform desktop GUI tool for working with proprietary `.ido` game asset files and `.dds` textures. It provides decompilation, compilation, and format conversion capabilities through an intuitive dark-themed Electron interface backed by Python processing scripts. The tool can inspect, extract, repack, and convert assets from custom container formats used by games (likely Korean MMOs, given EUC-KR encoding).

**Why I built it?**  
We needed a way to understand what's inside the `.ido` and `.dds` files from a specific game. The original logic existed as a raw CLI tool from another GitHub user (ultimatuuuum), but it wasn't user-friendly. I built this to make file inspection and asset extraction accessible without command-line knowledge.

**What is my role?**  
I took the raw CLI implementation and turned it into a user-friendly desktop application — handling the Electron frontend, UI/UX design, and integrating the Python processing scripts into a seamless GUI experience.

**Challenges**  
- As more file types were supported, the increasing complexity made it harder to reliably detect what type of decompiled code each file contained  
- Figuring out how to identify the correct file format (XML, DDS, TGA, BMP, PNG, Gamebryo blocks, or shop records) required extensive testing with different `.ido` samples  
- Maintaining stable communication between the Electron frontend and Python backend introduced unexpected errors as the tool grew in scope