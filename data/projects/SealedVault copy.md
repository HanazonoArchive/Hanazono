---
title: Sealed Vault
date: 2026-02-09
languages: [JavaScript, HTML, Shell, CSS, Dockerfile]
tools: [VS Code, Node.js, Express, SQLite, Docker]
link: https://github.com/HanazonoArchive/SealedVault
image:
summary: A self-hosted, zero-knowledge file vault with military-grade encryption and 3-tier access control. Built for freelancers, small teams, and privacy-conscious users who need to share files securely without relying on third-party cloud services.
---

## Overview

**Sealed Vault** solves a fundamental problem in file sharing: how do you share sensitive files with clients while maintaining full control over access and zero-knowledge encryption?

Traditional solutions (Google Drive, Dropbox, WeTransfer) require trusting third parties with your data. Sealed Vault flips this -- you host it, you control the keys, you decide who sees what.

The system implements a **3-tier access hierarchy**:
- **Admin** -- system management (create owners, set quotas) with no file access
- **Owner** -- full vault control (upload, share, delete files) with AES-256 encryption
- **Client** -- read-only access via time-limited credentials (no account required)

Every file is encrypted **at rest** using AES-256-CBC with a unique initialization vector per file. Not even the server administrator can read owner files -- the encryption keys are in the server's configuration, but the access control layer prevents admin from decrypting owner data.