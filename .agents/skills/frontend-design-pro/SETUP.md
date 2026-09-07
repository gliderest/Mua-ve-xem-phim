# Setup Guide — frontend-design-pro

This skill depends on five other skills from two source repos. This guide covers complete installation for Claude Code, Codex, Windsurf, and OpenClaw.

## Dependency Map

```
frontend-design-pro
├── design-taste-frontend      → kesslerio/taste-skill  (skills/taste-skill/)
├── high-end-visual-design     → kesslerio/taste-skill  (skills/soft-skill/)
├── minimalist-ui              → kesslerio/taste-skill  (skills/minimalist-skill/)
├── redesign-existing-projects → kesslerio/taste-skill  (skills/redesign-skill/)
└── frontend-design-ultimate   → kesslerio/ultimate-frontend-design-openclaw-skill
```

All four taste-skill variants live in one repo (`kesslerio/taste-skill`) as subdirectories under `skills/`.

---

## Claude Code

**One-time clone:**

```bash
# Clone source repos to stable locations
git clone https://github.com/kesslerio/taste-skill.git ~/code/taste-skill
git clone https://github.com/kesslerio/ultimate-frontend-design-openclaw-skill.git ~/code/ultimate-frontend-design-skill
git clone https://github.com/kesslerio/frontend-design-pro.git ~/code/frontend-design-pro
```

**Symlink each skill into `~/.claude/skills/`:**

```bash
mkdir -p ~/.claude/skills

# taste-skill subdirectories (each is its own skill)
ln -s ~/code/taste-skill/skills/taste-skill     ~/.claude/skills/design-taste-frontend
ln -s ~/code/taste-skill/skills/soft-skill      ~/.claude/skills/soft-skill
ln -s ~/code/taste-skill/skills/minimalist-skill ~/.claude/skills/minimalist-skill
ln -s ~/code/taste-skill/skills/redesign-skill  ~/.claude/skills/redesign-skill

# ultimate workflow skill (full repo root)
ln -s ~/code/ultimate-frontend-design-skill     ~/.claude/skills/ultimate-frontend-design-skill

# this wrapper skill
ln -s ~/code/frontend-design-pro                ~/.claude/skills/frontend-design-pro
```

**Verify:**

```bash
ls ~/.claude/skills/design-taste-frontend/SKILL.md   # should print the path
ls ~/.claude/skills/soft-skill/SKILL.md
ls ~/.claude/skills/minimalist-skill/SKILL.md
ls ~/.claude/skills/redesign-skill/SKILL.md
ls ~/.claude/skills/ultimate-frontend-design-skill/SKILL.md
ls ~/.claude/skills/frontend-design-pro/SKILL.md
```

Or run the automated setup script (see below).

---

## Codex & Windsurf (via compound-engineering-plugin)

After Claude Code is set up above, [compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) syncs everything automatically. No additional cloning required.

```bash
compound-plugin sync --target codex
compound-plugin sync --target windsurf
```

This copies all six skills (and any others in `~/.claude/skills/`) into:
- Codex: `~/.codex/skills/`
- Windsurf: `~/.codeium/windsurf/skills/`

**Verify (Windsurf):**

```bash
ls ~/.codeium/windsurf/skills/design-taste-frontend/SKILL.md
ls ~/.codeium/windsurf/skills/frontend-design-pro/SKILL.md
```

---

## OpenClaw

OpenClaw uses `~/.openclaw/extensions/` and requires copied directories (not symlinks).

```bash
mkdir -p ~/.openclaw/extensions

# Clone source repos if not already present
git clone https://github.com/kesslerio/taste-skill.git /tmp/taste-skill
git clone https://github.com/kesslerio/ultimate-frontend-design-openclaw-skill.git /tmp/ultimate-frontend-design-skill
git clone https://github.com/kesslerio/frontend-design-pro.git /tmp/frontend-design-pro

# Copy each skill subdirectory
cp -R /tmp/taste-skill/skills/taste-skill      ~/.openclaw/extensions/design-taste-frontend
cp -R /tmp/taste-skill/skills/soft-skill       ~/.openclaw/extensions/soft-skill
cp -R /tmp/taste-skill/skills/minimalist-skill ~/.openclaw/extensions/minimalist-skill
cp -R /tmp/taste-skill/skills/redesign-skill   ~/.openclaw/extensions/redesign-skill
cp -R /tmp/ultimate-frontend-design-skill      ~/.openclaw/extensions/frontend-design-ultimate
cp -R /tmp/frontend-design-pro                 ~/.openclaw/extensions/frontend-design-pro
```

---

## Updating

**Claude Code** — pull the source repos; symlinks pick up changes immediately:

```bash
cd ~/code/taste-skill && git pull
cd ~/code/ultimate-frontend-design-skill && git pull
cd ~/code/frontend-design-pro && git pull
```

**Codex & Windsurf** — re-run sync after pulling:

```bash
compound-plugin sync --target codex
compound-plugin sync --target windsurf
```

**OpenClaw** — re-run the `cp -R` commands above after pulling.

---

## Automated Script (Claude Code)

`setup.sh` in this repo automates the full Claude Code install:

```bash
bash setup.sh
```

See `setup.sh` for what it does before running.

---

## Skill Names (for prompting)

After install, reference skills by their frontmatter `name` field:

| Install dir | Frontmatter name |
|-------------|-----------------|
| `design-taste-frontend` | `design-taste-frontend` |
| `soft-skill` | `high-end-visual-design` |
| `minimalist-skill` | `minimalist-ui` |
| `redesign-skill` | `redesign-existing-projects` |
| `ultimate-frontend-design-skill` | `frontend-design-ultimate` |
| `frontend-design-pro` | `frontend-design-pro` |

The wrapper skill (`frontend-design-pro`) resolves the correct chain automatically based on the mode you request.
