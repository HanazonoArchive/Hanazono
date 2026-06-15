---
title: Reverse Engineering
date: 2026-04-15
tags: [Ghidra, x64dbg, Cheat Engine, Hxd Hex Editor]
image: ../data/explorations/resources/reverse-engineering.png
summary: Static and dynamic analysis using error tracing, magic signature verification, and memory scanning.
---

## Approach

Error-guided hybrid analysis. Inject modifications, trace error strings in Ghidra, analyze call trees, map function connections through decompiled code.

## File Forensics

Use HxD to verify magic signatures. Extensions lie, bytes do not.

## Runtime Analysis

Memory scanning with Cheat Engine and x64dbg. Understand offsets as landmarks, even when addresses change.

## Targets

Primarily dead games and personal RE exercises. Emphasizes understanding over automation.
