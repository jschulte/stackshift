# StackShift Installation Guide

Complete guide to installing, updating, and verifying StackShift for Cox Automotive.

---

## Quick Install

### Option 1: From DDC-WebPlatform Repository (Recommended)

```bash
# In any directory
/plugin install stackshift --source https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift.git
```

### Option 2: Local Development Install

```bash
# Clone the repo
cd ~/git
git clone ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git
cd stackshift

# Run installer
./install-local.sh
```

---

## Verify Installation

### Check Version

```bash
# View installed plugin version
cat ~/.claude/plugins/cache/stackshift/.claude-plugin/plugin.json | grep version

# Expected output:
# "version": "1.3.0",
```

### List Available Commands

In any directory, type `/` and you should see:
- `/stackshift.start` - Start StackShift analysis
- `/stackshift.batch` - Batch process multiple repos
- `/stackshift.modernize` - Upgrade dependencies (Brownfield)
- `/speckit.*` - GitHub Spec Kit commands

### Test Installation

```bash
# Quick test - should show batch processing guide
/stackshift.batch
```

---

## Update to Latest Version

### If Installed from Git URL

```bash
# Update plugin
/plugin update stackshift

# Restart Claude Code (if prompted)
```

### If Installed Locally

```bash
# Navigate to repo
cd ~/git/stackshift

# Pull latest
git pull origin main

# Reinstall
./install-local.sh
```

### Force Clean Reinstall

```bash
# Remove cached version
rm -rf ~/.claude/plugins/cache/stackshift

# Reinstall
/plugin install stackshift --source https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift.git
```

---

## Current Version: 1.3.0

### What's New in 1.3.0

- **Cross-batch answer persistence** - Answer questions once, apply to all batches
- **Directory-scoped batch sessions** - Multiple simultaneous batch runs
- **Automatic parent directory discovery** - Agents find parent batch configuration
- **Batch session management** - View/clear sessions per directory

### Release Notes

Full changelog: https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/releases/tag/v1.3.0

---

## Troubleshooting

### Version Not Updating

If you run `/plugin update stackshift` but still see old version:

```bash
# 1. Check what version is installed
cat ~/.claude/plugins/cache/stackshift/.claude-plugin/plugin.json | grep version

# 2. If still showing old version, force reinstall
rm -rf ~/.claude/plugins/cache/stackshift
/plugin install stackshift --source https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift.git

# 3. Verify new version
cat ~/.claude/plugins/cache/stackshift/.claude-plugin/plugin.json | grep version
```

### Commands Not Showing Up

If slash commands don't appear:

```bash
# 1. Check if plugin is installed
ls ~/.claude/plugins/cache/stackshift

# 2. Check if commands directory exists
ls ~/.claude/plugins/cache/stackshift/commands

# 3. Restart Claude Code completely
```

### Local Development Setup

If you're developing StackShift:

```bash
# Your local changes should be immediately available since
# the installer creates a symlink to ~/git/ai/stackshift/plugin

# Verify symlink
ls -la ~/.claude/plugins/stackshift
# Should show: stackshift -> /Users/you/git/ai/stackshift/plugin

# Make changes, they're live immediately
# No reinstall needed for .md file changes
```

---

## Team Installation

### For Team Members

Share these instructions with team members:

```bash
# Everyone should run this
/plugin install stackshift --source https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift.git
```

### For Project Repos

After installing, in each project that uses StackShift:

```bash
# StackShift will auto-install slash commands to .claude/commands/
# Commit these so team has them:
git add .claude/commands/
git commit -m "Add StackShift slash commands"
git push
```

---

## Marketplace Installation (Future)

Once the marketplace PR is merged:

```bash
# Update marketplace
/plugin marketplace update cox-innovation-lab

# Install from marketplace
/plugin install stackshift@cox-innovation-lab

# Update from marketplace
/plugin update stackshift
```

---

## Support

- **Issues**: https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/issues
- **Releases**: https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/releases
- **Team**: DDC Web Platform (@jonah.schulte)

---

## Version History

- **v1.3.0** (2025-11-18) - Batch session persistence, directory-scoped sessions
- **v1.2.0** (2025-11-17) - Brownfield upgrade mode, CMS widget support
- **v1.1.1** (2025-11-16) - Osiris module detection improvements
- **v1.1.0** (2025-11-15) - Added Osiris route for widget analysis
- **v1.0.0** (2025-11-14) - Initial release with Greenfield/Brownfield routes
