# Step 3: Create Specifications

**Estimated Time:** 30 minutes
**Output:** Formal specifications in `specs/` directory with implementation status

---

## 📋 Copy and Paste This Prompt

```
Transform the reverse-engineering documentation from Step 2 into formal, GitHub Spec Kit-compatible specifications.

Use the documents in `docs/reverse-engineering/` as your source material.

---

## Phase 1: Set Up Spec Kit Structure

Create the following directory structure:

```bash
mkdir -p specs/{features,api,data/schemas,contracts}
mkdir -p .speckit/templates
```

---

## Phase 2: Create Constitution

Create `.speckit/constitution.md` documenting project principles.

Extract principles from the codebase such as:
- Technology choices (e.g., "Use TypeScript for type safety")
- Architecture patterns (e.g., "Serverless-first")
- Security standards (e.g., "Never store passwords in plain text")
- Code quality (e.g., "> 70% test coverage required")
- User experience (e.g., "Mobile-first responsive design")

**Template:**
```markdown
# Project Constitution

## Core Principles

### 1. [Principle Category]
**Principle:** [Specific principle]
**Rationale:** [Why this matters]
**Examples:**
- ✅ DO: [Good example]
- ❌ DON'T: [Bad example]

[Repeat for all principles found in codebase]

## Non-Negotiables

1. [Critical requirement that cannot be violated]
2. [Another critical requirement]

## Decision Framework

When making technical decisions:
1. [First consideration]
2. [Second consideration]
3. [Third consideration]
```

---

## Phase 3: Create Feature Specifications

For each major feature in `docs/reverse-engineering/functional-specification.md`, create a feature spec.

### Naming Convention
- F001-[feature-name].md
- F002-[feature-name].md
- etc.

### Feature Spec Template

Use this template for each feature (also save to `.speckit/templates/feature-template.md`):

```markdown
# Feature: [Feature Name]

**Feature ID:** F0XX
**Status:** [✅ COMPLETE | ⚠️ PARTIAL | ❌ NOT IMPLEMENTED]
**Priority:** [P0 - Critical | P1 - High | P2 - Medium | P3 - Low]
**Backend:** [✅ Complete | ⚠️ Partial | ❌ Missing] ([X]%)
**Frontend:** [✅ Complete | ⚠️ Partial | ❌ Missing] ([X]%)

## User Story

As a [user type],
I want [capability],
So that [benefit].

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Implementation Status

### ✅ IMPLEMENTED

**Backend:**
- [x] [Specific backend item completed]
- [x] [Another backend item]

**Frontend:**
- [x] [Specific frontend item completed]
- [x] [Another frontend item]

**Tests:**
- [x] [Test coverage item]

### ❌ NOT IMPLEMENTED

**Backend:**
- [ ] [Missing backend functionality]

**Frontend:**
- [ ] [Missing UI component]
- [ ] [Missing page]

**Tests:**
- [ ] [Missing test coverage]

### [NEEDS CLARIFICATION]

- [?] [Ambiguous requirement that needs user input]
- [?] [Another unclear aspect]

## Technical Details

### Data Models
[Reference data models from data-architecture.md]

### API Endpoints
- `POST /path` - [Description]
- `GET /path` - [Description]

### UI Components
- [Component name] - [Purpose and location]

### Business Rules
1. [Rule 1]
2. [Rule 2]

## Dependencies

- Depends on: [F0XX - Other Feature]
- Depended on by: [F0XX - Other Feature]

## Testing Requirements

- Unit tests: [What needs to be tested]
- Integration tests: [What needs to be tested]
- E2E tests: [User workflow to test]

## Notes

[Any additional context or decisions]
```

### Create Feature Specs

Analyze `docs/reverse-engineering/functional-specification.md` and create feature specs for:

**Common Features (adapt based on your app):**
- F001: User Authentication & Authorization
- F002: [Core Feature 1]
- F003: [Core Feature 2]
- F004: [Advanced Feature 1]
- F005: [Advanced Feature 2]
- etc.

**For each feature:**
1. Determine status: ✅ COMPLETE, ⚠️ PARTIAL, or ❌ NOT IMPLEMENTED
2. Based on code analysis from Step 2
3. Mark backend vs. frontend completion separately
4. Add `[NEEDS CLARIFICATION]` for ambiguities

---

## Phase 4: Create OpenAPI Specification

If the application has an API, create `specs/api/openapi.yaml`.

Extract from `docs/reverse-engineering/data-architecture.md`.

**Template:**
```yaml
openapi: 3.1.0
info:
  title: [Application Name] API
  version: [Version from package.json]
  description: [Description]

servers:
  - url: [API URL]
    description: [Environment]

paths:
  /[endpoint]:
    [method]:
      summary: [Brief description]
      operationId: [operationId]
      tags: [category]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/[SchemaName]'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/[ResponseSchema]'
        '400':
          description: Bad Request
        '401':
          description: Unauthorized

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    [SchemaName]:
      type: object
      required: [field1, field2]
      properties:
        field1:
          type: string
          description: [Description]
        field2:
          type: number
          minimum: 0
```

Document **every endpoint** from the API analysis.

---

## Phase 5: Create JSON Schemas

For each data model in `docs/reverse-engineering/data-architecture.md`, create a JSON Schema file in `specs/data/schemas/`.

**Example:** `specs/data/schemas/user.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://[your-domain]/schemas/user.json",
  "title": "User",
  "type": "object",
  "required": ["userId", "email", "name"],
  "properties": {
    "userId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User email address"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    }
  }
}
```

---

## Phase 6: Create Implementation Status Document

Create `specs/implementation-status.md` summarizing overall progress.

**Template:**
```markdown
# Implementation Status

**Last Updated:** [Date]
**Overall Completion:** [X]%

## Summary by Priority

### P0 - Critical Features
| Feature | Status | Backend | Frontend | Notes |
|---------|--------|---------|----------|-------|
| F001 - [Name] | ✅ COMPLETE | 100% | 100% | Production ready |
| F002 - [Name] | ⚠️ PARTIAL | 100% | 40% | UI incomplete |

### P1 - High Priority Features
| Feature | Status | Backend | Frontend | Notes |
|---------|--------|---------|----------|-------|
| F00X - [Name] | ❌ MISSING | 0% | 0% | Not started |

### P2 - Medium Priority Features
[Same format]

### P3 - Low Priority Features
[Same format]

## Completion Statistics

- Total Features: [X]
- Complete: [X] ([X]%)
- Partial: [X] ([X]%)
- Not Implemented: [X] ([X]%)

## Backend Status

- Complete Features: [X]/[Total]
- Partial Features: [X]/[Total]
- Missing Features: [X]/[Total]
- Overall: [X]%

## Frontend Status

- Complete Features: [X]/[Total]
- Partial Features: [X]/[Total]
- Missing Features: [X]/[Total]
- Overall: [X]%

## Test Coverage

- Backend: [X]%
- Frontend: [X]%
- E2E: [X]%

## Next Steps

Priority order for completion:
1. [Feature to implement first]
2. [Feature to implement second]
3. [Feature to implement third]
```

---

## Phase 7: Create Package Scripts

Add scripts to `package.json` for spec validation and code generation:

```json
{
  "scripts": {
    "spec:validate": "swagger-cli validate specs/api/openapi.yaml",
    "spec:lint": "spectral lint specs/api/openapi.yaml",
    "spec:generate-types": "openapi-typescript specs/api/openapi.yaml -o src/types/api.ts",
    "spec:docs": "redoc-cli bundle specs/api/openapi.yaml -o docs/api-docs.html"
  },
  "devDependencies": {
    "@apidevtools/swagger-cli": "^4.0.4",
    "@stoplight/spectral-cli": "^6.11.0",
    "openapi-typescript": "^6.7.3",
    "redoc-cli": "^0.13.21"
  }
}
```

---

## Commit the Specifications

```bash
git add specs/ .speckit/
git commit -m "feat: add formal specifications with implementation status

Created GitHub Spec Kit structure with:
- Constitution documenting project principles
- [X] feature specifications (F001-F0XX)
- OpenAPI 3.1 specification for API
- JSON Schemas for all data models
- Implementation status tracking

Status: [X]% complete ([X] of [X] features)
- Backend: [X]% complete
- Frontend: [X]% complete

Ready for gap analysis and completion."
git push
```

---

## Success Criteria

After running this prompt:
- [x] `.speckit/constitution.md` created
- [x] Feature specs created (F001-F0XX)
- [x] Each spec has clear implementation status
- [x] `specs/api/openapi.yaml` created (if applicable)
- [x] JSON Schemas for data models created
- [x] `specs/implementation-status.md` created
- [x] Package scripts added
- [x] All committed to git
- [x] Ready to proceed to Step 4
```

---

## 🔄 Next Step

Once specifications are created and committed, proceed to:

**Step 4: Gap Analysis** (`04-gap-analysis.md`)
