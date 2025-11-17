# Brownfield Path: Manage Existing App with Spec Kit

**Use this path when:** You want to integrate GitHub Spec Kit into an existing application and manage it with specs going forward.

## Key Characteristics

✅ **Tech-Stack Prescriptive** - Specifications document both WHAT and HOW
✅ **Full Implementation Capture** - Extract business logic AND technical details
✅ **Spec-Code Alignment** - `/speckit.analyze` validates implementation matches specs
✅ **Upgrade Management** - Change specs, validate with analyze, implement upgrades

## Goal

Document the existing application **exactly as it is** in GitHub Spec Kit format, then manage changes through specifications going forward.

## Example Use Cases

- **Existing codebase:** Add spec-driven development to current app
- **Team onboarding:** Use specs as documentation
- **Planned upgrades:** Manage framework/dependency upgrades via specs
- **Gradual refactoring:** Spec-driven modernization
- **Consistency enforcement:** Use `/speckit.analyze` to prevent drift

## What Gets Extracted

### ✅ Extract Everything
- Business logic and workflows
- Exact technical implementation
- Framework versions and configurations
- Database schema and ORM details
- API endpoint implementations
- Deployment infrastructure
- All dependencies with versions

## Example Spec Output

```markdown
# Feature: User Authentication

## User Stories
- As a user, I want to register with email/password
- As a user, I want to log in securely
- As a user, I want to reset my password

## Acceptance Criteria
- [ ] User can register with unique email address
- [ ] Passwords must meet complexity requirements (8+ chars, number, special char)
- [ ] User receives email confirmation after registration
- [ ] User can log in with registered credentials
- [ ] Failed login attempts are rate-limited (10 attempts/hour)
- [ ] Sessions expire after 24 hours of inactivity

## Business Rules
- BR-001: Email addresses must be unique across the system
- BR-002: Passwords hashed with bcrypt (cost factor: 10)
- BR-003: Users must verify email before full account access

## Technical Implementation

### Current Stack
- **Framework:** Next.js 14.0.3 (App Router)
- **Auth Library:** jose 5.1.0 (JWT)
- **Password Hashing:** bcrypt 5.1.1 (cost: 10)
- **Email Service:** SendGrid API v3
- **Session Storage:** JWT in httpOnly cookie
- **Token Expiry:** 24 hours (configurable via JWT_EXPIRY env var)

### API Endpoints
- **POST /api/auth/register**
  - Handler: `app/api/auth/register/route.ts`
  - Validation: Zod schema (`lib/validation/auth.ts`)
  - Returns: JWT token + user object

- **POST /api/auth/login**
  - Handler: `app/api/auth/login/route.ts`
  - Rate limiting: 10 attempts/hour per IP (via Upstash Redis)
  - Returns: JWT token + user object

- **POST /api/auth/reset-password**
  - Handler: `app/api/auth/reset-password/route.ts`
  - Sends email via SendGrid
  - Token expiry: 1 hour

### Database Schema
\`\`\`prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
\`\`\`

### Implementation Files
- `app/api/auth/register/route.ts` - Registration endpoint
- `app/api/auth/login/route.ts` - Login endpoint
- `lib/auth/jwt.ts` - JWT utilities (jose library)
- `lib/auth/password.ts` - Password hashing (bcrypt)
- `lib/validation/auth.ts` - Zod schemas
- `middleware/rate-limit.ts` - Rate limiting logic

### Dependencies
\`\`\`json
{
  "jose": "5.1.0",
  "bcrypt": "5.1.1",
  "zod": "3.22.4",
  "@sendgrid/mail": "7.7.0"
}
\`\`\`

### Environment Variables
- `JWT_SECRET` - Secret for signing JWTs (required)
- `JWT_EXPIRY` - Token expiry (default: "24h")
- `SENDGRID_API_KEY` - SendGrid API key (required)
- `SENDGRID_FROM_EMAIL` - From email address (required)
```

**Note:** Exact versions, file paths, and implementation details documented.

## Upgrade Workflow

When you want to upgrade:

1. **Update spec:** Change Next.js 14.0.3 → 15.0.0 in constitution.md
2. **Run `/speckit.analyze`:**
   ```
   ⚠️ Gap: Spec requires Next.js 15.0.0, codebase uses 14.0.3
   ```
3. **Create implementation plan** for upgrade
4. **Run `/speckit.implement upgrade-nextjs`:**
   - Updates package.json
   - Refactors breaking changes
   - Updates specs to mark complete
5. **Validate:** `/speckit.analyze` shows ✅ no gaps

## Prompts

Use these prompts in order:

1. `01-initial-analysis.md` - Same as greenfield
2. `02-reverse-engineer-full-stack.md` - Extract business logic AND technical implementation
3. `03-create-prescriptive-specs.md` - Create detailed GitHub Spec Kit specs with tech details
4. `04-gap-analysis.md` - Validate specs match code (should be ~100%)
5. `05-complete-specification.md` - Clarify any ambiguities
6. `06-implement-brownfield.md` - Fill gaps, maintain consistency

## Result

Specifications that describe **what the system should do AND how it's currently implemented**, enabling spec-driven management of your existing codebase.
