---
title: ML Anime Recommender
date: 2025-12-18
rarity: gold
languages: [Python]
tools: [VS Code, Google Colab]
profiles: [generalist, ai-ml]
category: Machine Learning
link: https://github.com/HanazonoArchive/ML-Anime-Recommender
image: ../data/projects/resources/ML-Anime-Recommender.png
summary: Recommendation System with Machine Learning
---

## ML Anime Recommender

**What it is?**  
A content-based anime recommendation system built with Python and Streamlit. Given any anime, the system retrieves the most similar titles using k-Nearest Neighbors over a 2,601-dimensional feature space, with cosine similarity as the distance metric. Each anime is encoded as a sparse feature vector combining multi-label genre indicators, TF-IDF features from synopsis text, and one-hot encoded attributes (type, studio, source, status).

**Why I built it?**  
This was our Machine Learning final project — we had to take a dataset and build a machine learning model from it. We chose anime recommendation because it gave us the best shot at creating something functional and meaningful.

**What is my role?**  
I handled data pre-processing, set up the Google Colab environment for training, and managed documentation for the project.

**Challenges**  
- As the feature space expanded to 2,601 dimensions, increasing complexity made it harder to avoid overfitting while keeping recommendations relevant  
- Pre-processing the dataset required cleaning synopsis text, normalizing title variants (e.g., "Attack on Titan" vs "Attack on Titan Season 2"), and handling missing values without losing too many entries  
- Balancing the feature weights between genres, text, and attributes was tricky — too much weight on synopsis led to thematically similar but unrelated recommendations