#!/bin/bash
# Quick install script for local testing

echo "Installing Reverse Engineering Toolkit locally..."

# Create local plugin directory if it doesn't exist
mkdir -p ~/.claude/plugins/local

# Create symlink to current directory
ln -sf "$(pwd)" ~/.claude/plugins/local/reverse-engineering-toolkit

echo "✅ Plugin linked to ~/.claude/plugins/local/reverse-engineering-toolkit"
echo ""
echo "Next steps:"
echo "1. Restart Claude Code"
echo "2. Try: 'Analyze this codebase'"
echo "3. The analyze skill should auto-activate!"
