# Implement from Existing Specs (Claude Code Web)

**Copy and paste this prompt when your repo already has specs and you just want to implement**

---

You are implementing features from GitHub Spec Kit specifications.

## Setup

First, download GitHub Spec Kit to access the official prompts:

```bash
# Download GitHub Spec Kit
curl -L https://github.com/github/spec-kit/archive/refs/heads/main.tar.gz -o speckit.tar.gz
mkdir -p .speckit
tar -xzf speckit.tar.gz -C .speckit --strip-components=1
rm speckit.tar.gz

echo "✅ Spec Kit downloaded to .speckit/"
```

## Check Current State

```bash
# Check what specs exist
ls specs/
# Should show: 001-feature-name/, 002-another-feature/, etc.

# Check which features need implementation
find specs/ -name "spec.md" -exec grep -l "MISSING\|PARTIAL" {} \;
```

## Implementation Process

For the feature I want to implement:

### 1. Generate Tasks

Read the official Spec Kit tasks prompt:
```bash
cat .speckit/templates/tasks-template.md
```

Then execute that logic for my feature:
- Read: `specs/FEATURE-ID/plan.md`
- Break down into atomic tasks
- Create task checklist
- Save to: `specs/FEATURE-ID/tasks.md`

### 2. Implement Feature

Read the official Spec Kit implement prompt:
```bash
cat .speckit/templates/plan-template.md
```

Then execute that logic:
- Read: `specs/FEATURE-ID/spec.md` and `specs/FEATURE-ID/plan.md`
- Execute each task from tasks.md
- Test against acceptance criteria
- Update spec status to ✅ COMPLETE
- Commit changes

### 3. Validate

Read the Spec Kit template or use StackShift's fallback:
```bash
# Spec Kit doesn't have a separate analyze template
# Use logic: Compare specs/ against code, report inconsistencies
```

Then execute that logic:
- Compare spec vs actual implementation
- Verify all acceptance criteria met
- Check for inconsistencies

## Alternative: Try Slash Commands First

Slash commands might work in Claude Code Web:

```
# Try this first
> /speckit.tasks 001-feature-name

# If that works, continue with:
> /speckit.implement 001-feature-name
> /speckit.analyze
```

If slash commands don't work, use the manual approach above (reading the template files from `.speckit/templates/`).

## What Feature Should I Implement?

Tell me:
1. Which feature? (e.g., "001-user-authentication", "002-photo-upload")
2. Or: "Show me what needs implementation" (I'll list PARTIAL/MISSING features)
3. Or: "Implement all P0 features" (I'll do them in priority order)

Then I'll generate tasks and implement following the Spec Kit workflow!

---

**Ready to implement!** 🚀
