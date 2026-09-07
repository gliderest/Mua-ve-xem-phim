---
name: frontend-design-pro
description: Wrapper skill that composes design guardrail skills with the frontend-design-ultimate generation workflow. Supports four composition modes for new UI, soft/luxury, minimalist/editorial, and redesign scenarios.
---

# Frontend Design Pro

One-command composition layer for premium frontend output. Choose the mode that fits your project type — the skill handles execution order automatically.

## Dependencies

All dependency skills must be installed before this skill will work. Source repos:

| Skill | Frontmatter name | Source |
|-------|-----------------|--------|
| Taste guardrails | `design-taste-frontend` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/taste-skill/` |
| Soft/luxury aesthetic | `high-end-visual-design` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/soft-skill/` |
| Minimalist/editorial aesthetic | `minimalist-ui` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/minimalist-skill/` |
| Redesign auditor | `redesign-existing-projects` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/redesign-skill/` |
| Generator workflow | `frontend-design-ultimate` | [kesslerio/ultimate-frontend-design-openclaw-skill](https://github.com/kesslerio/ultimate-frontend-design-openclaw-skill) |

## Composition Modes

### Mode 1: New UI (default)
**Use when:** Building a new interface from scratch with strict anti-slop enforcement.

```
design-taste-frontend → frontend-design-ultimate
```

1. `design-taste-frontend` — enforce anti-slop constraints, architecture discipline, motion/perf guardrails, and QA gates
2. `frontend-design-ultimate` — execute the full generation workflow (aesthetic direction, scaffolding, responsive implementation)

### Mode 2: Soft / Luxury
**Use when:** The output needs a cinematic, agency-tier, Awwwards-level aesthetic — glass effects, spring physics, double-bezel cards, dramatic whitespace.

```
high-end-visual-design → frontend-design-ultimate
```

1. `high-end-visual-design` — enforce the Vanguard_UI_Architect persona, variance engine (vibe + layout archetypes), haptic micro-aesthetics, motion choreography
2. `frontend-design-ultimate` — scaffold and build

### Mode 3: Minimalist / Editorial
**Use when:** The target aesthetic is clean, document-style, workspace-tier (Notion / Linear / Craft) — warm monochrome, editorial serifs, bento grids, no gradients.

```
minimalist-ui → frontend-design-ultimate
```

1. `minimalist-ui` — enforce warm monochrome palette, typographic contrast, flat bento layouts, ultra-diffuse shadows, muted pastel accents
2. `frontend-design-ultimate` — scaffold and build

### Mode 4: Redesign (existing UI)
**Use when:** Upgrading an existing website or app — audit what's broken first, then enforce guardrails and regenerate.

```
redesign-existing-projects → design-taste-frontend → frontend-design-ultimate
```

1. `redesign-existing-projects` — scan codebase, diagnose generic patterns (typography, color, layout, interactivity, components, iconography), apply targeted fixes
2. `design-taste-frontend` — enforce anti-slop constraints on the improved base
3. `frontend-design-ultimate` — generate the final production-ready output

## Execution Order

Never invert the order within a mode. Guardrails and audits must run before generation.

## Quick Usage Prompts

**New UI:**
- "Use frontend-design-pro to build a SaaS landing page with strict anti-slop guardrails and a complete production-ready React/Tailwind implementation."
- "Apply frontend-design-pro for a mobile-first marketing site with strong typography, disciplined motion, and clean deployment-ready output."

**Soft / Luxury:**
- "Use frontend-design-pro in soft/luxury mode to build a premium agency portfolio. Cinematic, glass effects, spring physics."
- "Apply high-end-visual-design then frontend-design-ultimate for a $150k-agency-tier SaaS hero section."

**Minimalist / Editorial:**
- "Use frontend-design-pro in minimalist mode for an editorial dashboard — Notion-style, warm monochrome, bento grid."
- "Apply minimalist-ui then frontend-design-ultimate for a clean workspace-tier landing page."

**Redesign:**
- "Use frontend-design-pro to redesign this dashboard: audit the existing UI for generic patterns first, enforce taste guardrails, then generate a bold but maintainable frontend."
- "Apply frontend-design-pro redesign mode to this React app — scan for AI slop, fix it, then rebuild with full production discipline."

## When To Use

- You want one-command UX that combines design guardrails with end-to-end frontend generation.
- You need high-quality React/Next.js/Vite UI output with explicit anti-generic constraints.
- You want consistent production discipline across layout, motion, responsiveness, and implementation.

## When Not To Use

- You only need guardrails without generation — use `design-taste-frontend`, `high-end-visual-design`, or `minimalist-ui` directly.
- You only need the generation workflow without guardrails — use `frontend-design-ultimate` directly.
- You are not doing frontend/UI work.
