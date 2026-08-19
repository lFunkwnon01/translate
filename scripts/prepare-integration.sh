#!/bin/bash
# Prepare integration worktree for Ola 4
# Usage: ./scripts/prepare-integration.sh [agent_a_sha] [agent_b_sha] [agent_c_sha]
set -euo pipefail

WORKTREE="/tmp/opencode/wt-ola4-integration"
AGENT_A_SHA="${1:-}"
AGENT_B_SHA="${2:-}"
AGENT_C_SHA="${3:-}"

echo "=== Ola 4 Integration Preparation ==="
echo ""

# Ensure we're on the integration branch
cd "$WORKTREE"
git checkout agent/ola4-integration
echo "[OK] On branch: $(git branch --show-current)"
echo "[OK] Current HEAD: $(git rev-parse --short HEAD)"
echo ""

# Verify clean worktree
if ! git diff --quiet; then
    echo "[WARN] Working tree has uncommitted changes. Stashing..."
    git stash push -m "integration-prep-stash"
    STASHED=true
else
    STASHED=false
fi

echo "=== Cherry-Pick Sequence ==="
echo "Order: Agent A → Agent B → Agent C"
echo "Agent D (this checklist) merges last"
echo ""

if [ -n "$AGENT_A_SHA" ]; then
    echo "Cherry-picking Agent A (Backend foundation)..."
    git cherry-pick "$AGENT_A_SHA" --no-edit
    echo "[OK] Agent A merged: $AGENT_A_SHA"
else
    echo "[SKIP] Agent A SHA not provided: $AGENT_A_SHA"
    echo "  Run: git cherry-pick <agent_a_sha>"
fi

if [ -n "$AGENT_B_SHA" ]; then
    echo "Cherry-picking Agent B (Frontend + OCR)..."
    git cherry-pick "$AGENT_B_SHA" --no-edit
    echo "[OK] Agent B merged: $AGENT_B_SHA"
else
    echo "[SKIP] Agent B SHA not provided: $AGENT_B_SHA"
    echo "  Run: git cherry-pick <agent_b_sha>"
fi

if [ -n "$AGENT_C_SHA" ]; then
    echo "Cherry-picking Agent C (Tests + Fixtures)..."
    git cherry-pick "$AGENT_C_SHA" --no-edit
    echo "[OK] Agent C merged: $AGENT_C_SHA"
else
    echo "[SKIP] Agent C SHA not provided: $AGENT_C_SHA"
    echo "  Run: git cherry-pick <agent_c_sha>"
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo ""
    echo "Restoring stashed changes..."
    git stash pop
fi

echo ""
echo "=== Integration preparation complete ==="
echo ""
echo "Next steps:"
echo "  1. cd $WORKTREE/backend && python -m pytest -x -v"
echo "  2. cd $WORKTREE/backend && python -m mypy app/"
echo "  3. cd $WORKTREE/backend && python -m ruff check app/"
echo "  4. cd $WORKTREE/backend && python -m compileall app/"
echo "  5. cd $WORKTREE/frontend && npx next build"
echo "  6. cd $WORKTREE/backend && python -m alembic upgrade head"
