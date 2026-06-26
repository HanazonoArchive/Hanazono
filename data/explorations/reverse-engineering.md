---
title: Reverse Engineering
date: 2026-04-15
rarity: diamond
tags: [Ghidra, x64dbg, Cheat Engine, Hxd Hex Editor]
profiles: [generalist, web-dev, security-re, ai-ml]
category: Reverse Engineering
image: ../data/explorations/resources/reverse-engineering.png
summary: Static and dynamic analysis using error tracing, magic signature verification, and memory scanning.
---

## Reverse Engineering

**What it is?**  
Static and dynamic analysis using error tracing, magic signature verification, and memory scanning. The toolkit includes Ghidra, x64dbg, Cheat Engine, and HxD Hex Editor. The approach is error-guided hybrid analysis — inject modifications, trace error strings in Ghidra, analyze call trees, map function connections through decompiled code. File forensics with HxD verifies magic signatures because extensions lie, bytes do not.

**Why I started this?**  
When idate was reviving, I got on my PC and joined their Discord to understand the situation. I wanted to contribute, so I decided to explore. Luckily, they provided a playable version of the game using Node.js as a virtual server. I thought — "I'm a music producer and composer, why don't I make my music playable in the game?" That's where I started learning reverse engineering.

**What I learned?**  
A ton — IDA, Ghidra, HxD Hex Editor, x64dbg, and Cheat Engine. I learned how to reverse engineer by tracing errors and understanding system interactions. The process was fun but also painful due to the complexity — you have to map the entire system in your mind by observing how game files interact with each other.

**Results**  
Another set of skills and tools added to my shed. Gained the ability to contribute to projects like idate by understanding and modifying game behavior at a low level.