# Step 2: Reverse Engineer Full Stack (Brownfield Path)

**Estimated Time:** 30-45 minutes
**Output:** 8 comprehensive documentation files in `docs/reverse-engineering/`

**Path:** Brownfield - Extract business logic AND technical implementation

---

## 📋 Copy and Paste This Prompt

```
Your mission: Systematically analyze the application and extract **complete specifications** including both business logic AND technical implementation details to enable GitHub Spec Kit management of this existing codebase.

**CRITICAL:** Document both WHAT the system does (business logic) AND HOW it's currently implemented (technical details). Capture exact versions, file paths, and implementation specifics so `/speckit.analyze` can validate code matches specs.

Use the analysis from Step 1 (`analysis-report.md`) to understand the application context.

---

## Phase 1: Complete Codebase Analysis

Use the Task tool with subagent_type=Explore to extract everything:

### 1.1 Backend Analysis (Business + Technical)

Find and document:
- **Business Logic**: What the backend does (user capabilities, workflows)
- **API Endpoints**: Exact paths, HTTP methods, handlers
- **Implementation**: Framework, libraries, file locations
- **Data Models**: Schemas with exact field types, ORM details
- **Configuration**: Env vars with current values/defaults
- **External Integrations**: Which APIs, which SDKs, versions

**Example - Document both:**

✅ **Business**: "User can register with email/password"
✅ **Technical**: "POST /api/auth/register endpoint in `app/api/auth/register/route.ts` using Next.js 14 App Router, Zod 3.22.4 validation, bcrypt 5.1.1 hashing"

### 1.2 Frontend Analysis (Business + Technical)

Find and document:
- **User Flows**: What users can do
- **Pages/Routes**: Exact paths and file locations
- **Components**: Component catalog with file paths
- **Framework Details**: React 18, Next.js 14, routing approach
- **State Management**: What library, how it's structured
- **API Client**: How frontend talks to backend (fetch, axios, tRPC)
- **Styling**: CSS framework, design system

### 1.3 Infrastructure Analysis (Complete Details)

Find and document:
- **Deployment**: Exact platform and configuration
- **CI/CD**: Which service, workflow files
- **Hosting**: Provider, service type, regions
- **Database**: Technology, version, hosting
- **Storage**: Object storage details, CDN
- **Monitoring**: Tools in use, dashboards

### 1.4 Dependency Analysis

Find and document:
- **All dependencies** with exact versions
- **Dev dependencies**
- **Peer dependencies**
- **Runtime requirements** (Node version, etc.)

---

## Phase 2: Generate 8 Comprehensive Documents

Create `docs/reverse-engineering/` directory and generate these files:

### 1. functional-specification.md

**Focus:** Business logic AND how it's currently implemented

**Sections:**
1. Executive Summary
   - Application purpose (business)
   - Current architecture (technical)
   - Technology stack overview

2. Functional Requirements (FR-001, FR-002, ...)
   - User capabilities (business)
   - Current implementation approach (technical)
   - Acceptance criteria

**Example:**

```markdown
## FR-001: User Registration

### Business Requirement
Users must be able to create accounts using email and password.

### Current Implementation
- **Endpoint**: POST /api/auth/register
- **Handler**: `app/api/auth/register/route.ts` (Next.js App Router)
- **Validation**: Zod schema in `lib/validation/auth.ts`
  - Email: Valid format, unique constraint
  - Password: Min 8 chars, 1 number, 1 special char
- **Password Hashing**: bcrypt 5.1.1 (cost: 10)
- **Database**: Prisma User model, PostgreSQL 15.3
- **Email Verification**: SendGrid email sent with 24h token
- **Response**: Returns JWT (jose 5.1.0) + user object

### Dependencies
- zod@3.22.4
- bcrypt@5.1.1
- jose@5.1.0
- @sendgrid/mail@7.7.0
- @prisma/client@5.6.0

### Files
- app/api/auth/register/route.ts (78 lines)
- lib/validation/auth.ts (34 lines)
- lib/auth/password.ts (24 lines)
- lib/auth/jwt.ts (56 lines)
- lib/email/verification.ts (42 lines)

### Acceptance Criteria
- [x] User can register with valid email/password
- [x] Duplicate emails rejected with 409 error
- [x] Weak passwords rejected with validation error
- [x] Verification email sent via SendGrid
- [x] JWT token returned on successful registration
```

3. User Stories (P0/P1/P2/P3)
   - Business value
   - Current implementation status
   - Technical approach

4. Non-Functional Requirements
   - Performance targets AND current metrics
   - Security requirements AND current implementation
   - Scalability goals AND current capacity

---

### 2. configuration-reference.md

**Focus:** ALL configuration with current values/defaults

**Extract everything:**
- **Environment variables** (name, type, current default, required, description)
- **Build-time configuration**
- **Runtime configuration**
- **Feature flags** (if any)
- **Framework configuration** files (next.config.js, etc.)

**Example:**

```markdown
## Environment Variables

### Authentication
- `JWT_SECRET` (string, required)
  - Current: Set in production (not in repo)
  - Purpose: Secret for signing JWT tokens
  - Used by: lib/auth/jwt.ts (jose library)

- `JWT_EXPIRY` (string, optional)
  - Current default: "24h"
  - Purpose: JWT token expiration time
  - Format: Zeit/ms format (e.g., "24h", "7d")
  - Used by: lib/auth/jwt.ts

### Database
- `DATABASE_URL` (string, required)
  - Current: PostgreSQL connection string
  - Format: postgresql://user:pass@host:5432/db
  - Used by: Prisma Client

### External Services
- `SENDGRID_API_KEY` (string, required)
  - Purpose: SendGrid email service API key
  - Used by: lib/email/*.ts

- `SENDGRID_FROM_EMAIL` (string, required)
  - Current default: "noreply@example.com"
  - Purpose: Sender email for all outbound emails

## Framework Configuration

### next.config.js
\`\`\`javascript
{
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  }
}
\`\`\`

### tsconfig.json
- TypeScript 5.3.2
- Strict mode enabled
- Path aliases: @/* → src/*
```

---

### 3. data-architecture.md

**Focus:** Data models with exact schemas AND business logic

**Sections:**
1. Domain Model (Business entities)
2. Database Schema (Exact implementation)
3. ORM Details (Prisma, TypeORM, etc.)
4. API Contracts (Exact request/response formats)

**Example:**

```markdown
## Entity: User

### Business Purpose
Represents a registered user of the system with authentication and profile data.

### Database Schema (PostgreSQL via Prisma)

\`\`\`prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  displayName   String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  posts         Post[]
  comments      Comment[]
  sessions      Session[]
}
\`\`\`

### TypeScript Type (Generated by Prisma)

\`\`\`typescript
type User = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### Business Rules
- Email must be unique (DB constraint)
- Password stored as bcrypt hash (never plaintext)
- emailVerified gates access to posting features
- Soft delete not implemented (hard delete only)

### Indexes
- PRIMARY: id (cuid)
- UNIQUE: email (for login lookups)
- INDEX: createdAt (for recent users queries)

### Relationships
- One-to-many: User → Post (CASCADE delete)
- One-to-many: User → Comment (CASCADE delete)
- One-to-many: User → Session (CASCADE delete)

## API Contract: User Registration

### Endpoint
POST /api/auth/register

### Request Schema (Zod)
\`\`\`typescript
{
  email: string (email format),
  password: string (min 8, max 100),
  displayName?: string (optional, max 50)
}
\`\`\`

### Response (Success)
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clp123abc",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
\`\`\`

### Errors
- 400: Validation error (invalid email, weak password)
- 409: Email already exists
- 500: Server error (email service failure, database error)

### Implementation Files
- Request handler: app/api/auth/register/route.ts
- Validation: lib/validation/auth.ts (Zod schemas)
- Business logic: lib/auth/register.ts
- Database: lib/db/user.ts (Prisma operations)
```

---

### 4. operations-guide.md

**Focus:** How the system is actually operated

**Include:**
- Deployment procedures (exact commands/processes)
- Infrastructure details (Terraform files, cloud services)
- Monitoring setup (Datadog, Sentry, etc.)
- Backup strategies (current approach)
- Runbooks (actual procedures for common issues)

---

### 5. technical-debt-analysis.md

**Focus:** Business impact AND technical details

**Example:**

```markdown
## High Priority Issues

### 1. Missing Rate Limiting on Auth Endpoints

**Business Impact:**
- Vulnerable to brute-force attacks
- Potential for account takeover
- Security compliance risk

**Technical Details:**
- Files affected: app/api/auth/*/route.ts
- Current state: No rate limiting implemented
- Recommended: Add rate limiting middleware (10 attempts/hour per IP)
- Dependencies needed: @upstash/ratelimit or express-rate-limit
- Effort: ~4 hours

### 2. No Integration Tests

**Business Impact:**
- Deployments risky (manual testing only)
- Regressions not caught before production
- Slower development velocity

**Technical Details:**
- Current: 0 integration tests
- Test framework: Not set up (need Vitest or Jest)
- Coverage target: 80% of API routes
- Files: Need tests for all app/api/*/route.ts
- Effort: ~16 hours
```

---

### 6. observability-requirements.md

**Focus:** What's monitored AND what should be

**Current State:**

```markdown
## Current Monitoring

### Tools in Use
- **Application**: None configured
- **Infrastructure**: Vercel Analytics (basic)
- **Errors**: None (should add Sentry)
- **Logs**: Vercel logs (retention: 7 days)

### Current Metrics
- Request count (Vercel built-in)
- Response times (P50, P95, P99)
- Error rates (5xx errors)

## Required Additions

### Business Metrics
- User registration rate (add tracking)
- Login success/failure rate (add tracking)
- Email delivery rate (SendGrid webhooks)

### Technical Metrics
- Database query performance (add Prisma logging)
- API endpoint latencies (add custom instrumentation)
- External service health (Stripe, SendGrid)

### Implementation Plan
1. Add Sentry for error tracking (sentry.io)
2. Add PostHog for product analytics
3. Enable Prisma query logging
4. Set up SendGrid event webhooks
```

---

### 7. visual-design-system.md

**Focus:** UX AND current UI implementation

**Include:**
- Design patterns used
- Component library (Shadcn, MUI, etc.)
- Styling approach (Tailwind, CSS Modules, etc.)
- Responsive breakpoints
- Accessibility implementation

**Example:**

```markdown
## Current UI Stack

### Styling
- **Framework**: Tailwind CSS 3.3.0
- **Configuration**: tailwind.config.ts
- **Customizations**:
  - Custom colors (brand palette)
  - Custom fonts (Inter, system fallback)
  - Custom breakpoints (sm, md, lg, xl, 2xl)

### Component Library
- **Library**: shadcn/ui (copy-paste components)
- **Location**: components/ui/
- **Components**: Button, Input, Card, Dialog, Dropdown, Toast

### Design Tokens
\`\`\`css
--color-primary: #3b82f6
--color-secondary: #8b5cf6
--font-sans: 'Inter', sans-serif
--radius: 0.5rem
\`\`\`

### Responsive Strategy
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px, 1536px
- Components tested at all breakpoints

### Accessibility
- WCAG 2.1 Level AA target
- Current compliance: ~60% (needs audit)
- Focus indicators: Implemented
- ARIA labels: Partially implemented
- Keyboard navigation: Implemented for main flows
```

---

### 8. test-documentation.md

**Focus:** Testing requirements AND current state

**Current State:**

```markdown
## Test Framework
- **Unit Tests**: Vitest 1.0.4
- **E2E Tests**: Not configured (should add Playwright)
- **Component Tests**: Not configured (should add Testing Library)

## Current Coverage

### Unit Tests
- **Location**: *.test.ts files colocated with source
- **Coverage**: ~30% (12 of 40 functions)
- **Frameworks**: Vitest

**Tested:**
- lib/auth/password.ts (hash, compare functions)
- lib/auth/jwt.ts (sign, verify functions)
- lib/validation/auth.ts (schemas)

**Not Tested:**
- All API routes (0% coverage)
- Database operations
- Email sending
- Frontend components

### Test Commands
\`\`\`json
{
  "test": "vitest",
  "test:coverage": "vitest --coverage"
}
\`\`\`

## Required Additions

### Integration Tests (Priority: High)
- Test all API endpoints with real database (test DB)
- Use Vitest + Supertest
- Target coverage: 80%

### E2E Tests (Priority: Medium)
- Test critical user flows (register, login, create post)
- Use Playwright
- Run in CI before deploy

### Component Tests (Priority: Low)
- Test UI components in isolation
- Use Vitest + Testing Library
```

---

## Success Criteria

After running this prompt, you should have:

- ✅ 8 comprehensive documents in `docs/reverse-engineering/`
- ✅ Business logic documented
- ✅ Technical implementation fully documented
- ✅ Exact versions, file paths, configurations captured
- ✅ Can generate prescriptive GitHub Spec Kit specs
- ✅ `/speckit.analyze` can validate specs against code
- ✅ Ready to proceed to Step 3 (Create Prescriptive Specs)

---

## Validation Checklist

Before proceeding, verify your documentation includes:

- [ ] Framework and library versions (Next.js 14.0.3, React 18.2.0, etc.)
- [ ] File paths for all implementations
- [ ] Database schemas with exact types
- [ ] API endpoints with exact paths and methods
- [ ] Environment variables with defaults
- [ ] Dependencies with versions
- [ ] Current vs required state (for technical debt)
- [ ] Enough detail for `/speckit.analyze` to validate

---

## Next Step

Once documentation is complete, proceed to:

**Step 3: Create Prescriptive Specs** (`03-create-prescriptive-specs.md`)
```
