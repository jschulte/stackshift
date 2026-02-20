---
description: Generate spec-to-code coverage map showing which code files are covered by which specifications. Creates ASCII diagrams, reverse indexes, and coverage statistics.
---

# Generate Spec Coverage Map

Create a comprehensive visual map of specification-to-code coverage.

---

## What This Does

Analyzes all specifications and generates a coverage map showing:

1. **Spec → Files**: ASCII box diagrams for each spec
2. **Files → Specs**: Reverse index table
3. **Coverage Statistics**: Percentages by category
4. **Heat Map**: Visual representation
5. **Gap Analysis**: Uncovered files
6. **Shared Files**: High-risk multi-spec files

**Output:** `docs/spec-coverage-map.md`

---

## Usage

```bash
# Generate coverage map
/stackshift.coverage
```

I'll:
1. Find all spec files in `.specify/memory/specifications/` or `specs/`
2. Extract file references from each spec
3. Categorize files (backend, frontend, infrastructure, etc.)
4. Generate visual diagrams and tables
5. Calculate coverage statistics
6. Identify gaps and shared files
7. Save to `docs/spec-coverage-map.md`

---

## When to Use

- ✅ After Gear 6 (Implementation complete)
- ✅ During code reviews (validate coverage)
- ✅ When onboarding new team members
- ✅ Before refactoring (identify dependencies)
- ✅ For documentation audits

---

## Example Output Summary

```
📊 Spec Coverage Health Report

Overall Coverage: 91% (99/109 files)

By Category:
  Backend:       93% [████████████████░░]
  Frontend:      92% [████████████████░░]
  Infrastructure: 83% [███████████████░░░]
  Database:      100% [████████████████████]
  Scripts:       67% [█████████░░░░░░░░░]

Status:
  ✅ 12 specs covering 99 files
  ⚠️  10 gap files identified
  🔴 2 high-risk shared files

Full report: docs/spec-coverage-map.md
```

---

## What You'll See

The full coverage map includes:

### ASCII Box Diagrams
```
┌─────────────────────────────────┐
│  001-property-details           │ Status: ✅ COMPLETE
├─────────────────────────────────┤
│ Backend:                        │
│  ├─ api/handlers/property.ts    │
│  └─ api/services/data.ts        │
│ Frontend:                       │
│  └─ site/pages/Property.tsx     │
└─────────────────────────────────┘
```

### Reverse Index
```markdown
| File | Covered By | Count |
|------|------------|-------|
| lib/utils/pricing.ts | 001, 003, 004, 007, 009 | 5 |
```

### Coverage Gaps
```markdown
Files not covered by any specification:
- api/utils/debug.ts
- scripts/experimental/test.sh
```

---

**Ready!** Let me generate your spec coverage map now...
