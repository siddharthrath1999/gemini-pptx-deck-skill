#!/usr/bin/env bash
# PPTX Native installer for Google Antigravity (macOS and Linux).
#
#   curl -fsSL https://raw.githubusercontent.com/siddharthrath1999/pptx-native/main/install.sh | bash
#
# Options (pass after "bash -s --"):
#   --project   install into ./.agents/skills of the current folder instead of your home folder
#   --skip-python   do not install the Python packages
set -euo pipefail

REPO="siddharthrath1999/pptx-native"
BRANCH="main"
SKILL="pptx-native"
MODE="global"
SKIP_PY=0
for arg in "$@"; do
  case "$arg" in
    --project) MODE="project" ;;
    --skip-python) SKIP_PY=1 ;;
    -h|--help) sed -n '2,9p' "$0" 2>/dev/null || true; exit 0 ;;
  esac
done

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }

bold "PPTX Native · installing the skill"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "https://codeload.github.com/${REPO}/tar.gz/refs/heads/${BRANCH}" | tar -xz -C "$TMP"
SRC="$(find "$TMP" -maxdepth 2 -type d -name "$SKILL" | head -n 1)"
if [ -z "$SRC" ] || [ ! -f "$SRC/SKILL.md" ]; then
  echo "Could not find the skill in the download. Please try again later." >&2
  exit 1
fi

if [ "$MODE" = "project" ]; then
  TARGETS=("$PWD/.agents/skills")
else
  TARGETS=("$HOME/.gemini/antigravity/skills" "$HOME/.gemini/config/skills")
fi
for dir in "${TARGETS[@]}"; do
  mkdir -p "$dir"
  rm -rf "${dir:?}/$SKILL"
  cp -R "$SRC" "$dir/$SKILL"
  ok "Skill copied to $dir/$SKILL"
done

bold "Checking what the skill needs"
PY="$(command -v python3 || command -v python || true)"
if [ -z "$PY" ]; then
  warn "Python 3 not found. Install it from python.org, then run this installer again."
elif [ "$SKIP_PY" -eq 1 ]; then
  warn "Skipped Python packages (--skip-python)."
elif "$PY" -c "import pptx, PIL" >/dev/null 2>&1; then
  ok "Python packages already installed"
else
  if "$PY" -m pip install --user --quiet python-pptx pillow >/dev/null 2>&1 \
     || "$PY" -m pip install --user --quiet --break-system-packages python-pptx pillow >/dev/null 2>&1; then
    ok "Installed python-pptx and Pillow"
  else
    warn "Could not install the Python packages. Run: $PY -m pip install --user python-pptx pillow"
  fi
fi

if command -v soffice >/dev/null 2>&1 || command -v libreoffice >/dev/null 2>&1 \
   || [ -x "/Applications/LibreOffice.app/Contents/MacOS/soffice" ]; then
  ok "LibreOffice found (used to preview slides)"
else
  warn "Optional: install LibreOffice so the agent can look at the slides it builds."
  warn "  macOS: brew install --cask libreoffice    Linux: sudo apt install libreoffice"
fi

bold "Done"
echo "  Restart Antigravity (or start a new agent session), then ask:"
echo "  \"Make me a 30-slide deck on ...\""
