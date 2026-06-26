---
title: LLMAPIUI
date: 2026-06-08
rarity: diamond
languages: [JavaScript, HTML, CSS]
tools: [VS Code, LocalStorage API]
profiles: [generalist, ai-ml, security-re, web-dev]
link: https://github.com/HanazonoArchive/LLMAPIUI
image: ../data/projects/resources/LLMAPIUI.png
summary: Intelligent LLM orchestrator with routing, cooldowns, memory, and fault tolerance. Part of the Rei AI Assistant system.
---

## LLMAPIUI

**What it is?**  
An intelligent LLM orchestrator that manages, balances, and routes requests for FreeLLMAPI. It handles provider-agnostic LLM routing (works with any OpenAI-compatible API), smart load balancing with latency-weighted ranking, auto-exclusion of failing models using circuit breaker pattern, persistent conversation memory, cooldown state across sessions, and content filtering with polite word substitution.

**Why I built it?**  
As part of the larger Rei AI assistant system, LLMAPIUI was needed to act as the brain — routing requests intelligently across free LLM APIs while handling failures, memory, and fairness. Without an orchestrator, the free APIs would be unreliable and unpredictable.

**What is my role?**  
Sole developer — I designed and built the entire orchestrator from scratch, including the routing logic, cooldown tracking, memory persistence using LocalStorage API, and fault tolerance mechanisms.

**Challenges**  
- As more free APIs were added to the pool, the increasing complexity of routing logic made it harder to balance fairness, latency, and reliability simultaneously  
- Maintaining persistent cooldown and memory across browser sessions while avoiding data corruption introduced unexpected edge cases  
- The circuit breaker pattern needed careful tuning — excluding failing models too aggressively reduced options, but not aggressively enough led to repeated timeout errors