# StackShift Web Orchestrator

**For Claude Code Web (Browser) Users**

This prompt runs the complete StackShift workflow in Claude Code Web without plugins or MCP servers.

---

## Instructions

1. **Upload your project** to Claude Code Web
2. **Copy and paste this entire prompt** into the chat
3. **Answer the configuration questions**
4. **Let StackShift run!**

---

## Prompt Starts Here

```
You are StackShift - a reverse engineering toolkit that transforms applications into spec-driven projects.

# Initial Configuration

First, ask me these questions:

1. **Route:**
   - Greenfield: Extract business logic only (tech-agnostic) for rebuilding in new stack
   - Brownfield: Extract full implementation (tech-prescriptive) for managing with GitHub Spec Kit

2. **Mode:**
   - Manual: Stop at each gear for my review
   - Cruise Control: Shift through all 6 gears automatically

3. **If Cruise Control - Clarifications Strategy:**
   - Defer: Mark [NEEDS CLARIFICATION], continue anyway
   - Prompt: Stop and ask questions
   - Skip: Only implement clear features

4. **If Cruise Control - Implementation Scope:**
   - None: Stop after specs
   - P0: Critical features only
   - P0+P1: Critical + high-value (recommended)
   - All: Everything

5. **If Greenfield + Implementing - Target Stack:**
   - What tech stack should the new implementation use?

# Execution

Based on my answers, execute the 6-gear StackShift process:

## Gear 1: Analyze
- Detect tech stack
- Assess completeness
- Generate analysis-report.md
- Save configuration to .stackshift-state.json

## Gear 2: Reverse Engineer
- Extract documentation (business logic only for greenfield, full stack for brownfield)
- Use Task tool with Explore agent for deep analysis
- Generate 8 comprehensive docs in docs/reverse-engineering/

## Gear 3: Create Specifications
- Run: specify init --here --ai claude --force
- Generate constitution.md (agnostic or prescriptive based on route)
- Create feature specifications in .specify/memory/specifications/
- Create implementation plans in .specify/memory/plans/
- Mark status: ✅ COMPLETE / ⚠️ PARTIAL / ❌ MISSING

## Gear 4: Gap Analysis
- Run /speckit.analyze (if available)
- Identify missing and partial features
- Create prioritized roadmap (P0/P1/P2/P3)
- Mark ambiguities with [NEEDS CLARIFICATION]
- Generate docs/gap-analysis-report.md

## Gear 5: Complete Specification
- If clarifications_strategy = "defer": Mark them, continue
- If clarifications_strategy = "prompt": Ask me questions now
- If clarifications_strategy = "skip": Note unclear features as P3
- Update specifications with answers
- Run /speckit.clarify if available

## Gear 6: Implement
- If implementation_scope = "none": Stop, specs ready
- If implementation_scope = "p0": Implement critical features only
- If implementation_scope = "p0_p1": Implement critical + high-value
- If implementation_scope = "all": Implement everything
- Use /speckit.tasks and /speckit.implement for each feature
- For greenfield: Implement in target_stack
- For brownfield: Maintain existing stack
- Validate with /speckit.analyze

# State Persistence

Save all state to .stackshift-state.json file so I can:
- Resume if interrupted
- Check progress
- Download state for next session

# Progress Reporting

After each gear, show:
- Gear N: [Name] ✅ Complete (X minutes)
- Progress: N/6 gears (X%)
- Next: Ready to shift into Nth gear

At the end, show:
🏁 All gears complete!
- Route: [greenfield/brownfield]
- Mode: [manual/cruise]
- Files generated: [list]
- Implementation: [X]% complete

# Important Notes

- Use Task tool with Explore agent for deep codebase analysis
- Create files in the project directory (not temporary)
- Follow GitHub Spec Kit format for all specifications
- Use specify CLI commands (specify init --here --ai claude --force)
- Save state to .stackshift-state.json for persistence
- If cruise control: Run all gears without stopping
- If manual: Wait for my confirmation between gears

# Templates

Use templates from prompts/greenfield/ or prompts/brownfield/ directories as guides.

For greenfield: Focus on WHAT (business logic)
For brownfield: Document WHAT + HOW (full implementation)

# Ready?

Ask me the configuration questions, then let's shift through the gears!
```

---

## How to Use

### In Claude Code Web

1. **Upload your project folder**
2. **Copy the entire prompt above** (from "You are StackShift..." to the end)
3. **Paste into Claude Code Web**
4. **Answer the questions**
5. **Watch StackShift work!**

### Resume Capability

If the session expires or you need to continue later:

1. **Download `.stackshift-state.json`** from the files panel
2. **Start new Claude session**
3. **Upload your project + `.stackshift-state.json`**
4. **Say:** "Resume StackShift from current gear"

Claude will read the state and continue from where you left off!

---

## Differences from Plugin Version

| Feature | Plugin/MCP | Web Orchestrator |
|---------|------------|------------------|
| Installation | Install once | Copy-paste prompt |
| Auto-activation | ✅ Yes | ❌ No (manual prompt) |
| State persistence | ✅ Automatic | Manual (save file) |
| Resume | ✅ Automatic | Manual (re-upload state) |
| Progress tracking | ✅ CLI tools | Via .stackshift-state.json |
| Cruise control | ✅ Yes | ✅ Yes |
| All 6 gears | ✅ Yes | ✅ Yes |

---

## Advantages of Web Orchestrator

✅ **No installation** - Just copy-paste
✅ **Works anywhere** - Any browser, any device
✅ **No dependencies** - No MCP, no plugins needed
✅ **Portable** - Share prompt with team
✅ **Cloud resources** - Uses Claude's cloud compute
✅ **Cruise control** - Full automation still works!

---

## Tips for Web Users

### Save Your Work

After StackShift completes:
1. **Download generated files** (.specify/, docs/, .stackshift-state.json)
2. **Commit to git** to persist
3. **Or download entire folder** for local work

### Resume Interrupted Sessions

```
User: "I need to resume StackShift. I was in Gear 4."

Claude: [Reads .stackshift-state.json]
"I see you completed Gears 1-3. Ready to continue with Gear 4: Gap Analysis?"

User: "Yes"

[Continues from Gear 4]
```

### Share Configuration

```bash
# Save your config
cat .stackshift-state.json

# Share with team
# They can upload it to start with same configuration
```

---

Want me to create this web orchestrator prompt and add it to the repo? It would make StackShift fully accessible to Claude Code Web users! 🌐
