#!/usr/bin/env bash
set -eu

ROOT="/workspaces/Trading/artifacts/trading-intelligence/backend"

echo "=== BACKEND CHECK ==="
if [ ! -d "$ROOT" ]; then
  echo "ERROR: backend directory not found: $ROOT"
  exit 1
fi

cd "$ROOT"

echo
echo "=== PYTHON ==="
python3 --version

echo
echo "=== BACKEND FILES ==="
find app -maxdepth 4 -type f | sort

echo
echo "=== PROJECT DEPENDENCIES ==="
if [ -f requirements.txt ]; then
  cat requirements.txt
else
  echo "requirements.txt not found"
fi

echo
echo "=== VIRTUAL ENVIRONMENT ==="
if [ -x .venv/bin/python ]; then
  .venv/bin/python --version
else
  echo "No backend .venv found"
fi

echo
echo "=== CHECK COMPLETE (read-only; no files changed) ==="
