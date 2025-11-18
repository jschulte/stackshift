#!/bin/bash

# Install StackShift plugin locally for development
# Run this after making changes to test them in Claude Code

set -e

PLUGIN_SRC="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_DEST="$HOME/.claude/plugins/cache/stackshift"

echo "Installing StackShift plugin locally..."
echo "Source: $PLUGIN_SRC"
echo "Destination: $PLUGIN_DEST"

# Remove old installation
rm -rf "$PLUGIN_DEST"

# Copy plugin
cp -r "$PLUGIN_SRC" "$PLUGIN_DEST"

# Update installed_plugins.json
INSTALLED_PLUGINS="$HOME/.claude/plugins/installed_plugins.json"

python3 << EOF
import json
import datetime

with open('$INSTALLED_PLUGINS', 'r') as f:
    data = json.load(f)

data['plugins']['stackshift'] = {
    "version": "1.2.0-dev",
    "installedAt": datetime.datetime.now(datetime.UTC).isoformat(),
    "lastUpdated": datetime.datetime.now(datetime.UTC).isoformat(),
    "installPath": "$PLUGIN_DEST",
    "isLocal": True
}

with open('$INSTALLED_PLUGINS', 'w') as f:
    json.dump(data, f, indent=2)

print("✅ Registered in installed_plugins.json")
EOF

echo ""
echo "✅ StackShift installed locally"
echo ""
echo "📋 Installed:"
echo "   - 8 skills (analyze, reverse-engineer, create-specs, gap-analysis, complete-spec, implement, modernize, cruise-control)"
echo "   - 3 agents (feature-brainstorm, cms-web-widget-analyzer, stackshift-code-analyzer)"
echo "   - 10 slash commands (/stackshift.*, /speckit.*)"
echo ""
echo "🔄 RESTART CLAUDE CODE to load the plugin"
echo ""
echo "After restart, try:"
echo "   /stackshift.start"
echo "   /speckit.specify"
echo ""
