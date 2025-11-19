---
description: Start StackShift reverse engineering process - analyzes codebase, auto-detects widget type, and guides through 6-gear transformation to spec-driven development. Supports Greenfield, Brownfield, Osiris, Osiris-module, CMS-v9, and CMS-viewmodel routes.
---

# StackShift: Reverse Engineering Toolkit

**Start the 6-gear reverse engineering process**

Transform your application into a fully-specified, spec-driven codebase.

---

## Auto-Detection

StackShift will automatically detect your widget/module type:

- **ws-*** → Osiris Widget Service (widget + ws-scripts + modules)
- **wsm-***, **ddc-*** → Osiris Shared Module (module logic only)
- **widget.vm in v9/widgets/** → CMS-web V9 Velocity Widget
- **v9/viewmodel/widgets/** → CMS-web V9 Viewmodel Widget
- **Other** → Generic application (user chooses Greenfield or Brownfield)

---

## Quick Start

**Just run the analyze skill to begin:**

```
I want to reverse engineer this application.
```

Or be specific:

```
Analyze this codebase for Greenfield migration to Next.js.
```

---

## The 6-Gear Process

Once analysis starts, you'll shift through these gears:

### 🔍 Gear 1: Analyze
- Auto-detect widget/module type
- Detect tech stack and architecture
- Assess completeness
- Choose route (or auto-selected)
- Configure workflow options

### 🔄 Gear 2: Reverse Engineer
- Extract comprehensive documentation (8-9 files)
- Business logic extraction
- For Osiris: Include ws-scripts + modules
- For CMS-v9: Trace component nesting + helper objects
- For Greenfield: Tech-agnostic requirements
- For Brownfield: Tech-prescriptive implementation

### 📋 Gear 3: Create Specifications
- Initialize GitHub Spec Kit (`.specify/`)
- Create Constitution (project principles)
- Generate feature specifications
- Create implementation plans
- Install `/speckit.*` slash commands

### 🔎 Gear 4: Gap Analysis
- **Greenfield/Osiris:** Validate spec completeness, ask about target stack
- **Brownfield:** Run `/speckit.analyze`, find implementation gaps
- Identify clarification needs
- Prioritize features (P0/P1/P2/P3)
- Create implementation roadmap

### ✨ Gear 5: Complete Specification
- Resolve `[NEEDS CLARIFICATION]` markers
- Interactive Q&A session
- Use `/speckit.clarify` for structured clarification
- Finalize all specifications
- Ensure no ambiguities remain

### 🚀 Gear 6: Implement
- **Greenfield:** Build NEW app in chosen tech stack
- **Brownfield:** Fill gaps in existing implementation
- Use `/speckit.tasks` for task breakdown
- Use `/speckit.implement` for execution
- Validate with `/speckit.analyze`

---

## Routes Available

| Route | Auto-Detect | Purpose |
|-------|-------------|---------|
| **greenfield** | Generic app | Extract business logic, rebuild in new stack |
| **brownfield** | Generic app | Spec existing codebase, manage with Spec Kit |
| **osiris** | ws-* repos | Extract widget + ws-scripts + wsm-* modules |
| **osiris-module** | wsm-*, ddc-* | Extract shared module business logic |
| **cms-v9** | v9/widgets/ + widget.vm | Extract V9 Velocity widget (5-7 level nesting) |
| **cms-viewmodel** | v9/viewmodel/widgets/ | Extract V9 Viewmodel widget (Groovy) |

---

## Workflow Options

**Manual Mode:**
- Review each gear before proceeding
- You control the pace
- Good for first-time users

**Cruise Control:**
- Shift through all gears automatically
- Hands-free execution
- Good for experienced users or overnight runs
- Configure: clarifications strategy, implementation scope

---

## Additional Commands

After completing Gears 1-6:

- **`/stackshift.modernize`** - Brownfield Upgrade Mode (dependency modernization)
- **`/speckit.*`** - GitHub Spec Kit commands (auto-installed in Gear 3)

---

## Prerequisites

- Git repository with code to analyze
- Claude Code with plugin support
- ~2-4 hours for complete process (or use Cruise Control)

---

## Examples

**Osiris widget migration:**
```
I want to reverse engineer ws-vehicle-details for migration to Next.js.
```

**Legacy app spec creation:**
```
Analyze this Java Spring app and create specifications for ongoing management.
```

**CMS-web V9 widget extraction:**
```
Analyze this V9 Velocity widget and extract the business logic.
```

---

## Starting Now

**I'm now going to analyze this codebase and begin the StackShift process!**

Here's what I'll do:

1. ✅ Auto-detect widget/module type (Osiris, CMS-v9, generic, etc.)
2. ✅ Detect tech stack and architecture
3. ✅ Assess completeness
4. ✅ Determine or ask for route
5. ✅ Set up workflow configuration
6. ✅ Begin Gear 1: Analyze

Let me start by analyzing this codebase... 🚗💨

---

**Now beginning StackShift Gear 1: Analyze...**
