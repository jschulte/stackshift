---
name: analyze
description: Perform initial analysis of a codebase - detect tech stack, directory structure, and completeness. This is Step 1 of the 6-step reverse engineering process that transforms incomplete applications into spec-driven codebases. Automatically detects programming languages, frameworks, architecture patterns, and generates comprehensive analysis-report.md. Use when starting reverse engineering on any codebase.
---

# Initial Analysis

**Step 1 of 6** in the Reverse Engineering to Spec-Driven Development process.

**Estimated Time:** 5 minutes
**Output:** `analysis-report.md`

---

## When to Use This Skill

Use this skill when:
- Starting reverse engineering on a new or existing codebase
- Need to understand tech stack and architecture before making changes
- Want to assess project completeness and identify gaps
- First time analyzing this project with the toolkit
- User asks "analyze this codebase" or "what's in this project?"

**Trigger Phrases:**
- "Analyze this codebase"
- "What tech stack is this using?"
- "How complete is this application?"
- "Run initial analysis"
- "Start reverse engineering process"

---

## What This Skill Does

This skill performs comprehensive initial analysis by:

1. **Auto-detecting application context** - Identifies programming languages, frameworks, and build systems
2. **Analyzing directory structure** - Maps architecture patterns and key components
3. **Scanning existing documentation** - Assesses current documentation quality
4. **Estimating completeness** - Evaluates how complete the implementation is
5. **Generating analysis report** - Creates `analysis-report.md` with all findings

---

## Process Overview

The analysis follows 5 steps:

### Step 1: Auto-Detect Application Context
- Run detection commands for all major languages/frameworks
- Identify the primary technology stack
- Extract version information

See [operations/detect-stack.md](operations/detect-stack.md) for detailed instructions.

### Step 2: Extract Core Metadata
- Application name from manifest or directory
- Version number from package manifests
- Description from README or manifest
- Git repository URL if available
- Technology stack summary

### Step 3: Analyze Directory Structure
- Identify architecture patterns (MVC, microservices, monolith, etc.)
- Find configuration files
- Count source files by type
- Map key components (backend, frontend, database, API, infrastructure)

See [operations/directory-analysis.md](operations/directory-analysis.md) for detailed instructions.

### Step 4: Check for Existing Documentation
- Scan for docs folders and markdown files
- Assess documentation quality
- Identify what's documented vs. what's missing

See [operations/documentation-scan.md](operations/documentation-scan.md) for detailed instructions.

### Step 5: Assess Completeness
- Look for placeholder files (TODO, WIP, etc.)
- Check README for mentions of incomplete features
- Count test files and estimate test coverage
- Verify deployment/CI setup

See [operations/completeness-assessment.md](operations/completeness-assessment.md) for detailed instructions.

---

## Output Format

This skill generates `analysis-report.md` in the project root with:

- **Application Metadata** - Name, version, description, repository
- **Technology Stack** - Languages, frameworks, libraries, build system
- **Architecture Overview** - Directory structure, key components
- **Existing Documentation** - What docs exist and their quality
- **Completeness Assessment** - Estimated % completion with evidence
- **Source Code Statistics** - File counts, lines of code estimates
- **Recommended Next Steps** - Focus areas for reverse engineering
- **Notes** - Additional observations

See [operations/generate-report.md](operations/generate-report.md) for the complete template.

---

## Success Criteria

After running this skill, you should have:

- ✅ `analysis-report.md` file created in project root
- ✅ Technology stack clearly identified
- ✅ Directory structure and architecture understood
- ✅ Completeness estimated (% done for backend, frontend, tests, docs)
- ✅ Ready to proceed to Step 2 (Reverse Engineer)

---

## Next Step

Once `analysis-report.md` is created and reviewed, proceed to:

**Step 2: Reverse Engineer** - Use the `reverse-engineer` skill to generate comprehensive documentation.

---

## Principles

For guidance on performing effective initial analysis:
- [principles/multi-language-detection.md](principles/multi-language-detection.md) - Detecting polyglot codebases
- [principles/architecture-pattern-recognition.md](principles/architecture-pattern-recognition.md) - Identifying common patterns

---

## Common Workflows

**New Project Analysis:**
1. User asks to analyze codebase
2. Run all detection commands in parallel
3. Generate analysis report
4. Present summary and ask if ready for Step 2

**Re-analysis:**
1. Check if analysis-report.md already exists
2. Ask user if they want to update it or skip to Step 2
3. If updating, re-run analysis and show diff

**Partial Analysis:**
1. User already knows tech stack
2. Skip detection, focus on completeness assessment
3. Generate abbreviated report

---

## Technical Notes

- **Parallel execution:** Run all language detection commands in parallel for speed
- **Error handling:** Missing manifest files are normal (return empty), don't error
- **File limits:** Use `head` to limit output for large codebases
- **Exclusions:** Always exclude node_modules, vendor, .git, build, dist, target
- **Platform compatibility:** Commands work on macOS, Linux, WSL

---

## Example Invocation

When a user says:

> "I need to reverse engineer this application and create specifications. Let's start."

This skill auto-activates and:
1. Detects tech stack (e.g., Next.js, TypeScript, Prisma, AWS)
2. Analyzes directory structure (identifies app/, lib/, prisma/, infrastructure/)
3. Scans documentation (finds README.md, basic setup docs)
4. Assesses completeness (estimates backend 100%, frontend 60%, tests 30%)
5. Generates analysis-report.md
6. Presents summary and recommends proceeding to Step 2

---

**Remember:** This is Step 1 of 6. After analysis, you'll proceed to reverse-engineer, create-specs, gap-analysis, complete-spec, and implement. Each step builds on the previous one.
