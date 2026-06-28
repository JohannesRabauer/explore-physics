# Explore Physics – Project Specification

## Overview

An interactive physics education website for German and English pupils (grades 5–12). Lessons are experiment-oriented with animated, interactive diagrams that let students explore physical phenomena hands-on.

## Goals

- Bilingual (German / English) with instant language switching
- Grade-based lesson structure (Klasse 5–12)
- Each lesson feels like a virtual experiment, not a lecture
- Rich interactive animations (Canvas/SVG) that respond to user input
- Mobile-friendly, accessible, fast

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro + Svelte islands | Static-first for speed; Svelte for interactive components |
| Animations | HTML Canvas + SVG | Performant physics simulations without heavy deps |
| Styling | Tailwind CSS | Rapid, consistent design |
| i18n | Custom JSON-based (de/en) | Simple, no runtime overhead |
| Build/Deploy | GitHub Actions → GitHub Pages | Free hosting, automatic on push |

## Content Structure

```
/grades
  /5   → Intro topics (forces, magnets, light basics)
  /6   → Sound, temperature, simple machines
  /7   → Optics, density, pressure
  /8   → Electricity basics, energy forms
  /9   → Mechanics (velocity, acceleration, Newton's laws)
  /10  → Waves, radioactivity, electromagnetism
  /11  → Advanced mechanics, thermodynamics
  /12  → Quantum basics, relativity, fields
```

Each grade contains 2–5 lessons. Each lesson contains:
1. A short intro (context / real-world hook)
2. An interactive experiment (the core)
3. Key observations (what the student should notice)
4. A challenge (extend the experiment)

## Interaction Patterns

- **Sliders** to adjust parameters (mass, velocity, angle, voltage)
- **Drag** to reposition objects in simulations
- **Play/Pause/Reset** controls for time-based animations
- **Tooltips** showing live values (force vectors, energy bars)

## i18n Approach

- All UI labels and lesson text stored in `/src/i18n/{de,en}.json`
- Language toggle in the header persists via localStorage
- Lesson content is duplicated per language in frontmatter or JSON

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with grade selector |
| `/grade/{n}` | Lesson list for that grade |
| `/grade/{n}/{lesson-slug}` | Individual lesson with interactive diagram |

## Design Principles

- Dark/light mode support
- Large, clear typography
- Animations are the hero – text supports, doesn't dominate
- Consistent color coding: forces=red, energy=yellow, motion=blue

## Deployment

- GitHub Actions workflow triggers on push to `main`
- Builds Astro static site
- Deploys to GitHub Pages

## Sample Lesson: "Pendulum" (Grade 9)

**Experiment:** A draggable pendulum bob. Student pulls it to different heights and releases. The animation shows:
- Real-time energy bar (kinetic ↔ potential)
- Velocity vector arrow
- Period measurement

**Controls:** Drag bob to set angle, slider for string length, toggle for air resistance.

**Observations:** Period depends on length, not mass. Energy converts but total stays constant (without friction).

## Out of Scope (v1)

- User accounts / progress tracking
- Teacher dashboards
- Video content
- Quizzes / grading
