---
title: ML IDS Streamlit
date: 2026-03-10
languages: [Python]
tools: [VS Code, Google Colab]
link: https://github.com/HanazonoArchive/SealedVault
image: ../data/projects/resources/ML-IDS-Streamlit.png
summary: An interactive Intrusion Detection System (IDS) research dashboard that evaluates CatBoost's native categorical handling against six baseline ML algorithms across traditional (UNSW-NB15) and modern IoT (CICIoT 2023) network traffic datasets.
---

## Overview

This project implements a binary network intrusion detection classifier that distinguishes benign traffic from attacks. It investigates how **CatBoost's Ordered Target Statistics** — a native categorical feature encoding method — handles the cross-dataset distribution shift problem that plagues IDS models when deployed across evolving network environments.

**Key research question:** Can CatBoost's native categorical handling enable more stable transfer of predictive logic between traditional university network traffic (UNSW-NB15, 2015) and modern IoT attack testbeds (CICIoT 2023)?

The answer is a qualified yes — but only when trained on a multi-domain "Master" dataset that includes both distributions. Single-domain training leads to catastrophic ranking collapse on cross-domain evaluation (AUC as low as 14.81%).