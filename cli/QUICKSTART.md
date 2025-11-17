# 🏃 STACKSHIFT CLI - QUICKSTART

**From zero to migration in 5 minutes**

## 1. Build (30 seconds)

```bash
cd /Users/jonahschulte/git/stackshift/cli/stackshift-cli
go build -o stackshift
```

## 2. Run (5 seconds)

```bash
./stackshift
```

You'll see:
```
╔═══════════════════════════════════════════════╗
║   🚗 STACKSHIFT                                ║
║   Discovered 134 repositories                 ║
╚═══════════════════════════════════════════════╝
```

## 3. Select Repos (1 minute)

- `↑/↓` - Navigate through your repos
- `Space` - Toggle selection
- `a` - Select all (or just pick a few to start!)

## 4. Configure (30 seconds)

Press `s` for settings:

```
⚙️  SETTINGS

→ Route: brownfield                (greenfield | brownfield)
  Transmission: cruise-control     (manual | cruise-control)
  Clarification: defer             (prompt | defer | skip)
  Implementation: p0               (none | p0 | p0_p1 | all)
  AI Backend: Claude Code
  Parallel Limit: 3 repos
```

**Recommended for first run:**
- Route: `brownfield` (document existing code)
- Transmission: `manual` (step-by-step, safer)
- AI Backend: `Claude Code` (better quality)
- Parallel: `1` (watch it work first)

Press `Esc` to go back.

## 5. Start! (Enter)

Press `Enter` to confirm and start.

You'll see:
```
🚗 SHIFTING GEARS...

Gear 1: my-first-repo - Analyzing... (34%)
Gear 1: another-repo - Analyzing... (12%)
```

## 6. Check Results

When complete:
```
✅ RESULTS

Completed: 2/2

✅ Gear 1: my-first-repo
✅ Gear 1: another-repo

Logs saved to: ~/.stackshift-results/2024-11-17_14-30-00/
```

## 7. Review Output

Each repo now has:
```
my-first-repo/
├── .stackshift-state.json    # Progress tracker
└── analysis-report.md         # Tech stack analysis
```

## 8. Next Gear

Run again, select same repos, and StackShift will:
- Detect they completed Gear 1 ✅
- Automatically run Gear 2 (Reverse Engineer)

OR switch to `cruise-control` mode to run all 6 gears automatically!

## Tips

### Start Small
- Select 1-3 repos for first run
- Use `manual` mode to see each gear
- Watch the logs to understand the process

### Scale Up
- Once confident, select 10-20 repos
- Switch to `cruise-control` mode
- Increase parallel limit to 3-5

### Enterprise Scale
- Select all 100+ repos
- `cruise-control` mode
- Parallel limit: 5-10
- Let it run overnight
- Check results in the morning! ☕

## Troubleshooting

**"No repos found"**
```bash
# Specify custom directory
./stackshift ~/git/my-company
```

**"Command not found: claude/opencode"**
- Install Claude Code: https://claude.ai/download
- Or install OpenCode: `npm install -g opencode`

**"Gear failed"**
- Check logs: `~/.stackshift-results/latest/repo-name_gear1.log`
- Re-run with same selection (will retry failed gears)

## What's Next?

After Gear 1 completes on all repos:
1. Review `analysis-report.md` in each repo
2. Run StackShift again to execute Gear 2
3. Continue through all 6 gears
4. Ship modern, spec-driven applications! 🚀

---

**That's it! Now go shift some gears. 🚗💨**
