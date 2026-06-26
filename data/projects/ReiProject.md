---
title: Rei - Live 2D AI Assistant
date: 2026-06-08
rarity: diamond
languages: [HTML, CSS, JavaScript, Python]
tools: [VS Code, Python Environment, Kokoro TTS, Live2D Cubism]
profiles: [generalist, ai-ml, security-re]
link:
image: ../data/projects/resources/demo.mp4
summary: A modular, zero-cost AI assistant with intelligent LLM routing, Live2D character, and custom-tuned TTS voice. Flagship project — includes LLMAPIUI, LLMKokoroTTS, and LLMPixiLive2D as components.
---

## Rei - Live 2D AI Assistant

**What it is?**  
A modular, zero-cost AI assistant with intelligent LLM routing, Live2D character integration, and custom-tuned TTS voice. It consists of four interconnected systems: **LLMPixiLive2D** (Live2D character medium), **LLMKokoroTTS** (text-to-speech with custom pitch/EQ tuning), **LLMAPIUI** (orchestrator for routing, cooldowns, memory, and retries), and **FreeLLMAPI** (unified API key provider aggregating 1.3B tokens from free LLM APIs across the internet).

**Why I built it?**  
This project is the successor to ReiPortable — an old local AI assistant that died due to scope creep and lack of proper tools. My goal was to create a closer version of Neuro-sama using only free LLM APIs found online. The four-part architecture solves the previous project's limitations through intelligent orchestration and free API aggregation.

**What is my role?**  
Full-stack developer using a three-phase approach:
- **Phase 1 (Plausibility)** — Ran the project at bare minimum to see if it worked
- **Phase 2 (Stability & Foundation)** — Converted the project into scalable, maintainable, and modular architecture
- **Phase 3 (Expanding & Scaling)** — Added features and improvements

**Challenges**  
- As the four independent systems grew more interconnected, the increasing complexity made communication between them harder to manage — HTTP as the universal glue helped but introduced network-related bugs  
- Getting Live2D mouth movement to sync properly with Kokoro TTS output required extensive timing adjustments and cross-system coordination  
- Each new feature (memory persistence, auto-exclusion, latency tracking) increased the potential for cascading errors across all four components