---
title: ML IDS Streamlit
date: 2026-03-10
rarity: gold
languages: [Python]
tools: [VS Code, Google Colab]
profiles: [generalist, ai-ml]
category: Machine Learning
link: https://github.com/HanazonoArchive/ML-IDS-Streamlit
image: ../data/projects/resources/ML-IDS-Streamlit.png
summary: Intrusion Detection System with Machine Learning
---

## ML IDS Streamlit

**What it is?**  
An interactive Intrusion Detection System (IDS) research dashboard that evaluates CatBoost's native categorical handling against six baseline ML algorithms across traditional (UNSW-NB15) and modern IoT (CICIoT 2023) network traffic datasets. The project implements a binary network intrusion detection classifier that distinguishes benign traffic from attacks, investigating whether CatBoost's Ordered Target Statistics can handle cross-dataset distribution shift problems.

**Why I built it?**  
This was our final project for Machine Learning, but this time specifically focused on our specialty — cybersecurity. We wanted to explore how modern ML techniques handle the challenge of deploying IDS models across evolving network environments.

**What is my role?**  
I handled data preprocessing, documentation, and preparation of the Google Colab environment for training and experiments.

**Challenges**  
- As we expanded from single-dataset to cross-dataset evaluation, the increasing complexity made it harder to maintain model performance — single-domain training led to catastrophic ranking collapse with AUC as low as 14.81%  
- Preprocessing two datasets (UNSW-NB15 from 2015 and CICIoT 2023) with different feature schemas required careful alignment and normalization  
- The distribution shift between traditional university network traffic and modern IoT attack testbeds introduced unexpected errors that only a multi-domain "Master" dataset could resolve