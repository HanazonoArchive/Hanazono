---
title: SwapNodes Binary Tree Visualization
date: 2024-10-13
languages: [Java, CSS]
tools: [JavaFX, Scenebuilder, IntelliJ IDEA, Gradle]
link: https://github.com/HanazonoArchive/SwapNodes-BinaryTreeVisualization
image:
summary: A JavaFX desktop application that visualizes the binary tree node swapping algorithm.
---

## Overview

A JavaFX desktop application that visualizes the binary tree node swapping algorithm. Allows users to input tree structures and perform depth-based node swaps while viewing animated visual representations of the results.

## Features

- **Interactive Binary Tree Visualization** - Real-time graphical rendering of tree structures
- **Dual Input Methods** - Manual input or file-based batch processing
- **Algorithm Execution Timing** - Nanosecond-precision performance metrics
- **Custom UI Design** - Modern JavaFX interface with styled components
- **Multi-Iteration Display** - View results across multiple swap operations
- **State Management** - Comprehensive app-state tracking using singleton pattern

## Algorithm Overview

The core algorithm performs K-Level Node Swapping on a binary tree:
- For each level (depth) in the tree divisible by K, swap the left and right children
- Supports multiple queries on the same tree structure
- Returns in-order traversals after each swap operation

### Complexity
- **Time:** O(N x Q) where N = number of nodes, Q = number of queries
- **Space:** O(N) for tree storage + O(Q) for results
