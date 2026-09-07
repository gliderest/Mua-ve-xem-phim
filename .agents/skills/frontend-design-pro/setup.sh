#!/usr/bin/env bash
# setup.sh — Install frontend-design-pro and all dependencies for Claude Code
#
# What this does:
#   1. Clones kesslerio/taste-skill and kesslerio/ultimate-frontend-design-openclaw-skill
#      to ~/code/ (skips if already present)
#   2. Symlinks all six skills into ~/.claude/skills/
#   3. Verifies SKILL.md is reachable at each symlink
#
# For Codex/Windsurf: run `compound-plugin sync` after this script.
# For OpenClaw: see SETUP.md for cp-based instructions.

set -euo pipefail

SKILLS_DIR="$HOME/.claude/skills"
CODE_DIR="$HOME/code"

TASTE_REPO="https://github.com/kesslerio/taste-skill.git"
ULTIMATE_REPO="https://github.com/kesslerio/ultimate-frontend-design-openclaw-skill.git"
PRO_REPO="https://github.com/kesslerio/frontend-design-pro.git"

TASTE_DIR="$CODE_DIR/taste-skill"
ULTIMATE_DIR="$CODE_DIR/ultimate-frontend-design-skill"
PRO_DIR="$CODE_DIR/frontend-design-pro"

echo "==> Checking dependencies: git"
command -v git >/dev/null 2>&1 || { echo "ERROR: git is required but not installed."; exit 1; }

echo "==> Creating directories"
mkdir -p "$SKILLS_DIR"
mkdir -p "$CODE_DIR"

# Clone or pull source repos

clone_or_pull() {
  local repo="$1"
  local dir="$2"
  if [ -d "$dir/.git" ]; then
    echo "==> Updating $dir"
    git -C "$dir" pull --ff-only
  else
    echo "==> Cloning $repo → $dir"
    git clone "$repo" "$dir"
  fi
}

clone_or_pull "$TASTE_REPO"    "$TASTE_DIR"
clone_or_pull "$ULTIMATE_REPO" "$ULTIMATE_DIR"
clone_or_pull "$PRO_REPO"      "$PRO_DIR"

# Symlink helper: create only if not already pointing to the right target

make_symlink() {
  local target="$1"
  local link="$2"
  local name
  name="$(basename "$link")"

  if [ -L "$link" ]; then
    existing=$(readlink "$link")
    if [ "$existing" = "$target" ]; then
      echo "    OK (exists): $name"
      return
    else
      echo "    Replacing stale symlink: $name ($existing → $target)"
      rm "$link"
    fi
  elif [ -e "$link" ]; then
    echo "    SKIP (real directory exists — remove manually to replace): $link"
    return
  fi

  ln -s "$target" "$link"
  echo "    Linked: $name"
}

echo "==> Symlinking skills into $SKILLS_DIR"
make_symlink "$TASTE_DIR/skills/taste-skill"      "$SKILLS_DIR/design-taste-frontend"
make_symlink "$TASTE_DIR/skills/soft-skill"       "$SKILLS_DIR/soft-skill"
make_symlink "$TASTE_DIR/skills/minimalist-skill" "$SKILLS_DIR/minimalist-skill"
make_symlink "$TASTE_DIR/skills/redesign-skill"   "$SKILLS_DIR/redesign-skill"
make_symlink "$ULTIMATE_DIR"                      "$SKILLS_DIR/ultimate-frontend-design-skill"
make_symlink "$PRO_DIR"                           "$SKILLS_DIR/frontend-design-pro"

# Verify each SKILL.md is reachable

echo "==> Verifying installs"
FAILED=0
for skill in design-taste-frontend soft-skill minimalist-skill redesign-skill ultimate-frontend-design-skill frontend-design-pro; do
  path="$SKILLS_DIR/$skill/SKILL.md"
  if [ -f "$path" ]; then
    echo "    OK: $skill"
  else
    echo "    MISSING: $path"
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "ERROR: One or more SKILL.md files are missing. Check the output above."
  exit 1
fi

echo ""
echo "Done. All six skills installed in $SKILLS_DIR."
echo ""
echo "Next steps:"
echo "  Codex:    compound-plugin sync --target codex"
echo "  Windsurf: compound-plugin sync --target windsurf"
echo "  OpenClaw: see SETUP.md for manual cp instructions"
