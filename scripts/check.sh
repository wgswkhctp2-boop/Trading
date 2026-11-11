#!/usr/bin/env bash

# Read-only development environment checks for the Trading workspace.
set -u

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)" || exit 1
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)" || exit 1
APP_DIR="$ROOT_DIR/artifacts/trading-intelligence"
BACKEND_DIR="$APP_DIR/backend"
FAILURES=0

pass() { printf 'PASS: %s\n' "$1"; }
warning() { printf 'WARNING: %s\n' "$1"; }
fail() { printf 'FAIL: %s\n' "$1"; FAILURES=$((FAILURES + 1)); }

printf 'Trading development checks\nRepository root: %s\n' "$ROOT_DIR"

if [ -d "$APP_DIR" ] && [ -d "$APP_DIR/src" ]; then
  pass 'Frontend directory exists (artifacts/trading-intelligence/src)'
else
  fail 'Frontend directory is missing (expected artifacts/trading-intelligence/src)'
fi

if [ -d "$BACKEND_DIR" ] && [ -d "$BACKEND_DIR/app" ]; then
  pass 'Backend directory exists (artifacts/trading-intelligence/backend/app)'
else
  fail 'Backend directory is missing (expected artifacts/trading-intelligence/backend/app)'
fi

if command -v python3 >/dev/null 2>&1; then
  printf 'Python: %s\n' "$(python3 --version 2>&1)"
elif command -v python >/dev/null 2>&1; then
  printf 'Python: %s\n' "$(python --version 2>&1)"
else
  warning 'Python version unavailable (python3/python not found)'
fi

if command -v node >/dev/null 2>&1; then
  printf 'Node.js: %s\n' "$(node --version 2>&1)"
else
  warning 'Node.js version unavailable (node not found)'
fi

if command -v pnpm >/dev/null 2>&1; then
  printf 'pnpm: %s\n' "$(pnpm --version 2>&1)"
else
  warning 'pnpm version unavailable (pnpm not found)'
fi

if [ -d "$ROOT_DIR/node_modules" ] || [ -d "$APP_DIR/node_modules" ]; then
  pass 'Frontend dependencies appear installed (node_modules exists)'
else
  warning 'Frontend dependencies do not appear installed (node_modules not found)'
fi

PYTHON_CMD=''
if command -v python3 >/dev/null 2>&1; then
  PYTHON_CMD=python3
elif command -v python >/dev/null 2>&1; then
  PYTHON_CMD=python
fi

if [ -n "$PYTHON_CMD" ] && [ -d "$BACKEND_DIR" ]; then
  if (cd "$BACKEND_DIR" && "$PYTHON_CMD" -c 'import fastapi, uvicorn' >/dev/null 2>&1); then
    pass 'FastAPI and Uvicorn are importable'
  else
    warning 'FastAPI and/or Uvicorn are not importable in the selected Python environment'
  fi
else
  warning 'Cannot check FastAPI and Uvicorn imports (Python or backend directory unavailable)'
fi

if command -v git >/dev/null 2>&1 && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BRANCH="$(git -C "$ROOT_DIR" branch --show-current 2>/dev/null)"
  if [ -n "$BRANCH" ]; then
    pass "Current Git branch: $BRANCH"
  else
    warning 'Current Git branch is detached or unavailable'
  fi

  if [ -z "$(git -C "$ROOT_DIR" status --porcelain 2>/dev/null)" ]; then
    pass 'Git working tree is clean'
  else
    warning 'Git working tree has changes'
    git -C "$ROOT_DIR" status --short 2>/dev/null
  fi
else
  warning 'Git branch and working-tree status unavailable (not a Git working tree or git not found)'
fi

if [ "$FAILURES" -eq 0 ]; then
  pass 'Development environment check completed'
else
  fail "Development environment check completed with $FAILURES failure(s)"
fi

[ "$FAILURES" -eq 0 ]
