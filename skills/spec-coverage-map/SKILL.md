---
name: spec-coverage-map
description: Generate a visual spec-to-code coverage map showing which code files are covered by which specifications. Creates ASCII diagrams, reverse indexes, and coverage statistics. Use after implementation or during cleanup to validate spec coverage.
---

# Spec-to-Code Coverage Map

Generate a comprehensive coverage map showing the relationship between specifications and implementation files.

**When to run:** After Gear 6 (Implementation) or during cleanup/documentation phases

**Output:** `docs/spec-coverage-map.md`

---

## What This Does

Creates a visual map showing:
1. **Spec → Files**: Which code files each spec covers
2. **Files → Specs**: Which spec(s) cover each code file (reverse index)
3. **Coverage Statistics**: Percentages by category (backend, frontend, infrastructure)
4. **Gap Analysis**: Code files not covered by any spec
5. **Shared Files**: Files referenced by multiple specs

---

## Process

### Step 1: Discover All Specifications

```bash
# Find all spec files
find .specify/memory/specifications -name "*.md" -type f 2>/dev/null || \
find specs -name "spec.md" -type f 2>/dev/null

# Count them
SPEC_COUNT=$(find .specify/memory/specifications -name "*.md" -type f 2>/dev/null | wc -l)
echo "Found $SPEC_COUNT specifications"
```

### Step 2: Extract File References from Each Spec

For each spec, look for file references in these sections:
- "Files" or "File Structure"
- "Implementation Status"
- "Components Implemented"
- "Technical Details"
- Code blocks with file paths

**Pattern matching:**
```bash
# Common file reference patterns in specs
- src/handlers/foo.js
- api/handlers/property-details.ts
- site/pages/Home.tsx
- infrastructure/terraform/main.tf
- .github/workflows/deploy.yml
```

Read each spec and extract:
- File paths mentioned
- Component names that map to files
- Directory references

### Step 3: Categorize Files

Group files by type:
- **Backend**: api/, src/handlers/, src/services/, lib/
- **Frontend**: site/, pages/, components/, app/
- **Infrastructure**: infrastructure/, terraform/, .github/workflows/
- **Database**: prisma/, migrations/, schema/
- **Scripts**: scripts/, bin/
- **Config**: package.json, tsconfig.json, etc.
- **Tests**: *.test.ts, *.spec.ts, __tests__/

### Step 4: Generate ASCII Box Diagrams

For each spec, create a box diagram:

```
┌─────────────────────────────────┐
│  001-feature-name               │ Status: ✅ COMPLETE
├─────────────────────────────────┤
│ Backend:                        │
│  ├─ api/src/handlers/foo.js     │
│  └─ api/src/services/bar.js     │
│ Frontend:                       │
│  └─ site/src/pages/Foo.tsx      │
│ Infrastructure:                 │
│  └─ .github/workflows/deploy.yml│
└─────────────────────────────────┘
```

**Box Drawing Characters:**
```
┌ ─ ┐  (top)
│     (sides)
├ ─ ┤  (divider)
└ ─ ┘  (bottom)
├ └   (tree branches)
```

### Step 5: Create Reverse Index

Build a table showing which spec(s) cover each file:

```markdown
## Files → Specs Reverse Index

| File | Covered By | Count |
|------|------------|-------|
| api/handlers/property.ts | 001-property-details, 003-pricing | 2 |
| site/pages/Home.tsx | 001-homepage | 1 |
| lib/utils/format.ts | 001-property, 002-search, 004-pricing | 3 |
```

**Highlight:**
- 🟢 **Single spec** (1 spec) - Normal coverage
- 🟡 **Shared** (2-3 specs) - Multiple features use this
- 🔴 **Hot** (4+ specs) - Critical shared utility

### Step 6: Calculate Coverage Statistics

```markdown
## Coverage Statistics

| Category | Total Files | Covered | Coverage % |
|----------|-------------|---------|------------|
| Backend | 45 | 42 | 93% |
| Frontend | 38 | 35 | 92% |
| Infrastructure | 12 | 10 | 83% |
| Database | 8 | 8 | 100% |
| Scripts | 6 | 4 | 67% |
| **TOTAL** | **109** | **99** | **91%** |
```

**Coverage Heat Map:**
```
Backend       [████████████████░░] 93%
Frontend      [████████████████░░] 92%
Infrastructure [███████████████░░░] 83%
Database      [████████████████████] 100%
Scripts       [█████████░░░░░░░░░] 67%
```

### Step 7: Identify Gaps

```markdown
## 🚨 Coverage Gaps (10 files)

Files not covered by any specification:

**Backend:**
- api/handlers/legacy-foo.js (deprecated?)
- api/utils/debug.ts (utility?)

**Frontend:**
- site/components/DevTools.tsx (dev-only?)

**Scripts:**
- scripts/experimental/test.sh (WIP?)
- scripts/deprecated/old-deploy.sh (remove?)

**Recommendations:**
- Remove deprecated files
- Create specs for utilities if they contain business logic
- Document dev-only tools in a utilities spec
```

### Step 8: Highlight Shared Files

```markdown
## 🔥 Shared Files (Referenced by 3+ Specs)

| File | Specs | Count | Risk |
|------|-------|-------|------|
| lib/utils/pricing.ts | 001, 003, 004, 007, 009 | 5 | 🔴 HIGH |
| lib/api/client.ts | 002, 005, 006, 008 | 4 | 🔴 HIGH |
| lib/types/property.ts | 001, 002, 011 | 3 | 🟡 MEDIUM |

**High-risk files** (4+ specs):
- Changes affect multiple features
- Require extra testing
- Should have comprehensive test coverage
- Consider refactoring if too coupled
```

---

## Complete Output Template

```markdown
# Spec-to-Code Coverage Map

Generated: [TIMESTAMP]
Total Specs: [COUNT]
Total Files Covered: [COUNT]
Overall Coverage: [PERCENTAGE]%

---

## Coverage by Spec

[For each spec, ASCII box diagram with files]

---

## Files → Specs Reverse Index

[Table of all files and which specs cover them]

---

## Coverage Statistics

[Stats table and heat map]

---

## Coverage Gaps

[List of files not covered by any spec]

---

## Shared Files

[Files referenced by multiple specs with risk assessment]

---

## Recommendations

- [Action items based on analysis]
- [Gaps to address]
- [Refactoring opportunities]
```

---

## When to Generate

### Automatic Triggers

1. **End of Gear 6 (Implement)** - After all features implemented
2. **Cleanup Phase** - When finalizing documentation
3. **Manual Request** - User asks for coverage analysis

### Manual Invocation

```bash
# Check current coverage
cat .stackshift-state.json | grep currentGear

# If Gear 6 complete or in cleanup:
"Generate spec-to-code coverage map"
```

---

## Integration Points

### In Gear 6 (Implement) Skill

After completing all implementations, add:

```markdown
## Final Step: Generate Coverage Map

Creating spec-to-code coverage map...

[Run coverage map generation]

✅ Coverage map saved to docs/spec-coverage-map.md

Summary:
- 109 files covered by 12 specs
- 91% overall coverage
- 10 gap files identified
- 3 high-risk shared files
```

### In Cleanup/Finalization

When user says "cleanup" or "finalize documentation":

```markdown
Running final cleanup tasks:

1. ✅ Generate spec-coverage-map.md
2. ✅ Update README with coverage stats
3. ✅ Commit all documentation
4. ✅ Create summary report
```

---

## Success Criteria

After generating coverage map, you should have:

- ✅ `docs/spec-coverage-map.md` file created
- ✅ Visual ASCII diagrams for each spec
- ✅ Reverse index table (files → specs)
- ✅ Coverage statistics and heat map
- ✅ Gap analysis with recommendations
- ✅ Shared files risk assessment
- ✅ Actionable next steps

---

## Example Output

```markdown
# Spec-to-Code Coverage Map

Generated: 2025-11-19T17:45:00Z
Total Specs: 12
Total Files Covered: 99
Overall Coverage: 91%

---

## Coverage by Spec

┌─────────────────────────────────────────────┐
│  001-property-details-display               │ Status: ✅ COMPLETE
├─────────────────────────────────────────────┤
│ Backend (3 files):                          │
│  ├─ api/handlers/property-details.ts        │
│  ├─ api/services/property-data.ts           │
│  └─ lib/validators/mls-id.ts               │
│ Frontend (2 files):                         │
│  ├─ site/pages/PropertyDetails.tsx          │
│  └─ site/components/PropertyCard.tsx        │
│ Tests (2 files):                            │
│  ├─ api/handlers/property-details.test.ts   │
│  └─ site/pages/PropertyDetails.test.tsx     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  002-inventory-search                       │ Status: ✅ COMPLETE
├─────────────────────────────────────────────┤
│ Backend (4 files):                          │
│  ├─ api/handlers/search.ts                  │
│  ├─ api/services/elasticsearch.ts           │
│  ├─ lib/query-builder.ts                    │
│  └─ lib/filters/property-filters.ts         │
│ Frontend (3 files):                         │
│  ├─ site/pages/Search.tsx                   │
│  ├─ site/components/SearchBar.tsx           │
│  └─ site/components/FilterPanel.tsx         │
└─────────────────────────────────────────────┘

... [10 more specs]

---

## Files → Specs Reverse Index

| File | Covered By Specs | Count | Risk |
|------|------------------|-------|------|
| lib/utils/pricing.ts | 001, 003, 004, 007, 009 | 5 | 🔴 HIGH |
| lib/api/client.ts | 002, 005, 006, 008 | 4 | 🔴 HIGH |
| api/handlers/property-details.ts | 001 | 1 | 🟢 LOW |
| site/pages/Home.tsx | 003 | 1 | 🟢 LOW |
| lib/types/property.ts | 001, 002, 011 | 3 | 🟡 MEDIUM |

... [99 files total]

---

## Coverage Statistics

| Category | Total Files | Covered | Uncovered | Coverage % |
|----------|-------------|---------|-----------|------------|
| Backend | 45 | 42 | 3 | 93% |
| Frontend | 38 | 35 | 3 | 92% |
| Infrastructure | 12 | 10 | 2 | 83% |
| Database | 8 | 8 | 0 | 100% |
| Scripts | 6 | 4 | 2 | 67% |
| **TOTAL** | **109** | **99** | **10** | **91%** |

### Coverage Heat Map

```
Backend       [████████████████░░] 93%
Frontend      [████████████████░░] 92%
Infrastructure [███████████████░░░] 83%
Database      [████████████████████] 100%
Scripts       [█████████░░░░░░░░░] 67%
```

---

## Coverage Gaps (10 files)

Files not covered by any specification:

**Backend (3 files):**
- api/handlers/legacy-foo.js - Deprecated?
- api/utils/debug.ts - Dev utility?
- api/middleware/cors.ts - Shared infrastructure?

**Frontend (3 files):**
- site/components/DevTools.tsx - Dev-only component
- site/pages/404.tsx - Error page (needs spec?)
- site/utils/logger.ts - Utility (shared)

**Infrastructure (2 files):**
- .github/workflows/experimental.yml - WIP?
- infrastructure/terraform/dev-only.tf - Dev env?

**Scripts (2 files):**
- scripts/experimental/test.sh - WIP
- scripts/deprecated/old-deploy.sh - Remove?

### Recommendations:

1. **Remove deprecated files** (3 files identified)
2. **Create utility spec** for shared utils (cors, logger)
3. **Document dev tools** in separate spec
4. **Review experimental** workflows/scripts

---

## Shared Files (Referenced by 3+ Specs)

| File | Referenced By | Count | Risk Level |
|------|---------------|-------|------------|
| lib/utils/pricing.ts | 001, 003, 004, 007, 009 | 5 | 🔴 HIGH |
| lib/api/client.ts | 002, 005, 006, 008 | 4 | 🔴 HIGH |
| lib/types/property.ts | 001, 002, 011 | 3 | 🟡 MEDIUM |
| lib/validators/input.ts | 001, 002, 005 | 3 | 🟡 MEDIUM |

### Risk Assessment:

**🔴 High-risk files** (4+ specs):
- Changes affect multiple features
- Require comprehensive testing
- Should have 95%+ test coverage
- Consider splitting if too coupled

**🟡 Medium-risk files** (2-3 specs):
- Changes affect few features
- Standard testing required
- Monitor for increased coupling

**🟢 Low-risk files** (1 spec):
- Feature-specific
- Standard development flow

---

## Summary

- ✅ **91% coverage** - Excellent
- ⚠️ **10 gap files** - Need review
- 🔴 **2 high-risk shared files** - Monitor closely
- 📊 **12 specs** covering **99 files**

### Action Items:

1. Review 10 gap files and either:
   - Create specs for them
   - Remove if deprecated
   - Document as infrastructure/utilities

2. Add extra test coverage for high-risk shared files

3. Consider refactoring pricing.ts (5 specs depend on it)

---

**Next Steps:**

Run `/speckit.clarify` to resolve any [NEEDS CLARIFICATION] markers in specs that were identified during coverage analysis.
```

---

## Implementation Details

### File Path Extraction Patterns

Look for these patterns in spec markdown:

```markdown
# In "Files" or "Implementation Status" sections:
- `api/handlers/foo.ts` ✅
- **Backend:** `src/services/bar.js`
- File: `site/pages/Home.tsx`

# In code blocks:
```typescript
// File: lib/utils/pricing.ts
```

# In lists:
## Backend Components
- Property handler: `api/handlers/property.ts`
- Pricing service: `api/services/pricing.ts`
```

**Extraction strategy:**
1. Parse markdown sections titled "Files", "Implementation Status", "Components"
2. Extract backtick-wrapped paths: `path/to/file.ext`
3. Extract bold paths: **File:** path/to/file.ext
4. Look for file extensions: .ts, .tsx, .js, .jsx, .py, .go, .tf, .yml, etc.
5. Validate paths actually exist in codebase

### ASCII Box Generation

```bash
# Box characters
TOP="┌─┐"
SIDE="│"
DIVIDER="├─┤"
BOTTOM="└─┘"
BRANCH="├─"
LAST_BRANCH="└─"

# Example template
echo "┌─────────────────────────────────┐"
echo "│  $SPEC_NAME                     │ Status: $STATUS"
echo "├─────────────────────────────────┤"
echo "│ Backend:                        │"
for file in $BACKEND_FILES; do
  echo "│  ├─ $file"
done
echo "│ Frontend:                       │"
for file in $FRONTEND_FILES; do
  echo "│  ├─ $file"
done
echo "└─────────────────────────────────┘"
```

### Coverage Calculation

```javascript
// Calculate coverage percentage
const totalFiles = Object.keys(allFiles).length;
const coveredFiles = Object.keys(filesToSpecs).length;
const coveragePercent = Math.round((coveredFiles / totalFiles) * 100);

// By category
const backendCoverage = (coveredBackend / totalBackend) * 100;
const frontendCoverage = (coveredFrontend / totalFrontend) * 100;
```

### Heat Map Visualization

```javascript
// Generate heat map bar
function heatMapBar(percentage) {
  const filled = Math.round(percentage / 5); // 20 blocks total
  const empty = 20 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
}

// Example output:
// [████████████████░░] 92%
```

---

## Success Criteria

✅ Coverage map generated at `docs/spec-coverage-map.md`
✅ ASCII box diagram for every spec
✅ Reverse index table (files → specs)
✅ Coverage statistics by category
✅ Heat map visualization
✅ Gap analysis with recommendations
✅ Shared files risk assessment
✅ Overall coverage percentage > 85%

---

## Error Handling

**If no specs found:**
```
⚠️ No specifications found in .specify/memory/specifications/ or specs/
Cannot generate coverage map without specs.

Run Gear 3 first: /stackshift.create-specs
```

**If specs have no file references:**
```
⚠️ Specs don't contain file references.
Cannot generate coverage map.

This usually means:
1. Specs were created but implementation hasn't started
2. Specs need "Files" or "Implementation Status" sections
3. Using old spec format (update specs)
```

**If coverage very low (< 50%):**
```
⚠️ Coverage is only 35%

This indicates:
- Many files not documented in specs
- Specs may be incomplete
- Consider running /speckit.analyze to validate alignment
```

---

## Usage Examples

### After Gear 6 Completion

```
User: [Gear 6 completes all implementations]

StackShift: "✅ All features implemented!

Let me generate a coverage map to visualize spec-to-code relationships..."

[Generates coverage map]

StackShift: "📊 Coverage Map Complete!

✅ 91% coverage (99/109 files)
🚨 10 gap files identified
🔴 2 high-risk shared files

Saved to: docs/spec-coverage-map.md

Would you like me to:
1. Review gap files
2. Create specs for missing files
3. Commit all changes"
```

### During Cleanup

```
User: "Clean up the documentation and finalize"

StackShift: "Running cleanup tasks:

1. Generating spec-coverage-map...
2. Updating README with coverage stats...
3. Removing temporary files...
4. Creating final summary...

✅ Cleanup complete!"
```

---

## Technical Notes

- Parse specs in sorted order (001, 002, etc.) for consistent output
- Handle both `.specify/memory/specifications/` and `specs/*/spec.md` formats
- Use relative paths from project root
- Validate file existence before including in map
- Mark non-existent files as ❌ in coverage map
- Use unicode box-drawing characters (not ASCII art approximations)
- Generate clean markdown tables with proper alignment
- Include timestamp for tracking coverage over time

---

**This coverage map provides crucial visibility into spec-code alignment and helps identify documentation gaps!**
