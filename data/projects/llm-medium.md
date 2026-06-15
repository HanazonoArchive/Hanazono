---
title: Rei - Live 2D AI Assistant
date: 2026-06-08
languages: [HTML, CSS, JavaScript, Python]
tools: [VS Code, Python Environment, Kokoro TTS, Live2D Cubism]
link:
image: ../data/projects/resources/demo.mp4
summary: A modular, zero-cost AI assistant with intelligent LLM routing, Live2D character, and custom-tuned TTS voice.
---

## Overview

**LLMPixiLive2D** is one of the four parts of our AI assistant system. It acts as our medium holder, forked from **pixi-live2d-display**.

**LLMAPIUI** is one of the four parts of our AI assistant system. It acts as our orchestrator — managing, balancing, and routing for **FreeLLMAPI**. Created by me.

**LLMKokoroTTS** is one of the four parts of our AI assistant system. It acts as the voice for our medium (**LLMPixiLive2D**). It uses Kokoro TTS with carefully tweaked pitch, speed, and EQ to create the appropriate voice for our character.

**FreeLLMAPI** is one of the four parts of our AI assistant system. It acts as our unified API key, aggregating various free LLM APIs from around the internet.

### System Components

| Component | Role |
|-----------|------|
| **FreeLLMAPI** | Provides 1.3B tokens of free LLM access via unified API key |
| **LLMAPIUI** | Intelligent orchestrator — routing, cooldowns, ranker, memory, retries, auto-exclusion |
| **LLMKokoroTTS** | Lightweight text-to-speech engine with custom pitch/EQ tuning for character voice |
| **LLMPixiLive2D** | Browser-based vtuber character with mouse-follow and lipsync integration |

### Key Features

- **Provider-agnostic LLM routing** — Works with any OpenAI-compatible API, auto-discovers available models
- **Smart load balancing** — Latency-weighted ranking + last-tested fairness + cooldown tracking
- **Fault tolerance** — Auto-exclusion of failing models, retry logic, cut-off response recovery
- **Persistent memory** — Conversation history saved across sessions, intelligent context management
- **Text-to-speech with audio engineering** — Pitch, speed, and EQ tuned specifically for the character
- **Live2D integration** — Reactive character with lipsync and mouse tracking
- **Content filtering** — Automatic substitution of inappropriate language with polite alternatives
- **Modular architecture** — Clean separation of concerns (API, state, UI, logging, validation)

### Technical Highlights

- HTTP as universal glue — each component communicates via network, making the system language-agnostic
- Weighted exponential moving average for response latency tracking
- Circuit breaker pattern for model auto-exclusion
- Persistent cooldown state across browser sessions
- One-time guardrail injection carried via context memory
- Async-ready design for future improvements

### What I Learned

- Orchestrating multiple independent systems into a cohesive experience
- Designing for fault tolerance in a resource-constrained environment
- Cross-domain integration — LLMs, TTS, real-time graphics, and audio production
- The importance of documenting for your future self
- Building with zero budget using free APIs and open-source tools

### Next Steps

- Sentence-level TTS chunking to reduce response latency
- Summarized context memory for long conversations
- Open-source release as a foundation for others to build their own AI assistants

### Historical Context

This project revived **ReiPortable** — a local AI assistant that was abandoned due to scope creep and LLM limitations. The new architecture solves both problems through intelligent orchestration and free API aggregation.