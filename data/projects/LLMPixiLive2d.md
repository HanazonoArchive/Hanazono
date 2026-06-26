---
title: REI Live2D Medium
date: 2026-06-08
rarity: gold
languages: [TypeScript, HTML, CSS]
tools: [VS Code, Live2D Cubism]
profiles: [generalist, ai-ml]
category: Artificial Intelligence
link: https://github.com/HanazonoArchive/LLMPixiLive2D
image: ../data/projects/resources/LLMPixiLive2D.png
summary: Live2D Medium of REI
---

## REI Live2D Medium

**What it is?**  
A browser-based Live2D character holder that acts as the visual medium for our AI assistant system. Forked from pixi-live2d-display, it enables a reactive vtuber-style character with mouse-follow interaction, facial expressions, and lipsync animation integration when receiving TTS audio — all running in the browser without external software.

**Why I built it?**  
As part of the larger Rei AI assistant system, the Live2D character needed a lightweight, browser-based medium that could display expressions and move naturally. The original pixi-live2d-display provided the foundation, but I needed to integrate it with our orchestrator and TTS system for lipsync and reactive behavior.

**What is my role?**  
Sole developer — I forked and integrated pixi-live2d-display into our four-part architecture, added mouse-follow behavior, and connected lipsync animation to receive triggers from LLMKokoroTTS.

**Challenges**  
- As the integration between Live2D and TTS deepened, the increasing complexity made it harder to sync lipsync timing with audio playback across HTTP  
- Getting mouse-follow to feel natural while not interfering with the character's other animations required fine-tuning movement thresholds  
- Browser performance constraints meant optimizing the Live2D renderer to stay lightweight while handling continuous mouse tracking and occasional lipsync events