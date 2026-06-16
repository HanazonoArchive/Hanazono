---
title: ECS
date: 2024-07-29
rarity: bronze
languages: [Java, CSS]
tools: [JavaFX, Scenebuilder, IntelliJ IDEA, Gradle]
link: https://github.com/HanazonoArchive/ECS
image: ../data/projects/resources/ecs.png
summary: A Desktop Application that helps players accurately calculate how long their energy/power will take to regenerate to maximum.
---
## ECS (Energy System Calculator)

**What it is?**  
A JavaFX-based desktop application that helps players calculate exactly how long their energy or power will take to regenerate to maximum capacity. Simply input current energy, maximum capacity, and regeneration rate to get instant time calculations. Designed for games like Honkai: Star Rail and Zenless Zone Zero.

**Why I built it?**  
My old version of this project from a previous GitHub account was CLI-based and only gave rough approximations of when energy would reach full. I took that old project and added a UI to make it more user-friendly and visually accessible.

**What is my role?**  
Full-stack developer — I built everything from the ground up, including UI design, logic implementation, and deployment.

**Challenges**  
- As the project evolved from CLI to GUI, increasing complexity made it harder to maintain clean separation between calculation logic and UI updates  
- Getting the application compiled into a standalone `.exe` file so it could run anywhere without requiring a Java installation was difficult  
- Ensuring real-time updates as users adjusted input fields introduced more edge cases and potential calculation errors