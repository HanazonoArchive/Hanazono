---
title: LLMKokoroTTS
date: 2026-06-08
rarity: diamond
languages: [Python]
tools: [VS Code, Python Environment, Kokoro TTS]
profiles: [generalist, ai-ml]
link: https://github.com/HanazonoArchive/LLMKokoroTTS
image: ../data/projects/resources/LLMKokoroTTS.png
summary: Custom-tuned TTS engine that gives our AI character a unique, fitting voice. Part of the Rei AI Assistant system.
---

## LLMKokoroTTS

**What it is?**  
A custom-tuned TTS engine that gives our AI character a unique, fitting voice. It uses Kokoro TTS with carefully tweaked pitch, speed, and EQ (including pitch shift, speed adjustment, and low-frequency cutoff) to create a voice that matches the visual character's personality. The engine is lightweight, fast, and communicates via HTTP for language-agnostic integration.

**Why I built it?**  
As part of the larger Rei AI assistant system, the Live2D character needed a voice that felt natural and matched its personality. Off-the-shelf TTS options either cost money or sounded too robotic, so I built a custom-tuned solution using free Kokoro TTS with audio engineering applied.

**What is my role?**  
Sole developer — I integrated Kokoro TTS, engineered the audio parameters (pitch, speed, EQ) to create the character's unique voice, and set up HTTP-based communication so the orchestrator could trigger TTS independently.

**Challenges**  
- As the voice needed to match the character's personality more precisely, the increasing complexity of audio tuning made it harder to balance naturalness, clarity, and character fit  
- Syncing TTS output with Live2D mouth movements across HTTP introduced timing inconsistencies and playback delays  
- Processing audio in real time while keeping the system lightweight and zero-cost required careful optimization of the Python backend