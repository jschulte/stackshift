# StackShift Roadmap

Future features and enhancements planned for StackShift.

---

## v1.0 (Current) ✅

**Released:** 2024-01-15

- ✅ 6-gear reverse engineering process
- ✅ Dual workflow (Greenfield/Brownfield)
- ✅ Claude Code plugin (7 skills, 2 agents)
- ✅ MCP server (7 tools, 3 resources)
- ✅ Web orchestrator (browser support)
- ✅ Cruise control (automatic mode)
- ✅ Batch processing tools
- ✅ GitHub Spec Kit integration
- ✅ Comprehensive questionnaire

**Status:** Production-ready, fully documented

---

## v1.1 (Planned) 🚧

### StackSync: Specification Synchronization

**Purpose:** Keep legacy and greenfield apps in sync during platform migrations

**Features:**

1. **Spec Comparison Engine**
   - Compare .specify/ between two repos
   - Identify: matching features, legacy-only, new-only, logic differences
   - Semantic matching (user-auth.md ≈ authentication.md)
   - Timestamp-based change detection

2. **Interactive Sync Mode**
   - For each difference, ask user:
     - Add to new app?
     - Backport to legacy?
     - Keep different (intentional)?
     - Update both to match?

3. **Auto-Sync Modes**
   - Forward: Legacy → New (bug fixes, security updates)
   - Backward: New → Legacy (features worth backporting)
   - Bidirectional: Smart sync based on timestamps
   - Analyze-only: Just show diff, no changes

4. **Sync Configuration**
   - Define sync rules (.stacksync-config.json)
   - Whitelist/blacklist features
   - Default sync direction
   - Auto-sync preferences

5. **Sync History**
   - Track what was synchronized when
   - Audit trail of changes
   - Rollback capability

**Estimated effort:** 2-3 hours

**CLI:**
```bash
# Compare and sync
stackshift sync ~/git/legacy ~/git/new --interactive

# Analyze only
stackshift sync ~/git/legacy ~/git/new --analyze-only

# Auto-sync forward
stackshift sync ~/git/legacy ~/git/new --direction forward --auto
```

**Skill:**
```
"Sync specs between legacy and new app"
→ Guided interactive synchronization
```

**MCP Tool:**
```typescript
stackshift_sync({
  legacy_path: "~/git/legacy",
  new_path: "~/git/new",
  mode: "interactive"
})
```

### Dual-Spec Mode

**Purpose:** Generate both prescriptive and agnostic specs in one run

**Features:**

1. **New Route: "Dual"**
   - Alongside Greenfield and Brownfield
   - Generates both spec types simultaneously

2. **Dual Output:**
   - `.specify/` - Prescriptive (for legacy app)
   - `.specify/agnostic/` - Tech-agnostic (for new app)

3. **Automatic Copying:**
   - Agnostic specs → new repo
   - Both repos spec-driven from start

**Estimated effort:** 1 hour

**Usage:**
```
Route: Dual
Legacy location: . (current)
New location: ~/git/new-app
→ One run, both spec types!
```

---

## v1.2 (Ideas) 💡

### Spec Drift Detection (CI/CD)

**Auto-detect when code drifts from specs:**

```yaml
# .github/workflows/spec-drift.yml
on: [push]
jobs:
  check-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: stackshift validate-alignment
```

**Alert if:**
- Code changed but spec unchanged
- Spec says COMPLETE but implementation missing
- Breaking changes without spec update

### Visual Diff Tool

**Web UI for comparing specs:**

```
stackshift-diff.vercel.app

Upload two .specify/ folders
→ Visual side-by-side comparison
→ Highlight differences
→ Generate sync commands
```

### AI-Powered Business Logic Extraction

**Even smarter extraction:**
- Understand code semantics, not just structure
- Infer business rules from code behavior
- Detect implicit requirements
- Generate more accurate agnostic specs

### Multi-Repo Orchestration

**Manage specs across microservices:**

```bash
stackshift sync-multi \
  --services api-service,web-app,worker \
  --shared-specs ./shared-specs/
```

### Spec Quality Scoring

**Rate spec quality:**
- Completeness (all acceptance criteria defined?)
- Testability (criteria measurable?)
- Clarity (unambiguous?)
- Coverage (all features documented?)

---

## v2.0 (Future Vision) 🔮

### Automatic Code→Spec Updates

**Keep specs in sync automatically:**

```
Code changed → AI detects change → Updates spec → Creates PR
```

### Spec Marketplace

**Share common specifications:**
- User authentication spec (industry standard)
- Payment processing spec (Stripe/PayPal agnostic)
- File upload spec
- etc.

### Framework Converters

**Auto-convert between stacks:**

```bash
stackshift convert \
  --from rails \
  --to nextjs \
  --spec user-authentication.md
```

Generates implementation in target framework from agnostic spec!

### Team Collaboration Features

- **Spec review workflow**
- **Spec commenting**
- **Spec approval process**
- **Spec versioning**

---

## Community Requests

Track feature requests from users:

- [ ] VSCode extension (native UI)
- [ ] GitHub Action for automatic spec generation
- [ ] Spec linting (catch common mistakes)
- [ ] Spec templates marketplace
- [ ] Integration with Linear/Jira (sync specs ↔ tickets)

---

## Contributing

Want to help build these features?

1. **Pick a feature** from roadmap
2. **Open an issue** to discuss approach
3. **Submit PR** with implementation
4. **Get your feature into StackShift!**

---

## Priority

**v1.1 features prioritized by:**
1. User demand (what users ask for)
2. Migration value (helps platform migrations)
3. Implementation complexity (easier features first)

**Current priority: StackSync + Dual-Spec Mode**
- Addresses real enterprise migration needs
- High value, moderate complexity
- Requested by users

---

**Want to influence the roadmap?**

💡 [Start a discussion](https://github.com/jschulte/stackshift/discussions)
🐛 [Request a feature](https://github.com/jschulte/stackshift/issues/new)

---

**StackShift is actively developed and community-driven!** 🚗💨
