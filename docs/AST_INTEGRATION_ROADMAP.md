# AST Integration Roadmap

## Current Status

**✅ Completed**: AST CLI wrapper created and gap-analysis skill updated

**🔄 Next Steps**: Integrate AST into other gears

---

## How Skills Work

**Important Understanding**:
- Skills are **instruction files** (markdown), not executable code
- When you run `/stackshift.gap-analysis`, it tells Claude: "Read gap-analysis skill and follow instructions"
- Claude then **decides** what to do based on the instructions
- For AST to run **automatically**, the skill must **explicitly tell Claude to run the command**

### Before (Doesn't Work)
```markdown
### Optional: You can run AST analysis

```bash
~/stackshift/scripts/run-ast-analysis.mjs roadmap
```
```

❌ Claude sees this as "nice to know" and might skip it

### After (Works!)
```markdown
### Step 2a: Run AST-Powered Analysis (PRIMARY METHOD - RUN THIS!)

**ACTION REQUIRED**: Execute the AST analysis command now:

```bash
~/stackshift/scripts/run-ast-analysis.mjs roadmap . --format=markdown
```

**If this command fails**, proceed to Step 2b. **Otherwise**, use output and skip remaining steps.
```

✅ Claude knows to actually execute this command

---

## Integration Plan by Gear

### ✅ Gear 4: Gap Analysis (DONE)

**Status**: Updated with AST as primary method

**What it does**:
- Step 2a: Run AST analysis (PRIMARY - explicit "RUN THIS!")
- Step 2b: Fallback to /speckit.analyze
- Step 2c: Manual analysis (last resort)

**Automatic?** Yes - skill explicitly tells Claude to run the command

---

### 🔄 Gear 3: Create Specs (TODO)

**Current**: Uses MCP tool `stackshift_create_specs`

**Enhancement Opportunity**:
Use AST to **auto-detect implementation status** when creating specs:

```bash
# During spec creation, run AST to detect status
~/stackshift/scripts/run-ast-analysis.mjs detect-status . --output=json

# Returns for each feature:
{
  "user-authentication": {
    "status": "partial",  # ✅/⚠️/❌
    "confidence": 75,
    "evidence": {
      "functions_found": ["login", "logout"],
      "functions_missing": ["register", "resetPassword"],
      "stubs_detected": ["resetPassword"]
    }
  }
}
```

**Action Required**:
1. Create new command: `detect-status`
2. Update create-specs skill to call it
3. Auto-populate spec status from AST results

**Priority**: High (makes specs accurate from day one)

---

### 🔄 Gear 6: Implementation (TODO)

**Current**: Manual verification after implementation

**Enhancement Opportunity**:
Use AST to **verify implementation matches specs**:

```bash
# After implementing a feature, verify it
~/stackshift/scripts/run-ast-analysis.mjs verify . \
  --spec=.specify/specs/001-user-auth/spec.md \
  --output=markdown

# Returns:
✅ Function exists: createUser
✅ Signature matches: (name: string, email: string) => Promise<User>
✅ Has error handling: try/catch block found
❌ Missing tests: No test file for createUser
⚠️  Stub detected: Function body returns placeholder
```

**Action Required**:
1. Create new command: `verify`
2. Update implement skill to call it after each feature
3. Block completion if verification fails

**Priority**: Medium (quality gate for implementations)

---

### 🔄 Gear 2: Reverse Engineering (TODO)

**Current**: Manual code reading to extract documentation

**Enhancement Opportunity**:
Use AST to **automatically extract** from codebase:

```bash
# Extract API endpoints, business logic, etc.
~/stackshift/scripts/run-ast-analysis.mjs extract . --output=markdown

# Auto-generates docs/reverse-engineering/* files from AST:
- api-endpoints.md (from route definitions)
- business-logic.md (from validation patterns)
- data-models.md (from class definitions)
- integration-points.md (from import analysis)
```

**Action Required**:
1. Create new commands: `extract-apis`, `extract-logic`, `extract-models`
2. Update reverse-engineer skill to call them
3. Auto-generate docs instead of manual extraction

**Priority**: Low (high value but complex to implement)

---

### 🔄 Gear 1: Analysis (TODO)

**Current**: File-based tech stack detection

**Enhancement Opportunity**:
Use AST to **detect actual usage patterns**:

```bash
# Analyze actual code patterns
~/stackshift/scripts/run-ast-analysis.mjs analyze-stack . --output=json

# Returns:
{
  "frameworks": ["express", "react"],  # From imports
  "patterns": ["jwt-auth", "rest-api"],  # From code analysis
  "apis": {
    "rest": 23,      # Count of REST endpoints
    "graphql": 0,
    "websocket": 5
  }
}
```

**Action Required**:
1. Create new command: `analyze-stack`
2. Update analyze skill to call it
3. More accurate tech stack detection

**Priority**: Low (nice-to-have)

---

### 🔄 Gear 5: Complete Specs (TODO)

**Current**: Manual clarification questions

**Enhancement Opportunity**:
Use AST to **provide evidence** for clarifications:

```bash
# Find contradictions/ambiguities
~/stackshift/scripts/run-ast-analysis.mjs find-issues . \
  --spec=.specify/specs/001-user-auth/spec.md

# Returns:
⚠️  Contradiction found:
  Spec says: "JWT tokens expire in 1 hour"
  Code shows: expiresIn: '24h' (src/auth/jwt.ts:42)

  Question: Should tokens expire in 1h or 24h?
```

**Action Required**:
1. Create new command: `find-issues`
2. Update complete-spec skill to call it
3. Generate evidence-based clarifications

**Priority**: Medium (improves clarification quality)

---

## Summary: What Needs to Happen

### Immediate (Make Current Integration Automatic)

✅ **Gear 4**: Already done - skill explicitly runs AST command

### Short-term (High Value Additions)

1. **Gear 3**: Add `detect-status` command
   - Update create-specs skill to run it
   - Auto-set implementation status

2. **Gear 6**: Add `verify` command
   - Update implement skill to run it
   - Quality gate before completion

### Long-term (Nice-to-Have)

3. **Gear 2**: Add `extract-*` commands
   - Auto-generate reverse engineering docs

4. **Gear 5**: Add `find-issues` command
   - Evidence-based clarifications

5. **Gear 1**: Add `analyze-stack` command
   - Better tech detection

---

## Implementation Strategy

### Phase 1: Make It Work (Current)
- ✅ Create CLI wrapper
- ✅ Update Gear 4 to use it explicitly
- ✅ Document approach

### Phase 2: Add New Commands (Next)
Each new AST command follows this pattern:

```javascript
// scripts/run-ast-analysis.mjs
case 'detect-status':
  const result = await detectStatusHandler({ directory });
  console.log(JSON.stringify(result, null, 2));
  break;

case 'verify':
  const result = await verifyImplementationHandler({
    directory,
    specPath: options.spec
  });
  console.log(result);
  break;
```

### Phase 3: Update Skills (Per Command)
```markdown
# skills/create-specs/SKILL.md

## Step 3: Detect Implementation Status (AUTOMATIC)

**Run AST status detection**:

```bash
~/stackshift/scripts/run-ast-analysis.mjs detect-status . --output=json
```

This auto-populates spec status fields (✅/⚠️/❌) based on actual code analysis.
```

### Phase 4: Test & Iterate
- Test each integration
- Gather user feedback
- Refine based on usage

---

## Answer to "Will It Be Automatic?"

### For Gear 4 (Gap Analysis): YES ✅

**The skill now explicitly tells Claude**:
- "ACTION REQUIRED: Execute the AST analysis command now"
- "RUN THIS!" in the heading
- "If this fails, use fallback. Otherwise skip other steps."

When you run `/stackshift.gap-analysis`, Claude will:
1. Read skill file
2. See "ACTION REQUIRED" and "RUN THIS!"
3. Execute: `~/stackshift/scripts/run-ast-analysis.mjs roadmap`
4. Use the AST output

### For Other Gears: NOT YET ❌

They need similar updates:
- Create new AST commands for each use case
- Update skill files with explicit "RUN THIS!" instructions
- Test that Claude actually executes them

---

## How to Enable for Each Gear

**Pattern**:
1. ✅ Create AST command (in `run-ast-analysis.mjs`)
2. ✅ Add handler function (import from mcp-server/dist)
3. ✅ Update skill file with **explicit execution instruction**
4. ✅ Use language like "ACTION REQUIRED", "RUN THIS!", "Execute now"
5. ✅ Provide fallback if command fails

**Example Template**:
```markdown
## Step X: [Task Name] (PRIMARY METHOD - RUN THIS!)

**ACTION REQUIRED**: Execute the AST command now:

```bash
~/stackshift/scripts/run-ast-analysis.mjs [command] . [options]
```

**What this provides**: [benefits]

**If this command fails**: [fallback steps]

**Otherwise**: Use the output and proceed to [next step]
```

---

## Tracking Progress

- [x] Gear 4: Gap Analysis (AST automatic)
- [ ] Gear 3: Create Specs (add `detect-status`)
- [ ] Gear 6: Implementation (add `verify`)
- [ ] Gear 5: Complete Specs (add `find-issues`)
- [ ] Gear 2: Reverse Engineering (add `extract-*`)
- [ ] Gear 1: Analysis (add `analyze-stack`)

---

## Key Insight

**Skills don't run code automatically** - they tell Claude what to do.

For AST to run automatically, the skill must:
1. ✅ Use directive language ("RUN THIS NOW!")
2. ✅ Put it early in the workflow (Step 2a, not "optional")
3. ✅ Make it primary method with fallbacks
4. ✅ Tell Claude to skip other steps if it succeeds

**Current Gear 4** does all of this! ✅

**Other gears** need the same pattern applied. 🔄
