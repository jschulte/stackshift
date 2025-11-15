# StackShift Installation Guide

## 🧪 Option 1: Install Locally for Testing (Fastest)

### Quick Install

From the StackShift repository directory:

```bash
./install-local.sh
```

Or manually:

```bash
# Create local plugins directory
mkdir -p ~/.claude/plugins/local

# Symlink this directory
ln -s $(pwd) ~/.claude/plugins/local/stackshift

# Restart Claude Code
```

### Verify Installation

1. **Restart Claude Code** completely
2. Navigate to a project you want to analyze
3. Start a new conversation
4. Say: `"Analyze this codebase"`
5. The `analyze` skill should auto-activate!

### Testing the Skills

Try these trigger phrases:

```
# Step 1
"Analyze this codebase"
"Run initial analysis"

# Step 2
"Reverse engineer the codebase"
"Extract business logic"

# Step 3
"Create specifications"
"Set up GitHub Spec Kit"

# Step 4
"Analyze gaps"
"Run speckit analyze"

# Step 5
"Complete the specification"
"Resolve clarifications"

# Step 6
"Implement missing features"
"Use speckit to implement"
```

### Check State

```bash
# See current progress (which gear you're in)
node ~/.claude/plugins/local/stackshift/plugin/scripts/state-manager.js status

# See detailed progress
node ~/.claude/plugins/local/stackshift/plugin/scripts/state-manager.js progress

# Check which route you chose
node ~/.claude/plugins/local/stackshift/plugin/scripts/state-manager.js get-path
```

---

## 📦 Option 2: Install from GitHub (Public)

Once the repository is public and configured:

### In Claude Code

```bash
# Add the marketplace
> /plugin marketplace add jschulte

# Install StackShift
> /plugin install stackshift

# Restart Claude Code
```

### Verify

```bash
> /plugin list
# Should show: stackshift (installed)
```

---

## 🌐 Option 3: Publish to Official Claude Code Marketplace

To make your plugin available to all Claude Code users:

### Prerequisites

1. **GitHub repository must be public**
2. **Repository must have proper structure** ✅ (already done)
3. **README with clear documentation** ✅ (already done)
4. **License file** (need to add)
5. **Working plugin** ✅ (already done)

### Step 1: Add a License

```bash
# Choose a license (MIT is common for open source)
cat > LICENSE <<'EOF'
MIT License

Copyright (c) 2024 Jonah Schulte

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

git add LICENSE
git commit -m "docs: add MIT license"
git push origin main
```

### Step 2: Make Repository Public (if private)

On GitHub:
1. Go to repository Settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Make public"
4. Confirm

### Step 3: Create a Release

```bash
# Tag the current version
git tag -a v1.0.0 -m "Release v1.0.0: Reverse Engineering Toolkit Claude Code Plugin

Features:
- 6 interactive skills for reverse engineering
- Dual workflow (greenfield/brownfield)
- GitHub Spec Kit integration
- State management and progress tracking
- Auto-activation based on natural language"

# Push the tag
git push origin v1.0.0
```

On GitHub:
1. Go to "Releases" → "Create a new release"
2. Choose tag: `v1.0.0`
3. Title: `v1.0.0 - Initial Release`
4. Description:
   ```markdown
   ## Reverse Engineering Toolkit v1.0.0

   Transform any partially-complete application into a fully-specified,
   enterprise-grade, spec-driven codebase using GitHub Spec Kit.

   ### Features
   - 🎯 Two paths: Greenfield (tech-agnostic) or Brownfield (tech-prescriptive)
   - 🤖 6 interactive skills with auto-activation
   - 📊 Progress tracking and state management
   - 🔗 Full GitHub Spec Kit integration
   - 📝 3,400+ lines of comprehensive documentation

   ### Installation
   ```
   /plugin marketplace add jschulte
   /plugin install reverse-engineering-toolkit
   ```

   See README for detailed usage instructions.
   ```
5. Publish release

### Step 4: Submit to Marketplace

The official submission process typically involves:

1. **Fork the Claude Code marketplace repository** (if there is one)
   - Check: https://github.com/anthropics/claude-code-marketplace (or similar)

2. **Add your plugin to the registry**
   - Add entry pointing to your repository
   - Include marketplace.json metadata

3. **Submit Pull Request**
   - PR to marketplace repository
   - Wait for review and approval

**Alternative:** Check Claude Code documentation for official marketplace submission:
```bash
# In Claude Code
> /help plugins
```

Or visit: https://code.claude.com/docs (check for marketplace submission process)

---

## 🔧 Troubleshooting

### Plugin Not Showing Up

```bash
# Check if symlink exists
ls -la ~/.claude/plugins/local/

# Should show: stackshift -> /path/to/your/repo

# If not there, re-run install
./install-local.sh
```

### Skills Not Activating

1. **Restart Claude Code completely** (not just new conversation)
2. **Check plugin loaded:**
   ```bash
   > /plugin list
   ```
3. **Try explicit phrases:**
   ```
   "Run the analyze skill"
   "Use the reverse-engineer skill"
   ```

### State Manager Not Working

```bash
# Make sure it's executable
chmod +x plugin/scripts/state-manager.js

# Test it
node plugin/scripts/state-manager.js init
```

### Manual Fallback

If skills don't auto-activate, use the prompts manually:

```bash
# After choosing path
cat prompts/greenfield/02-reverse-engineer-business-logic.md
# or
cat prompts/brownfield/02-reverse-engineer-full-stack.md
```

---

## 📝 Next Steps After Installation

Once installed:

1. **Navigate to a project:**
   ```bash
   cd /path/to/your/project
   ```

2. **Start Claude Code**

3. **Begin the process:**
   ```
   "I want to reverse engineer this application"
   ```

4. **Choose your route:**
   - Greenfield: Shift to new tech stack
   - Brownfield: Take the wheel on existing code

5. **Shift through the gears!**

StackShift will guide you through all 6 gears automatically.

---

## 🚀 Publishing Checklist

Before publishing to marketplace:

- [x] Plugin structure complete
- [x] Skills documented
- [x] README comprehensive
- [ ] LICENSE file added
- [ ] v1.0.0 release created
- [ ] Repository is public
- [ ] Tested locally
- [ ] Submitted to marketplace

---

## 📚 Resources

- **Repository:** https://github.com/jschulte/reverse-engineering-toolkit
- **Issues:** https://github.com/jschulte/reverse-engineering-toolkit/issues
- **Claude Code Docs:** https://code.claude.com/docs
- **GitHub Spec Kit:** https://github.com/github/spec-kit

---

Want me to help you:
1. Add the LICENSE file?
2. Create the v1.0.0 release?
3. Make the repository public?
4. Test the plugin locally first?
