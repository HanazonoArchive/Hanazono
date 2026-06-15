---
title: .DDS and IDO Header Decompiler & Compiler
date: 2025-12-11
languages: [JavaScript, HTML, Python, CSS]
tools: [VS Code]
link: https://github.com/HanazonoArchive/.DDS-Decompiler-Compiler
image:
summary: A cross-platform desktop GUI tool for working with proprietary `.ido` game asset files and `.dds` textures. The application provides decompilation, compilation, and format conversion capabilities through an intuitive dark-themed Electron interface backed by Python processing scripts.
---

## Overview

This tool processes `.ido` files -- a custom container format used by games (likely Korean MMOs, given EUC-KR encoding). The format consists of a binary header followed by zlib-compressed content that may contain XML data, texture data (DDS, TGA, BMP, PNG), Gamebryo state blocks, or shop database records. The application can inspect, extract, repack, and convert these assets.

The original compiler/decompiler/converter logic was implemented in Rust by [ultimatuuuum](https://github.com/ultimatuuuum). This project reimplements the functionality in Python with an Electron GUI shell.