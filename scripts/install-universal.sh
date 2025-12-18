#!/bin/bash

# StackShift Universal Installer
# Detects and installs to Claude Code, OpenCode, Cursor, Windsurf, Codex, etc.

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMMANDS_SOURCE="$PROJECT_ROOT/.claude/commands"

echo "🚀 StackShift Universal Installer"
echo "=================================="
echo ""

# Detect available LLM tools
declare -a DETECTED_TOOLS=()
declare -A TOOL_PATHS=()

echo "🔍 Detecting installed LLM tools..."
echo ""

# Claude Code
if [ -d "$HOME/.claude" ] || command -v claude &> /dev/null; then
  DETECTED_TOOLS+=("claude-code")
  TOOL_PATHS["claude-code"]="$HOME/.claude/commands"
  echo "  ✅ Claude Code detected → $HOME/.claude/commands"
fi

# OpenCode
if command -v opencode &> /dev/null || [ -d "$HOME/.config/opencode" ]; then
  DETECTED_TOOLS+=("opencode")
  TOOL_PATHS["opencode"]="$HOME/.config/opencode/commands"
  echo "  ✅ OpenCode detected → $HOME/.config/opencode/commands"
fi

# Cursor
if [ -d "$HOME/.cursor" ] || command -v cursor &> /dev/null; then
  DETECTED_TOOLS+=("cursor")
  TOOL_PATHS["cursor"]="$HOME/.cursor/prompts"
  echo "  ✅ Cursor detected → $HOME/.cursor/prompts"
fi

# Windsurf
if [ -d "$HOME/.windsurf" ] || command -v windsurf &> /dev/null; then
  DETECTED_TOOLS+=("windsurf")
  TOOL_PATHS["windsurf"]="$HOME/.windsurf/commands"
  echo "  ✅ Windsurf detected → $HOME/.windsurf/commands"
fi

# Codex (OpenAI)
if command -v codex &> /dev/null || [ -d "$HOME/.codex" ]; then
  DETECTED_TOOLS+=("codex")
  TOOL_PATHS["codex"]="$HOME/.codex/commands"
  echo "  ✅ Codex detected → $HOME/.codex/commands"
fi

# VSCode with Continue extension
if [ -d "$HOME/.continue" ]; then
  DETECTED_TOOLS+=("continue")
  TOOL_PATHS["continue"]="$HOME/.continue/prompts"
  echo "  ✅ Continue (VSCode) detected → $HOME/.continue/prompts"
fi

echo ""
echo "Detected ${#DETECTED_TOOLS[@]} LLM tool(s)"
echo ""

# Handle no tools detected
if [ ${#DETECTED_TOOLS[@]} -eq 0 ]; then
  echo "❌ No LLM tools detected!"
  echo ""
  echo "Supported tools:"
  echo "  • Claude Code (claude)"
  echo "  • OpenCode (opencode)"
  echo "  • Cursor (cursor)"
  echo "  • Windsurf (windsurf)"
  echo "  • Codex (codex)"
  echo "  • Continue VSCode extension"
  echo ""
  echo "Please install one of these tools and try again."
  echo "Or specify a custom path:"
  echo ""
  read -p "Custom installation path (or press Enter to exit): " custom_path

  if [ -z "$custom_path" ]; then
    echo "Installation cancelled."
    exit 0
  fi

  DETECTED_TOOLS+=("custom")
  TOOL_PATHS["custom"]="$custom_path"
fi

# Show detected tools and get selection
echo "Where would you like to install StackShift commands?"
echo ""
for i in "${!DETECTED_TOOLS[@]}"; do
  tool="${DETECTED_TOOLS[$i]}"
  path="${TOOL_PATHS[$tool]}"
  echo "  $((i+1)). $tool → $path"
done
echo "  A. Install to ALL detected tools"
echo "  Q. Quit"
echo ""
read -p "Select tools (1-${#DETECTED_TOOLS[@]}, A, or Q): " selection

# Parse selection
declare -a INSTALL_TOOLS=()

case "${selection^^}" in
  Q)
    echo "Installation cancelled."
    exit 0
    ;;
  A)
    INSTALL_TOOLS=("${DETECTED_TOOLS[@]}")
    ;;
  *)
    # Parse comma/space-separated list
    IFS=', ' read -r -a INDICES <<< "$selection"
    for idx in "${INDICES[@]}"; do
      if [ "$idx" -ge 1 ] 2>/dev/null && [ "$idx" -le "${#DETECTED_TOOLS[@]}" ] 2>/dev/null; then
        INSTALL_TOOLS+=("${DETECTED_TOOLS[$((idx-1))]}")
      fi
    done
    ;;
esac

if [ ${#INSTALL_TOOLS[@]} -eq 0 ]; then
  echo "No valid tools selected. Installation cancelled."
  exit 1
fi

echo ""
echo "📦 Installing to: ${INSTALL_TOOLS[*]}"
echo ""

# Installation function
install_to_tool() {
  local tool="$1"
  local target_dir="$2"

  echo "Installing to $tool..."

  # Create target directory
  mkdir -p "$target_dir"

  # Copy commands
  local count=0
  for cmd in "$COMMANDS_SOURCE"/*.md; do
    if [ -f "$cmd" ]; then
      cmd_name=$(basename "$cmd")
      cp "$cmd" "$target_dir/$cmd_name"
      count=$((count + 1))
    fi
  done

  echo "  ✓ Installed $count commands to $target_dir"
}

# Install to each selected tool
for tool in "${INSTALL_TOOLS[@]}"; do
  target="${TOOL_PATHS[$tool]}"
  install_to_tool "$tool" "$target"
done

echo ""
echo "✅ Installation complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Usage varies by tool:"
echo ""
echo "Claude Code:"
echo "  /stackshift.analyze"
echo "  /stackshift.reverse-engineer"
echo "  /stackshift.create-specs"
echo "  /stackshift.implement"
echo ""
echo "OpenCode:"
echo "  /stackshift.analyze"
echo "  @stackshift analyze this codebase"
echo ""
echo "Cursor/Windsurf/Codex:"
echo '  Use natural language: "Run StackShift analysis on this project"'
echo "  Or run bash commands from the command files directly"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚗 Happy Shifting!"
