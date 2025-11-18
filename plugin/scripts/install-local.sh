#!/bin/bash

# Install StackShift plugin locally for development
# Run this after making changes to test them in Claude Code

set -e

PLUGIN_SRC="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_DEST="$HOME/.claude/plugins/cache/stackshift"

echo "Installing StackShift plugin locally..."
echo "Source: $PLUGIN_SRC"
echo "Destination: $PLUGIN_DEST"
echo ""

# Check if Claude Code is running
if pgrep -f "Claude Code" > /dev/null; then
    echo "⚠️  WARNING: Claude Code is currently running!"
    echo "   For best results, quit Claude Code before installing."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 1
    fi
fi

# Remove old installation
rm -rf "$PLUGIN_DEST"

# Copy plugin
cp -r "$PLUGIN_SRC" "$PLUGIN_DEST"

# Update installed_plugins.json
INSTALLED_PLUGINS="$HOME/.claude/plugins/installed_plugins.json"

# Backup first
cp "$INSTALLED_PLUGINS" "$INSTALLED_PLUGINS.backup"

python3 << 'PYTHON_EOF'
import json
import datetime
import os

plugins_file = os.path.expanduser('~/.claude/plugins/installed_plugins.json')
dest_path = os.path.expanduser('~/.claude/plugins/cache/stackshift')

try:
    with open(plugins_file, 'r') as f:
        data = json.load(f)
except:
    data = {"version": 1, "plugins": {}}

data['plugins']['stackshift'] = {
    "version": "1.2.0-dev",
    "installedAt": datetime.datetime.now(datetime.UTC).isoformat(),
    "lastUpdated": datetime.datetime.now(datetime.UTC).isoformat(),
    "installPath": dest_path,
    "isLocal": True
}

with open(plugins_file, 'w') as f:
    json.dump(data, f, indent=2)

print("✅ Registered in installed_plugins.json")
print(f"Plugin count: {len(data['plugins'])}")
PYTHON_EOF

echo ""
echo "✅ StackShift installed locally"
echo ""

# Verify installation
COMMANDS=$(find "$PLUGIN_DEST/commands" -name "*.md" 2>/dev/null | wc -l)
SKILLS=$(find "$PLUGIN_DEST/skills" -type d -mindepth 1 -maxdepth 1 2>/dev/null | wc -l)
AGENTS=$(find "$PLUGIN_DEST/agents" -type d -mindepth 1 -maxdepth 1 2>/dev/null | wc -l)

echo "📋 Installed:"
echo "   - $SKILLS skills (analyze, reverse-engineer, create-specs, gap-analysis, complete-spec, implement, modernize, cruise-control)"
echo "   - $AGENTS agents (feature-brainstorm, cms-web-widget-analyzer, stackshift-code-analyzer)"
echo "   - $COMMANDS slash commands (/stackshift.*, /speckit.*)"
echo ""

# Verify registration
if grep -q "stackshift" "$HOME/.claude/plugins/installed_plugins.json"; then
    echo "✅ Registered in installed_plugins.json"
else
    echo "❌ WARNING: Not registered in installed_plugins.json"
    echo "   This may cause issues - Claude Code might not load the plugin"
fi

echo ""
echo "🔄 RESTART CLAUDE CODE to load the plugin"
echo ""
echo "⚠️  IMPORTANT: Fully quit and relaunch Claude Code"
echo "   (Cmd+Q on Mac, not just close window)"
echo ""
echo "After restart, in ANY repo try:"
echo "   /stackshift.start"
echo "   /speckit.specify"
echo "   /stackshift.batch"
echo ""
