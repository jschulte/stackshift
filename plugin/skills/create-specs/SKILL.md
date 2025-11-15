---
name: create-specs
description: Transform reverse-engineering documentation into formal GitHub Spec Kit specifications. Creates feature specs (F001-F0XX), marks implementation status (COMPLETE/PARTIAL/MISSING), generates OpenAPI specs, JSON Schemas, and sets up spec-driven development structure. This is Step 3 of 6 in the reverse engineering process.
---

# Create Specifications

**Step 3 of 6** in the Reverse Engineering to Spec-Driven Development process.

**Estimated Time:** 30 minutes
**Prerequisites:** Step 2 completed (`docs/reverse-engineering/` exists with 8 files)
**Output:** `specs/` directory with GitHub Spec Kit structure

---

## When to Use This Skill

Use this skill when:
- You've completed Step 2 (Reverse Engineer)
- Have comprehensive documentation in `docs/reverse-engineering/`
- Ready to create formal specifications
- Want to establish spec-driven development

**Trigger Phrases:**
- "Create specifications from documentation"
- "Transform docs into formal specs"
- "Set up GitHub Spec Kit"
- "Generate feature specs"

---

## What This Skill Does

Transforms reverse-engineering documentation into **formal specifications**:

1. **Feature Specs** - F001-F0XX format with implementation status
2. **OpenAPI Specification** - Complete API documentation
3. **JSON Schemas** - Data model validation schemas
4. **Implementation Status** - Gap summary and completion tracking
5. **Constitution** - Project principles and technical decisions

---

## Process Overview

### Step 1: Create Spec Directory Structure

```
specs/
├── features/           # Feature specifications
├── api/               # OpenAPI specifications
├── data/              # JSON Schemas
├── constitution.md    # Project principles
└── implementation-status.md
```

### Step 2: Generate Feature Specs

From `functional-specification.md`, create feature specs:

- **F001-F0XX** - One spec per major feature
- **Status markers:**
  - ✅ **COMPLETE** - Fully implemented and tested
  - ⚠️ **PARTIAL** - Partially implemented
  - ❌ **MISSING** - Not started

Each spec includes:
- Overview and purpose
- Acceptance criteria
- Implementation status
- API endpoints (if applicable)
- Data models (if applicable)
- UI components (if applicable)
- Test requirements

See [operations/feature-spec-generation.md](operations/feature-spec-generation.md)

### Step 3: Generate OpenAPI Specification

From `data-architecture.md`, create:
- Complete OpenAPI 3.0 spec
- All endpoints documented
- Request/response schemas
- Authentication methods
- Error responses

See [operations/openapi-generation.md](operations/openapi-generation.md)

### Step 4: Generate JSON Schemas

From data models in `data-architecture.md`:
- JSON Schema for each data model
- Validation rules
- Type definitions
- Relationships

See [operations/json-schema-generation.md](operations/json-schema-generation.md)

### Step 5: Create Implementation Status Document

Summary of:
- Overall completion percentage
- Feature-by-feature status
- Gap categories (Missing, Partial, Complete)
- Prioritized implementation plan

### Step 6: Create Constitution

From `functional-specification.md` and analysis:
- Project purpose and values
- Technical decisions and rationale
- Architecture principles
- Development standards

---

## Output Structure

### specs/features/

Example feature specs:
```
F001-user-authentication.md     ✅ COMPLETE
F002-fish-management.md         ⚠️ PARTIAL
F003-analytics-dashboard.md     ❌ MISSING
F004-photo-upload.md           ⚠️ PARTIAL
F005-social-features.md        ❌ MISSING
```

### specs/api/openapi.yaml

Complete OpenAPI 3.0 specification with all endpoints.

### specs/data/schemas/

JSON Schema for each model:
```
user.schema.json
fish.schema.json
tank.schema.json
reading.schema.json
```

### specs/implementation-status.md

Gap summary and roadmap:
```markdown
# Implementation Status

## Overall: ~66% Complete

### ✅ Complete Features (3)
- F001: User Authentication
- ...

### ⚠️ Partial Features (4)
- F002: Fish Management (backend done, UI missing profile page)
- ...

### ❌ Missing Features (2)
- F003: Analytics Dashboard
- ...
```

### specs/constitution.md

Project principles and decisions:
```markdown
# Project Constitution

## Purpose
[Why this project exists]

## Technical Decisions
- Architecture: Serverless (AWS Lambda)
- Database: PostgreSQL (scalability, ACID compliance)
- ...
```

---

## Success Criteria

After running this skill, you should have:

- ✅ `specs/` directory with GitHub Spec Kit structure
- ✅ Feature specs (F001-F0XX) with status markers
- ✅ OpenAPI specification for all APIs
- ✅ JSON Schemas for all data models
- ✅ Implementation status document
- ✅ Constitution document
- ✅ Ready to proceed to Step 4 (Gap Analysis)

---

## Next Step

Once specifications are created and reviewed, proceed to:

**Step 4: Gap Analysis** - Use the `gap-analysis` skill to identify missing and incomplete features.

---

## Technical Notes

- Use templates from `plugin/templates/` for consistent formatting
- Cross-reference with actual code to mark implementation status accurately
- OpenAPI spec should be valid (test with Swagger UI or Redoc)
- JSON Schemas should validate against actual data

---

**Remember:** This is Step 3 of 6. After creating specs, you'll analyze gaps, complete ambiguities, and implement missing features.
