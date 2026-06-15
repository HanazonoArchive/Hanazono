---
title: ML Anime Recommender
date: 2025-12-18
languages: [Python]
tools: [VS Code, Google Colab]
link: https://github.com/HanazonoArchive/SealedVault
image: ../data/projects/resources/ML-Anime-Recommender.png
summary: A content-based anime recommendation system built with Python and Streamlit. Given any anime, the system retrieves the most similar titles using k-Nearest Neighbors over a 2,601-dimensional feature space, with cosine similarity as the distance metric.
---

## How It Works

The system uses content-based filtering -- it recommends anime based on intrinsic features (genres, synopsis text, type, studios, source material) rather than collaborative user ratings patterns. Each anime is encoded as a sparse feature vector combining:

- Multi-label genre indicators
- TF-IDF features extracted from synopsis text
- One-hot encoded attributes (type, studio, source, status)

A NearestNeighbors model (brute-force, cosine similarity) is pre-trained on approximately 20,000 anime entries and loaded at runtime. When a user selects an anime, its feature vector is retrieved and the model finds the nearest neighbors. Results are deduplicated by normalizing title variants (e.g. "Attack on Titan" vs "Attack on Titan Season 2") before display.