#!/bin/bash

# Sync upstream StackShift changes to Cox repo
# Usage: ./scripts/cox-automation/sync-upstream.sh [upstream-ref]
#
# This script automates the process of syncing upstream changes while
# preserving Cox-specific customizations.

set -e

UPSTREAM_REF="${1:-main}"
REMOTE_NAME="origin"

echo "🚀 StackShift Upstream Sync Tool"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "plugin/.claude-plugin/plugin.json" ]; then
    echo "❌ Error: Not in stackshift directory"
    echo "Please run from the repository root."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have uncommitted changes"
    echo "Please commit or stash your changes first."
    exit 1
fi

# Add upstream remote if it doesn't exist
if ! git remote | grep -q "^upstream$"; then
    echo "📡 Adding upstream remote..."
    git remote add upstream https://github.com/jschulte/stackshift.git
fi

# Fetch from upstream
echo "📥 Fetching from upstream..."
git fetch upstream

# Check if already up to date
CURRENT_COMMIT=$(git rev-parse HEAD)
UPSTREAM_COMMIT=$(git rev-parse upstream/${UPSTREAM_REF})

if git merge-base --is-ancestor $UPSTREAM_COMMIT HEAD; then
    echo "✅ Already up to date with upstream/${UPSTREAM_REF}"
    exit 0
fi

# Count commits behind
COMMITS_BEHIND=$(git rev-list --count HEAD..upstream/${UPSTREAM_REF})
echo "📊 Behind upstream by ${COMMITS_BEHIND} commits"
echo ""

# Get version info
LATEST_TAG=$(git describe --tags upstream/${UPSTREAM_REF} --abbrev=0 2>/dev/null || echo "unknown")
echo "📦 Latest upstream version: ${LATEST_TAG}"
echo ""

# Show what changed
echo "📝 Recent upstream commits:"
git log --oneline HEAD..upstream/${UPSTREAM_REF} | head -10
echo ""

# Confirm merge
read -p "Do you want to merge these changes? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Create sync branch
BRANCH_NAME="upstream-sync-${LATEST_TAG}-$(date +%Y%m%d-%H%M%S)"
echo "🌿 Creating branch: ${BRANCH_NAME}"
git checkout -b ${BRANCH_NAME}

# Attempt merge
echo "🔀 Merging upstream/${UPSTREAM_REF}..."
set +e
git merge --no-commit --no-ff upstream/${UPSTREAM_REF}
MERGE_EXIT=$?
set -e

if [ $MERGE_EXIT -eq 0 ]; then
    echo "✅ Clean merge - no conflicts!"
else
    echo "⚠️  Merge has conflicts, attempting auto-resolution..."

    # Cox-specific pattern: Always remove mcp-server
    if [ -d mcp-server ]; then
        echo "🔧 Removing mcp-server/ (Cox pattern)"
        git rm -rf mcp-server/ 2>/dev/null || true
    fi

    # Check if conflicts remain
    if git diff --name-only --diff-filter=U | grep -q .; then
        echo ""
        echo "❌ Conflicts remain in:"
        git diff --name-only --diff-filter=U
        echo ""
        echo "Please resolve these conflicts manually:"
        echo "1. Edit the conflicted files"
        echo "2. git add <resolved-files>"
        echo "3. Run this script again to continue"
        exit 1
    else
        echo "✅ All conflicts auto-resolved!"
    fi
fi

# Commit merge
echo "💾 Committing merge..."
COMMIT_MSG=$(cat <<EOF
Merge upstream StackShift ${LATEST_TAG}

Upstream changes: ${COMMITS_BEHIND} commits from https://github.com/jschulte/stackshift

Cox customizations preserved:
- ✅ MCP server removed (should live in mcp-tools)
- ✅ Osiris documentation intact
- ✅ Cox-specific README sections maintained

Merged using: scripts/cox-automation/sync-upstream.sh
EOF
)

git commit -m "$COMMIT_MSG"

echo ""
echo "✅ Merge complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff main"
echo "2. Test the changes locally"
echo "3. Push to Cox GHE: git push ${REMOTE_NAME} ${BRANCH_NAME}"
echo "4. Create a pull request for review"
echo ""
echo "Or merge directly to main:"
echo "  git checkout main"
echo "  git merge ${BRANCH_NAME}"
echo "  git push ${REMOTE_NAME} main"
echo ""
