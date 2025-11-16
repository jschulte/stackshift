# Visual Design System: StackShift

**Date:** 2025-11-16  
**Version:** 1.0.0  
**Route:** Brownfield (Tech-Prescriptive)

---

## Overview

StackShift is a command-line toolkit with no graphical user interface. This document describes the textual output conventions, markdown formatting standards, and documentation design patterns.

---

## Output Format Conventions

### Terminal Output

**Command-Line Interface:**
- All output to stdout (success, info)
- Errors to stderr
- No ANSI colors (terminal-independent)
- UTF-8 encoding

**Progress Indicators:**
```
✅ Gear 1: Complete
🔄 Gear 2: In Progress
⏳ Gear 3: Pending
❌ Error
```

**Emoji Usage:**
- ✅ Success/Complete
- 🔄 In Progress
- ⏳ Pending/Waiting
- ❌ Error/Failed
- ⚠️ Warning/Partial
- 🔍 Analysis/Search
- 📋 Specifications
- 🚀 Implementation
- 🏁 Finished
- 🔀 Greenfield Route
- ⚙️ Brownfield Route
- 🚗 Cruise Control

---

## Markdown Documentation Standards

### File Structure

**All Documentation Files:**
```markdown
# Title: Component Name

**Date:** YYYY-MM-DD
**Version:** X.Y.Z
**Route:** Greenfield/Brownfield

---

## Section 1
Content...

## Section 2
Content...

---

**Document Version:** X.Y.Z
**Last Updated:** YYYY-MM-DD
```

### Heading Hierarchy

- **H1 (#):** Document title only
- **H2 (##):** Major sections
- **H3 (###):** Subsections
- **H4 (####):** Details
- **H5 (#####):** Rare (avoid if possible)

---

### Code Blocks

**Syntax Highlighting:**
````markdown
```typescript
// TypeScript code
```

```json
{
  "key": "value"
}
```

```bash
# Shell commands
npm install
```
````

**Inline Code:**
- Use backticks: `variable`, `function()`, `file.ts`
- For file paths: `path/to/file.ts`
- For commands: `npm test`

---

### Lists

**Unordered:**
```markdown
- Item 1
- Item 2
  - Nested item
- Item 3
```

**Ordered:**
```markdown
1. First
2. Second
3. Third
```

**Checklists:**
```markdown
- [x] Completed item
- [ ] Pending item
```

---

### Tables

**Standard Format:**
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

**Alignment:**
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
```

---

### Links

**Internal (Relative):**
```markdown
[Link Text](./relative/path.md)
[Section](#section-name)
```

**External:**
```markdown
[GitHub](https://github.com/jschulte/stackshift)
```

---

### Emphasis

- **Bold:** `**bold text**` for important terms
- *Italic:* `*italic text*` for emphasis
- `Code`: Backticks for technical terms
- **Bold + Code:** `**`code`**` rarely

---

## Documentation Templates

### Feature Specification Template

```markdown
# Feature: [Name]

## Status: ✅ COMPLETE | ⚠️ PARTIAL | ❌ MISSING

## Overview
[Description]

## User Stories
- As a [user], I want [capability] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Requirements (Brownfield)
- Framework: [Name] [Version]
- Files: [Paths]

## Implementation Status
**Completed:**
- ✅ Item 1

**Missing:**
- ❌ Item 2

## Dependencies
- [Related feature]
```

---

### Implementation Plan Template

```markdown
# Implementation Plan: [Feature]

## Goal
[What to accomplish]

## Current State
[What exists]

## Target State
[What should exist]

## Technical Approach
1. Step 1
2. Step 2

## Tasks
- [ ] Task 1
- [ ] Task 2

## Risks & Mitigations
- **Risk:** [Description]
  **Mitigation:** [Solution]

## Success Criteria
- [Criterion 1]
```

---

## Git Commit Message Format

**Structure:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `chore`: Maintenance

**Examples:**
```
feat(gear-1): complete initial analysis of StackShift codebase

Generated comprehensive analysis-report.md covering tech stack,
architecture, documentation, and completeness assessment.

Config: Brownfield, Cruise Control, Defer clarifications, P0+P1 scope
```

---

## File Naming Conventions

**Documentation:**
- Lowercase with hyphens: `functional-specification.md`
- Descriptive names: `gap-analysis-report.md`
- No spaces or special characters

**Code:**
- Kebab-case for files: `state-manager.ts`
- PascalCase for classes: `StateManager`
- camelCase for functions: `analyzeToolHandler`

---

## Typography

**Fonts:**
- Monospace: Terminal output, code blocks
- Sans-serif: Documentation (rendered markdown)

**Line Length:**
- Code: 80-100 characters
- Markdown: No hard limit (let renderer wrap)
- Terminal output: 80 characters (for compatibility)

---

## Accessibility

**Markdown Accessibility:**
- Use descriptive link text (not "click here")
- Provide alt text for images (if any)
- Use semantic headings (don't skip levels)
- Use tables appropriately (not for layout)

**Terminal Accessibility:**
- No reliance on color alone
- Clear text-based indicators (✅/❌/⏳)
- Screen reader friendly (emojis have text equivalents)

---

## Documentation Quality Standards

**All Documentation Must:**
- Have clear title and date
- Use consistent heading hierarchy
- Include code examples where applicable
- Provide context (when, why, how)
- Link to related documents
- Be spell-checked
- Follow markdown linting rules

**Markdown Linting:**
```bash
# Install markdownlint
npm install -g markdownlint-cli

# Run linter
markdownlint docs/**/*.md
```

---

## Version Control

**Documentation Versioning:**
- Version number at top of each file
- Last updated date
- Changes tracked in git
- Major changes noted in CHANGELOG.md (future)

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-16  
**Note:** StackShift has no GUI - this document covers textual design conventions.
