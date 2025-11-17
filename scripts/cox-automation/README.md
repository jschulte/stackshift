# Cox Automotive Automation Scripts

This directory contains automation scripts specific to the Cox Automotive version of StackShift.

## Upstream Sync Automation

### GitHub Action (Automatic)

The repository includes a GitHub Action (`.github/workflows/sync-upstream.yml`) that automatically syncs upstream changes:

**Schedule:** Weekly on Mondays at 9 AM UTC (4 AM EST)

**What it does:**
1. Fetches latest changes from https://github.com/jschulte/stackshift
2. Attempts to merge changes automatically
3. Handles Cox-specific patterns (removes mcp-server)
4. Creates a Pull Request for review if successful
5. Notifies if manual conflict resolution needed

**Manual Trigger:**
```bash
# Via GitHub UI: Actions tab → "Sync Upstream StackShift" → Run workflow

# Or via gh CLI:
gh workflow run sync-upstream.yml
```

**Custom upstream ref:**
```bash
# Sync a specific version
gh workflow run sync-upstream.yml -f upstream_ref=v1.2.0
```

### Manual Script (Interactive)

For manual syncing or testing, use the interactive script:

```bash
./scripts/cox-automation/sync-upstream.sh [upstream-ref]
```

**Examples:**
```bash
# Sync from upstream main
./scripts/cox-automation/sync-upstream.sh

# Sync from a specific tag
./scripts/cox-automation/sync-upstream.sh v1.2.0

# Sync from a specific branch
./scripts/cox-automation/sync-upstream.sh feature-branch
```

**The script will:**
1. Check you're in the right directory
2. Fetch from upstream
3. Show what changed (commit log)
4. Ask for confirmation
5. Create a sync branch
6. Merge changes (with auto-resolution of Cox patterns)
7. Guide you through next steps

## Cox-Specific Patterns

Both the GitHub Action and manual script handle these patterns automatically:

### Always Removed
- `mcp-server/` - Should live in `~/git/mcp-tools` instead

### Always Preserved
- `docs/osiris/` - Cox-specific Osiris documentation
- Cox README sections:
  - "Why This Matters at Cox Automotive"
  - Cox-specific Contributing section
  - Cox-specific License text
- `KNOWN_ISSUES.md` - Cox version status
- `production-readiness-specs/README.md` - Cox version notes

## Conflict Resolution

If the automation encounters conflicts it can't auto-resolve:

### GitHub Action
1. Check the failed workflow run for details
2. Manually create a sync branch:
   ```bash
   git fetch upstream
   git checkout -b upstream-sync-manual
   git merge upstream/main
   ```
3. Resolve conflicts
4. Push and create PR manually

### Manual Script
1. The script will stop and show conflicted files
2. Edit the files to resolve conflicts
3. `git add <resolved-files>`
4. `git commit`
5. Follow the script's next steps guidance

## Testing the Automation

To test the automation without merging:

```bash
# Dry run
git fetch upstream
git merge --no-commit --no-ff upstream/main

# If looks good:
git merge --abort

# If ready to proceed:
./scripts/cox-automation/sync-upstream.sh
```

## Customizing the Schedule

To change when the GitHub Action runs, edit `.github/workflows/sync-upstream.yml`:

```yaml
on:
  schedule:
    # Run daily at midnight: '0 0 * * *'
    # Run weekly on Monday: '0 9 * * 1'
    # Run monthly on 1st: '0 9 1 * *'
    - cron: '0 9 * * 1'  # ← Change this
```

## Troubleshooting

### GitHub Action not running

**Check:**
1. Workflow is enabled: Settings → Actions → Enable workflows
2. Permissions are correct: Settings → Actions → General → Workflow permissions
3. No errors in recent runs: Actions tab

### Conflicts in README

**Common cause:** Upstream added sponsorship badges we removed for Cox

**Fix:** Keep Cox version, remove sponsor badges:
```bash
git checkout --ours README.md
git add README.md
```

### MCP server conflicts

**Fix:** Already handled automatically, but if issues:
```bash
git rm -rf mcp-server/
```

## Future Enhancements

Potential improvements to the automation:

1. **Slack notifications** - Alert team when PRs are created
2. **Auto-merge** - If tests pass, merge automatically (requires review)
3. **Smart conflict detection** - Predict conflicts before merging
4. **Change summaries** - Generate readable summaries of upstream changes
5. **Rollback mechanism** - Easy way to revert if issues found

## Questions?

For issues with the automation:
- **GitHub Action issues:** Check workflow runs in Actions tab
- **Script issues:** Run with `bash -x` for debugging
- **Integration questions:** Reach out to engineering leadership

---

**Maintained by:** Cox Automotive Platform Team
**Last Updated:** 2025-11-17
