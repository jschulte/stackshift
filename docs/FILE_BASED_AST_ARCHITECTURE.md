# File-Based AST Architecture

## Overview

**Problem Solved**: Run AST analysis once, cache results to files, all gears read from cache.

**Benefits**:
- ✅ Deterministic (files exist or don't)
- ✅ Efficient (parse once, not 6 times)
- ✅ Fast (reading files vs. running AST)
- ✅ Debuggable (inspect analysis files)
- ✅ Reliable (no shell-out issues per gear)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Gear 1: Analysis (RUNS ONCE)                              │
│                                                              │
│  $ ~/stackshift/scripts/run-ast-analysis.mjs analyze .     │
│                                                              │
│  1. Parse entire codebase with Babel AST                   │
│  2. Extract: APIs, functions, stubs, business logic        │
│  3. Save to .stackshift-analysis/ directory:               │
│     ├── roadmap.md         (human-readable)                │
│     ├── raw-analysis.json  (full AST data)                 │
│     └── summary.json       (metadata, timestamps)          │
│                                                              │
│  Cache duration: 1 hour                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  All Other Gears (READ FROM FILES)                          │
│                                                              │
│  Gear 3: Create Specs                                       │
│    → Read .stackshift-analysis/raw-analysis.json            │
│    → Extract implementation status (✅/⚠️/❌)                  │
│    → Auto-populate spec status fields                       │
│                                                              │
│  Gear 4: Gap Analysis                                       │
│    → Read .stackshift-analysis/roadmap.md                   │
│    → Display gap analysis (uses cache)                      │
│    → No re-parsing needed                                   │
│                                                              │
│  Gear 6: Implementation Verification                        │
│    → Read .stackshift-analysis/raw-analysis.json            │
│    → Verify implementation matches specs                    │
│    → Check for stubs, missing tests                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Commands

### Run Full Analysis (Gear 1)

```bash
~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

**Output**:
```
🔬 Running comprehensive AST analysis...

✅ Saved raw analysis: .stackshift-analysis/raw-analysis.json
✅ Saved roadmap: .stackshift-analysis/roadmap.md
✅ Saved summary: .stackshift-analysis/summary.json

🎯 Analysis complete! Files saved to .stackshift-analysis/
   Other gears can now read these files instead of re-running AST.
```

### Check Analysis Status

```bash
~/stackshift/scripts/run-ast-analysis.mjs check .
```

**Output** (if exists):
```json
{
  "exists": true,
  "path": ".stackshift-analysis",
  "age_minutes": 15.3,
  "is_fresh": true,
  "summary": {
    "analyzed_at": "2025-12-01T18:30:00.000Z",
    "directory": "/path/to/project"
  }
}
```

### Read Cached Roadmap (Gear 4)

```bash
~/stackshift/scripts/run-ast-analysis.mjs roadmap .
```

**Output** (if cache fresh):
```
📖 Using cached AST analysis from .stackshift-analysis/

# 🗺️ StackShift Roadmap Generation

## Gaps Found: 23

[... full roadmap from cache ...]
```

**Output** (if cache stale):
```
⚠️  Cached analysis is 75 minutes old (stale)
   Re-running analysis...

[... runs fresh analysis ...]
```

### Read Implementation Status (Gear 3)

```bash
~/stackshift/scripts/run-ast-analysis.mjs status .
```

**Output**:
```json
{
  "features": [
    {
      "name": "user-authentication",
      "status": "partial",
      "confidence": 75,
      "functions_found": ["login", "logout"],
      "functions_missing": ["register", "resetPassword"],
      "stubs_detected": ["resetPassword"]
    }
  ]
}
```

---

## File Structure

### .stackshift-analysis/ Directory

```
.stackshift-analysis/
├── roadmap.md           # Human-readable gap analysis
├── raw-analysis.json    # Full AST extraction data
└── summary.json         # Metadata and timestamps
```

### roadmap.md (Human-Readable)

```markdown
# 🗺️ StackShift Roadmap Generation

## Step 1: Analyzing Specification Gaps

Gaps Found: 23
- 12 high priority
- 8 medium priority
- 3 low priority

## Phase 1: Critical Features (P0)

### 001-user-authentication
**Status**: ⚠️ PARTIAL
**Confidence**: 75%
**Evidence**:
- ✅ login function found
- ❌ register function missing
- ⚠️  resetPassword is stub

[... detailed gap analysis ...]
```

### raw-analysis.json (Machine-Readable)

```json
{
  "content": [
    {
      "type": "text",
      "text": "..."
    }
  ],
  "gaps": [
    {
      "feature": "user-authentication",
      "status": "partial",
      "confidence": 75,
      "functions": {
        "found": ["login", "logout"],
        "missing": ["register", "resetPassword"],
        "stubs": ["resetPassword"]
      }
    }
  ]
}
```

### summary.json (Metadata)

```json
{
  "analyzed_at": "2025-12-01T18:30:00.000Z",
  "directory": "/path/to/project",
  "analysis_files": {
    "raw": "raw-analysis.json",
    "roadmap": "roadmap.md"
  },
  "next_steps": [
    "Gear 3: Use analysis to detect implementation status",
    "Gear 4: Read roadmap.md for gap analysis",
    "Gear 6: Use analysis to verify implementations"
  ]
}
```

---

## Caching Strategy

### Cache Validity

- **Fresh**: < 1 hour old
- **Stale**: > 1 hour old (but still usable)
- **Missing**: Doesn't exist

### Behavior

| Cache State | Action |
|-------------|--------|
| Fresh (< 1h) | Use cached files immediately |
| Stale (> 1h) | Warn, then re-run analysis |
| Missing | Run fresh analysis |

### Why 1 Hour?

- Long enough: Doesn't re-run on every gear
- Short enough: Stays relatively fresh
- Adjustable: Can change threshold if needed

---

## Updated Slash Commands

### Gear 1: stackshift.analyze

```markdown
## Step 1: Run Full AST Analysis (Deterministic)

```bash
~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

## Step 2: Detect Tech Stack
Use the Skill tool with skill="analyze".
```

**Result**: AST runs first, tech detection second

### Gear 4: stackshift.gap-analysis

```markdown
## Step 1: Read Cached AST Analysis

```bash
~/stackshift/scripts/run-ast-analysis.mjs check .
~/stackshift/scripts/run-ast-analysis.mjs roadmap .
```

## Step 2: Review Gap Analysis
[Uses cached data]
```

**Result**: Reads files, doesn't re-run AST

### Other Gears (Future)

Similar pattern:
1. Check if `.stackshift-analysis/` exists
2. Read appropriate file (roadmap.md or raw-analysis.json)
3. Use cached data
4. Fall back to skill if missing

---

## Advantages Over Previous Approach

### Before (Shell-Out Every Gear)

```
Gear 1: No AST
Gear 2: No AST
Gear 3: No AST
Gear 4: Shell out → run AST → parse → use ❌ Slow
Gear 5: No AST
Gear 6: Shell out → run AST → parse → use ❌ Slow
```

**Problems**:
- ❌ Runs AST multiple times (slow)
- ❌ Shell-out for each gear (fragile)
- ❌ Results not reused
- ❌ Each gear waits for AST

### After (File-Based Cache)

```
Gear 1: Run AST ONCE → save to files ✅
Gear 2: (optional) Read files if needed
Gear 3: Read files → instant ✅
Gear 4: Read files → instant ✅
Gear 5: Read files → instant ✅
Gear 6: Read files → instant ✅
```

**Benefits**:
- ✅ AST runs once
- ✅ Files are reliable (exist or don't)
- ✅ Instant reads (no parsing)
- ✅ Debuggable (inspect `.stackshift-analysis/`)

---

## Determinism Guarantees

### What We Guarantee

**Gear 1**:
- ✅ AST analysis WILL run
- ✅ Files WILL be created at `.stackshift-analysis/`
- ✅ Unless: Node.js unavailable, disk full, permissions

**Gear 4**:
- ✅ Will read `.stackshift-analysis/roadmap.md`
- ✅ If missing, runs fresh analysis automatically
- ✅ If stale, warns and re-runs

**All Gears**:
- ✅ Deterministic: Files exist = use them, files missing = error (or fallback)
- ✅ No interpretation: Bash tool reads files directly
- ✅ Fast: Reading JSON/markdown is instant

### Failure Modes

| Issue | Detection | Recovery |
|-------|-----------|----------|
| Node.js missing | Bash error | User installs Node.js |
| Script missing | Bash error | Re-clone repo |
| Cache stale | Auto-detect | Auto re-run analysis |
| Cache corrupt | JSON parse error | Delete cache, re-run |
| Disk full | Write error | Free space, re-run |

---

## Migration Path

### Phase 1: ✅ Implement File-Based Architecture (DONE)

- Created `run-ast-analysis.mjs analyze` command
- Saves to `.stackshift-analysis/` directory
- Implements caching with 1-hour TTL
- Auto-refresh if stale

### Phase 2: ✅ Update Gear 1 and Gear 4 (DONE)

- Gear 1: Runs analysis upfront
- Gear 4: Reads from cache

### Phase 3: Update Remaining Gears (TODO)

- [ ] Gear 3: Read status from `raw-analysis.json`
- [ ] Gear 6: Read verification data
- [ ] Gear 2: Optional AST-based extraction
- [ ] Gear 5: Read for evidence-based clarifications

---

## Performance

### Metrics

**Before** (shell-out approach):
- Gear 4: ~2-5 seconds (run AST + parse)
- Gear 6: ~2-5 seconds (run AST + parse)
- Total: ~4-10 seconds AST overhead

**After** (file-based):
- Gear 1: ~2-5 seconds (run AST once)
- Gear 4: ~50ms (read markdown file)
- Gear 6: ~50ms (read JSON file)
- Total: ~2-5 seconds AST + 100ms reads

**Savings**: 50-90% faster for multi-gear workflows

---

## Summary

**Architecture**: Run once, cache to files, read everywhere

**Key Files**:
- `.stackshift-analysis/roadmap.md` - Gap analysis (human)
- `.stackshift-analysis/raw-analysis.json` - Full data (machine)
- `.stackshift-analysis/summary.json` - Metadata

**Determinism**: Files exist = guaranteed to read them

**Performance**: 50-90% faster than shell-out approach

**User Experience**: Transparent caching, auto-refresh if stale

**Bottom Line**: AST analysis is now deterministic, efficient, and cached for all gears to use.
