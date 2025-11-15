# Step 1: Initial Analysis

**Estimated Time:** 5 minutes
**Output:** `analysis-report.md`

---

## 📋 Copy and Paste This Prompt

```
I need you to perform an initial analysis of the application in the current working directory.

# Step 1: Auto-Detect Application Context

Run the following commands to understand the application:

```bash
pwd                                    # Current directory
ls -la                                # Directory structure
git remote -v                         # Git repository info (if any)

# Language/Framework Detection
cat package.json 2>/dev/null          # Node.js/JavaScript
cat composer.json 2>/dev/null         # PHP
cat requirements.txt 2>/dev/null      # Python
cat Gemfile 2>/dev/null               # Ruby
cat pom.xml 2>/dev/null               # Java/Maven
cat build.gradle 2>/dev/null          # Java/Gradle
cat Cargo.toml 2>/dev/null            # Rust
cat go.mod 2>/dev/null                # Go
cat pubspec.yaml 2>/dev/null          # Dart/Flutter
find . -name "*.csproj" 2>/dev/null   # .NET/C#
```

# Step 2: Extract Core Metadata

From the manifest files or README, extract:
- **Application Name**: From manifest or directory name
- **Version**: From manifest file
- **Description**: From manifest or README
- **Repository**: Git remote URL
- **Technology Stack**: All languages, frameworks, libraries
- **Build System**: npm, maven, cargo, etc.

# Step 3: Analyze Directory Structure

```bash
# Identify architecture patterns
find . -type d -maxdepth 3 | grep -v -E "node_modules|vendor|\.git|build|dist|target" | head -40

# Find configuration files
find . -maxdepth 3 \( -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.toml" -o -name "*.xml" -o -name ".env*" \) | grep -v -E "node_modules|vendor|\.git" | head -30

# Count source files by type
find . -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v -E "node_modules|dist|build" | wc -l
find . -type f -name "*.py" | grep -v -E "__pycache__|venv" | wc -l
find . -type f -name "*.java" | wc -l
# (adapt based on detected language)
```

# Step 4: Check for Existing Documentation

```bash
ls -la docs/ 2>/dev/null
ls -la documentation/ 2>/dev/null
find . -name "*.md" | head -20
```

# Step 5: Assess Completeness

Provide a quick assessment:
- Are there placeholder files (TODO, WIP, etc.)?
- Does the README mention incomplete features?
- Are there test files? How many?
- Is there a deployment/CI setup?

# Output Format

Create a file called `analysis-report.md` with this structure:

```markdown
# Initial Analysis Report

**Date:** [Current Date]
**Directory:** [pwd output]

## Application Metadata

- **Name:** [Application Name]
- **Version:** [Version Number]
- **Description:** [Brief description]
- **Repository:** [Git URL if available]

## Technology Stack

### Primary Language
- [Language] [Version]

### Frameworks & Libraries
- [Framework 1] [Version]
- [Framework 2] [Version]
- [Key libraries...]

### Build System
- [Build tool] [Version]

## Architecture Overview

### Directory Structure
```
[Show key directories and their purpose]
```

### Key Components Identified
- Backend: [Yes/No] - [Details]
- Frontend: [Yes/No] - [Details]
- Database: [Type] - [Details]
- API: [Type] - [Details]
- Infrastructure: [IaC tool if any]

## Existing Documentation

- README.md: [Yes/No] - [Quality: Good/Basic/Poor]
- API Docs: [Yes/No]
- Architecture Docs: [Yes/No]
- Setup/Deployment Docs: [Yes/No]
- Other: [List]

## Completeness Assessment

### Estimated Completion
- Overall: ~[X]%
- Backend: ~[X]%
- Frontend: ~[X]%
- Tests: ~[X]%
- Documentation: ~[X]%

### Evidence
- Placeholder files: [List any TODO/WIP files]
- Incomplete features: [From README or code scan]
- Missing components: [What seems to be missing]

## Source Code Statistics

- Total Files: [Count]
- Lines of Code: ~[Estimate]
- Test Files: [Count]
- Configuration Files: [Count]

## Recommended Next Steps

Based on this analysis, the reverse engineering process should focus on:
1. [Primary area 1]
2. [Primary area 2]
3. [Primary area 3]

## Notes

[Any additional observations or concerns]
```

Save this report to `analysis-report.md` in the project root.
```

---

## ✅ Success Criteria

After running this prompt, you should have:

- [x] `analysis-report.md` file created
- [x] Technology stack clearly identified
- [x] Directory structure understood
- [x] Completeness estimated
- [x] Ready to proceed to Step 2

---

## 🔄 Next Step

Once `analysis-report.md` is created and reviewed, proceed to:

**Step 2: Reverse Engineer** (`02-reverse-engineer.md`)
