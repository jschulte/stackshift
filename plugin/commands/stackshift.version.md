---
name: stackshift.version
description: Show installed StackShift version and check for updates
---

# StackShift Version Check

**Current Installation:**

```bash
# Show installed version
cat ~/.claude/plugins/cache/stackshift/.claude-plugin/plugin.json | jq -r '.version' || echo "StackShift not installed"
```

**Latest Release:**

Check latest version at: https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/releases/latest

---

## Installation Info

**Repository:** ghe.coxautoinc.com/DDC-WebPlatform/stackshift

**Installed From:**
```bash
# Check installation directory
ls -la ~/.claude/plugins/cache/stackshift
```

---

## Update Instructions

### If Installed from Git URL

```bash
/plugin update stackshift
```

### If Installed Locally

```bash
cd ~/git/stackshift
git pull origin main
./install-local.sh
```

### Force Reinstall

```bash
rm -rf ~/.claude/plugins/cache/stackshift
/plugin install stackshift --source https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift.git
```

---

## Version History

- **v1.3.0** (2025-11-18) - Batch session persistence, directory-scoped sessions
- **v1.2.0** (2025-11-17) - Brownfield upgrade mode, CMS widget support
- **v1.1.1** (2025-11-16) - Osiris module detection improvements
- **v1.1.0** (2025-11-15) - Added Osiris route for widget analysis
- **v1.0.0** (2025-11-14) - Initial release

---

## What's New in Latest Version

### v1.3.0 Features

🎯 **Cross-batch answer persistence** - Answer configuration questions once, automatically apply to all repos across all batches

📁 **Directory-scoped sessions** - Multiple simultaneous batch runs in different directories without conflicts

🔍 **Auto-discovery** - Agents automatically find parent batch configuration

⚡ **Time savings** - Save 58 minutes on 90-repo batches!

**Full changelog:** https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/releases/tag/v1.3.0
