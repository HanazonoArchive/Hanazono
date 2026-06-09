---
title: LLMAPIUI
date: 2026-06-08
languages: [JavaScript, HTML, CSS]
tools: [VS Code, LocalStorage API]
link: https://github.com/HanazonoArchive/LLMAPIUI
image: ../data/projects/resources/LLMAPIUI.png
summary: Intelligent LLM orchestrator with routing, cooldowns, memory, and fault tolerance.
---

## Overview

**LLMAPIUI** is one of the four parts of our AI assistant system. It acts as our orchestrator — managing, balancing, and routing requests for **FreeLLMAPI**. Created entirely by me.

### Key Features

- Provider-agnostic LLM routing (works with any OpenAI-compatible API)
- Smart load balancing with latency-weighted ranking
- Auto-exclusion of failing models (circuit breaker pattern)
- Persistent conversation memory and cooldown state
- Content filtering with polite word substitution