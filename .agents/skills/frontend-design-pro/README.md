# frontend-design-pro

Wrapper skill that composes design guardrail skills with the `frontend-design-ultimate` generation workflow. Supports four composition modes for new UI, soft/luxury, minimalist/editorial, and redesign scenarios.

## Install

See **[SETUP.md](SETUP.md)** for full per-tool instructions (Claude Code, Codex, Windsurf, OpenClaw) and the automated setup script.

**Claude Code (quick start):**
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/kesslerio/frontend-design-pro/main/setup.sh)
```

**Codex & Windsurf** — after Claude Code setup:
```bash
compound-plugin sync --target codex
compound-plugin sync --target windsurf
```

## Dependencies

Five skills must be installed before this skill will work:

| Skill | Frontmatter name | Source |
|-------|-----------------|--------|
| Taste guardrails | `design-taste-frontend` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/taste-skill/` |
| Soft/luxury aesthetic | `high-end-visual-design` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/soft-skill/` |
| Minimalist/editorial aesthetic | `minimalist-ui` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/minimalist-skill/` |
| Redesign auditor | `redesign-existing-projects` | [kesslerio/taste-skill](https://github.com/kesslerio/taste-skill) — `skills/redesign-skill/` |
| Generator workflow | `frontend-design-ultimate` | [kesslerio/ultimate-frontend-design-openclaw-skill](https://github.com/kesslerio/ultimate-frontend-design-openclaw-skill) |

## Composition Modes

| Mode | Pipeline | Use when |
|------|----------|----------|
| **New UI** (default) | `design-taste-frontend` → `frontend-design-ultimate` | Building new interfaces with strict anti-slop enforcement |
| **Soft / Luxury** | `high-end-visual-design` → `frontend-design-ultimate` | Cinematic, agency-tier, glass effects, spring physics |
| **Minimalist / Editorial** | `minimalist-ui` → `frontend-design-ultimate` | Notion/Linear-style, warm monochrome, bento grids |
| **Redesign** | `redesign-existing-projects` → `design-taste-frontend` → `frontend-design-ultimate` | Upgrading an existing UI — audit first, then enforce + generate |

Never invert the order within a mode. Guardrails and audits must run before generation.

## Usage

```text
Use frontend-design-pro to build a SaaS landing page.

Use frontend-design-pro in soft/luxury mode for a $150k-agency-tier hero section.

Use frontend-design-pro in minimalist mode for an editorial dashboard.

Use frontend-design-pro to redesign this existing React app — audit it first, then rebuild.
```

## When Not To Use

- Only need guardrails without generation → use `design-taste-frontend`, `high-end-visual-design`, or `minimalist-ui` directly
- Only need generation without guardrails → use `frontend-design-ultimate` directly
- Not doing frontend/UI work
