---
title: Sealed Vault
date: 2026-02-09
rarity: gold
languages: [JavaScript, HTML, Shell, CSS, Dockerfile]
tools: [VS Code, Node.js, Express, SQLite, Docker]
link: https://github.com/HanazonoArchive/SealedVault
image:
summary: A self-hosted, zero-knowledge file vault with military-grade encryption and 3-tier access control. Built for freelancers, small teams, and privacy-conscious users who need to share files securely without relying on third-party cloud services.
---

## Sealed Vault

**What it is?**  
A self-hosted, zero-knowledge file vault with military-grade encryption and 3-tier access control. Built for freelancers, small teams, and privacy-conscious users who need to share files securely without relying on third-party cloud services like Google Drive, Dropbox, or WeTransfer. Every file is encrypted at rest using AES-256-CBC with a unique initialization vector per file — not even the server administrator can read owner files.

**Why I built it?**  
The idea was simple: create an anonymous file sharing website where someone receives a key, uses it, and downloads the file — no account, no trust in third parties, and full control on the host's side.

**What is my role?**  
I was the designer, architect, and idea giver. I let AI handle the coding while I made sure the implementation matched the vision and maintained security standards.

**Challenges**  
- As the 3-tier access hierarchy (Admin → Owner → Client) grew more defined, the increasing complexity made it harder to ensure each layer had exactly the right permissions without accidental privilege leaks  
- Setting up the entire system manually was tedious and error-prone, so I solved it by writing a bash script that automates deployment end-to-end  
- Balancing zero-knowledge principles with practical usability — clients needed time-limited credentials, but those credentials had to be easy enough for non-technical users to understand