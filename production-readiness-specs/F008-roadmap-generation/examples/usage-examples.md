# F008 Roadmap Generation - Usage Examples

This document provides practical examples of using the F008 roadmap generation feature.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Advanced Options](#advanced-options)
3. [Programmatic API Usage](#programmatic-api-usage)
4. [Output Formats](#output-formats)
5. [Integrating with CI/CD](#integrating-with-cicd)

---

## Basic Usage

### Generate Roadmap for Current Project

The simplest way to generate a roadmap:

```bash
# Via MCP tool (when using Claude)
stackshift_generate_roadmap

# This will:
# 1. Analyze gaps in current directory
# 2. Generate roadmap with default settings
# 3. Export to ROADMAP.md
```

### Generate with Feature Brainstorming

Include AI-powered feature suggestions:

```json
{
  "directory": "/path/to/project",
  "outputFormat": "markdown",
  "includeFeatureBrainstorming": true,
  "confidenceThreshold": 70,
  "teamSize": 2
}
```

---

## Advanced Options

### Adjust Confidence Threshold

Only include high-confidence gaps:

```json
{
  "confidenceThreshold": 80
}
```

**Use cases:**
- `confidenceThreshold: 90+` - Only very certain gaps (fewer false positives)
- `confidenceThreshold: 50-70` - Balanced (default)
- `confidenceThreshold: <50` - Include uncertain gaps (exploratory)

### Team Size for Timeline Estimates

Get timeline estimates for different team sizes:

```json
{
  "teamSize": 3
}
```

**Effect on estimates:**
- `teamSize: 1` - 1.0x multiplier (baseline)
- `teamSize: 2` - 0.55x multiplier (~45% faster)
- `teamSize: 3` - 0.4x multiplier (~60% faster)

### Export to Multiple Formats

Export roadmap to all supported formats:

```json
{
  "outputFormat": "all"
}
```

This creates:
- `ROADMAP.md` - Human-readable markdown
- `roadmap.json` - Structured data for tooling
- `roadmap.csv` - Spreadsheet import
- `roadmap.html` - Standalone webpage
- `github-issues.json` - Ready for GitHub import

---

## Programmatic API Usage

### TypeScript/JavaScript Integration

```typescript
import { SpecGapAnalyzer } from './analyzers/gap-analyzer';
import { FeatureAnalyzer } from './analyzers/feature-analyzer';
import { FeatureBrainstormer } from './brainstorming/feature-brainstormer';
import { RoadmapGenerator } from './roadmap/roadmap-generator';
import { RoadmapExporter } from './exporters/roadmap-exporter';
import { loadProjectContext } from './brainstorming/utils/project-context';

// 1. Analyze gaps
const gapAnalyzer = new SpecGapAnalyzer({ confidenceThreshold: 70 });
const specGaps = await gapAnalyzer.analyzeSpecs('specs/', 'src/');

// 2. Analyze features
const featureAnalyzer = new FeatureAnalyzer({ accuracyThreshold: 70 });
const featureGaps = await featureAnalyzer.analyzeFeatures('.', 'src/');

// 3. Brainstorm features (optional)
const context = await loadProjectContext('.');
const brainstormer = new FeatureBrainstormer({ featuresPerCategory: 5 });
const features = await brainstormer.brainstormFeatures(context);

// 4. Generate roadmap
const generator = new RoadmapGenerator({ maxPhases: 4, teamSize: 2 });
const roadmap = await generator.generateRoadmap(
  [...specGaps, ...featureGaps],
  features,
  context
);

// 5. Export
const exporter = new RoadmapExporter();
await exporter.export(roadmap, 'markdown', { outputPath: 'ROADMAP.md' });
```

### Custom Scoring

```typescript
import { ScoringEngine } from './brainstorming/scoring-engine';

const scorer = new ScoringEngine({
  weights: {
    impact: 0.5,      // Prioritize impact
    effort: 0.2,      // Less weight on effort
    strategicValue: 0.2,
    risk: 0.1,
  },
});

const scored = await scorer.scoreFeatures(features, context);
```

### Custom Prioritization

```typescript
import { Prioritizer } from './roadmap/prioritizer';

const prioritizer = new Prioritizer({ strategy: 'balanced' });

// Prioritize items
const prioritized = await prioritizer.prioritize(items, context);

// Resolve dependencies
const ordered = await prioritizer.resolveDependencies(prioritized);

// Find ready-to-work items
const ready = prioritizer.findReadyItems(ordered, new Set(['item-1', 'item-2']));
```

---

## Output Formats

### Markdown (ROADMAP.md)

```markdown
# Project Strategic Roadmap

**Generated:** November 17, 2025
**Completion:** 42% complete

## Phase 1: Critical Fixes (4 weeks)

| Priority | Item | Type | Effort | Owner |
|----------|------|------|--------|-------|
| P0 | Fix authentication bug | gap-fix | 16h | - |
| P0 | Add input validation | gap-fix | 12h | - |

## Timeline

- 1 developer: 12 weeks
- 2 developers: 7 weeks
- 3 developers: 5 weeks
```

### JSON (roadmap.json)

```json
{
  "metadata": {
    "generated": "2025-11-17T...",
    "projectName": "my-project",
    "toolVersion": "1.0.0"
  },
  "phases": [...],
  "allItems": [...],
  "timeline": {...},
  "risks": [...],
  "dependencies": [...]
}
```

### CSV (roadmap.csv)

```csv
Priority,Phase,Title,Type,Effort (hours),Status,Tags,Dependencies
P0,1,Fix auth bug,gap-fix,16,not-started,"gap;security;P0",
P1,2,Add caching,feature,24,not-started,"performance;P1","auth-fix"
```

### GitHub Issues (github-issues.json)

```json
[
  {
    "title": "Fix authentication bug",
    "body": "## Description\n...",
    "labels": ["P0", "gap-fix", "security"],
    "milestone": "Phase 1",
    "assignee": null
  }
]
```

---

## Integrating with CI/CD

### GitHub Actions

```yaml
name: Generate Roadmap

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  workflow_dispatch:

jobs:
  generate-roadmap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Generate roadmap
        run: |
          npx stackshift generate-roadmap \
            --format all \
            --confidence-threshold 70 \
            --team-size 2

      - name: Commit roadmap
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add ROADMAP.md roadmap-exports/
          git commit -m "chore: Update roadmap [skip ci]" || true
          git push
```

### GitLab CI

```yaml
generate-roadmap:
  image: node:18
  script:
    - npm install
    - npx stackshift generate-roadmap --format all
  artifacts:
    paths:
      - ROADMAP.md
      - roadmap-exports/
  only:
    - schedules
```

---

## Best Practices

### 1. **Regular Updates**

Generate roadmap weekly or monthly to track progress:

```bash
# Cron job
0 0 * * 0 cd /path/to/project && stackshift_generate_roadmap
```

### 2. **Version Control**

Commit roadmap to track changes over time:

```bash
git add ROADMAP.md
git commit -m "docs: Update roadmap - $(date +%Y-%m-%d)"
```

### 3. **Team Review**

Use roadmap in sprint planning:

1. Generate roadmap
2. Review P0 and P1 items with team
3. Assign owners to items
4. Track progress in next roadmap generation

### 4. **Customize for Your Stack**

Adjust confidence threshold based on your codebase maturity:

- **Mature codebase:** `confidenceThreshold: 80+` (high confidence only)
- **New project:** `confidenceThreshold: 50-60` (exploratory)
- **Migration:** `confidenceThreshold: 70` (balanced)

### 5. **Export for Stakeholders**

Different audiences need different formats:

- **Developers:** Markdown (`ROADMAP.md`)
- **Project Managers:** HTML (`roadmap.html`)
- **Spreadsheet Analysis:** CSV (`roadmap.csv`)
- **GitHub Issues:** JSON (`github-issues.json`)

---

## Troubleshooting

### High Memory Usage

For large codebases (>100k LOC), roadmap generation may use significant memory.

**Solution:** Increase Node.js memory limit:

```bash
NODE_OPTIONS="--max-old-space-size=4096" stackshift_generate_roadmap
```

### Slow Generation

If generation takes >5 minutes:

1. **Reduce confidence threshold** - Skip low-confidence gaps
2. **Disable feature brainstorming** - Set `includeFeatureBrainstorming: false`
3. **Limit spec analysis** - Only analyze critical specs

### Inaccurate Gap Detection

If gaps seem incorrect:

1. **Check spec quality** - Ensure specs have clear acceptance criteria
2. **Verify file paths** - Ensure implementation files match expected locations
3. **Adjust confidence threshold** - Lower threshold to see more potential gaps

---

## Example Workflows

### Workflow 1: Initial Roadmap

```bash
# First time generating roadmap
stackshift_generate_roadmap \
  --include-feature-brainstorming \
  --confidence-threshold 60 \
  --team-size 2 \
  --format all

# Review ROADMAP.md
# Assign priorities and owners
# Commit to repo
```

### Workflow 2: Sprint Planning

```bash
# Before sprint planning
stackshift_generate_roadmap \
  --confidence-threshold 70

# Review new gaps since last sprint
# Select P0/P1 items for sprint
# Track completion
```

### Workflow 3: Quarterly Review

```bash
# Generate comprehensive roadmap
stackshift_generate_roadmap \
  --include-feature-brainstorming \
  --format all

# Export to HTML for stakeholder presentation
# Review strategic features
# Update project priorities
```

---

## Additional Resources

- [F008 Specification](../spec.md)
- [Implementation Plan](../impl-plan.md)
- [Data Model](../data-model.md)
- [API Contracts](../contracts/README.md)
