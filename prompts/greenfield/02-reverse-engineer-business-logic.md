# Step 2: Reverse Engineer Business Logic (Greenfield Path)

**Estimated Time:** 30 minutes
**Output:** 8 comprehensive documentation files in `docs/reverse-engineering/`

**Path:** Greenfield - Extract business logic for new implementation

---

## 📋 Copy and Paste This Prompt

```
Your mission: Systematically analyze the application and extract **business logic only** to create comprehensive, framework-agnostic documentation that enables reimplementation in ANY technology stack.

**CRITICAL:** Focus on WHAT the system does, NOT HOW it's currently implemented. Avoid documenting specific technologies unless they're true business constraints (e.g., "must integrate with Stripe API" is a constraint, "uses Express.js" is not).

Use the analysis from Step 1 (`analysis-report.md`) to understand the application context.

---

## Phase 1: Business Logic Analysis

Use the Task tool with subagent_type=Explore to extract business requirements:

### 1.1 User Capabilities Analysis

Find and document:
- **User Actions**: What can users do? (e.g., "register account", "create post", "upload photo")
- **User Workflows**: Multi-step processes (e.g., checkout flow, onboarding)
- **User Roles**: Different user types and their permissions
- **Business Rules**: Validation, authorization, constraints

**Avoid:**
- API endpoint paths (those are implementation)
- Database table names (those are implementation)
- Framework-specific terms

### 1.2 Data Requirements Analysis

Find and document:
- **Entities**: What "things" does the system manage? (Users, Products, Orders, etc.)
- **Attributes**: What information is stored about each entity?
- **Relationships**: How entities relate (User has many Orders)
- **Constraints**: Business rules (email must be unique, price > 0)

**Avoid:**
- Database technology (PostgreSQL vs MongoDB)
- ORM details (Prisma, TypeORM)
- Schema implementation

### 1.3 Integration Requirements

Find and document:
- **External Services**: What third-party services are used? (Stripe, SendGrid, S3)
- **Integration Purpose**: WHY each service is used (business requirement)
- **Data Flow**: What data goes to/from external services

**Document:**
- "Must integrate with Stripe for payment processing" ✅
- "Must send transactional emails" ✅
- "Must store files in cloud storage" ✅

**Don't document:**
- "Uses @stripe/stripe-js library" ❌
- "Uses SendGrid API v3" ❌
- "Uses AWS S3 SDK" ❌

### 1.4 Business Workflows

Find and document:
- **Key User Journeys**: Registration, purchase, content creation
- **State Transitions**: Order states (pending → paid → shipped)
- **Business Events**: What happens when? (user registers → send welcome email)

---

## Phase 2: Generate 8 Comprehensive Documents

Create `docs/reverse-engineering/` directory and generate these files:

### 1. functional-specification.md

**Focus:** Pure business logic - WHAT the system does for users

**Sections:**
1. Executive Summary
   - Application purpose (business value)
   - Target users (personas)
   - Key value proposition

2. Functional Requirements (FR-001, FR-002, ...)
   - User capabilities (business perspective)
   - System behaviors (business rules)
   - Business workflows
   - **Each requirement: framework-agnostic, testable, measurable**

3. User Stories (P0/P1/P2/P3)
   - Format: "As a [user type], I want [capability] so that [benefit]"
   - Acceptance criteria (business outcomes, NOT technical implementation)
   - Priority classification (business value)

4. Non-Functional Requirements (NFR-001, NFR-002, ...)
   - Performance goals (e.g., "page load < 2s")
   - Security requirements (e.g., "data encrypted at rest")
   - Scalability targets (e.g., "support 10k concurrent users")
   - Reliability (e.g., "99.9% uptime")
   - Usability standards
   - Maintainability goals

5. Business Rules
   - Domain logic (e.g., "orders over $100 get free shipping")
   - Validation rules (e.g., "password min 8 characters")
   - Authorization rules (e.g., "only admins can delete users")
   - Workflow rules (e.g., "users must verify email before posting")

6. System Boundaries
   - In scope vs out of scope (business perspective)
   - External dependencies (WHAT external services, not which specific APIs)
   - Integration points (business requirements)

7. Success Criteria
   - Measurable business outcomes
   - KPIs and metrics

**CRITICAL GUIDELINES:**

✅ **Do write:**
- "User authentication with email/password"
- "Session expires after 24 hours of inactivity"
- "Passwords must meet complexity requirements"
- "Failed login attempts are rate-limited"

❌ **Don't write:**
- "JWT authentication using passport.js"
- "Sessions stored in Redis"
- "Bcrypt with cost factor 10"
- "Express-rate-limit middleware"

---

### 2. configuration-reference.md

**Focus:** Business-level configuration, not tech-specific

**Extract:**
- Feature flags (enable/disable features)
- Business rules that are configurable
- External service requirements (must have API key for payment processor)
- Limits and thresholds (rate limits, file size limits)

**Avoid:**
- Framework configuration
- Build tool settings
- Deployment configs

**Example:**

✅ **Include:**
```markdown
## Payment Processing
- **Payment Provider**: Required (Stripe, PayPal, etc.)
- **API Credentials**: Required
- **Webhook URL**: Required for payment confirmations

## Email Service
- **Email Provider**: Required (SendGrid, Mailgun, etc.)
- **API Credentials**: Required
- **Sender Email**: Required, must be verified

## File Upload Limits
- **Max File Size**: Configurable (default: 10MB)
- **Allowed File Types**: Configurable (default: images only)
```

❌ **Don't include:**
```markdown
## Next.js Configuration
- NODE_ENV: production
- NEXT_PUBLIC_API_URL: ...
```

---

### 3. data-architecture.md

**Focus:** Data entities, relationships, business rules - NOT database schema

**Sections:**
1. Domain Model
   - Entities and their business purpose
   - Attributes (what information, not data types)
   - Relationships (business associations)
   - Business constraints

**Example:**

✅ **Write this:**
```markdown
## Entity: User

### Purpose
Represents a registered user of the system.

### Attributes
- Unique identifier
- Email address (unique, required)
- Password (secure storage required)
- Display name
- Email verification status
- Registration timestamp
- Last login timestamp

### Relationships
- Has many: Posts, Comments, Likes
- Belongs to: Organization (optional)

### Business Rules
- Email must be unique across all users
- Password must meet complexity requirements
- Users must verify email before full access
- Inactive users (no login for 365 days) are flagged for cleanup
```

❌ **Don't write this:**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  // ...
}
```

2. API Contracts (Business Perspective)
   - What operations are available? (Create User, Get Posts, etc.)
   - What data is sent/received? (Business data, not JSON structure)
   - Business rules per operation
   - Error conditions (business errors)

**Example:**

✅ **Write this:**
```markdown
## Operation: User Registration

### Input
- Email address (required, must be valid format)
- Password (required, must meet complexity rules)
- Display name (optional)

### Output
- User account created
- Verification email sent
- User can log in (after email verification)

### Business Rules
- Email must not already exist
- Password validated before storage
- Verification required within 7 days

### Error Conditions
- Email already registered → Error: "Email already in use"
- Invalid password → Error: "Password requirements not met"
- Email delivery fails → Retry logic, notify admins if persistent
```

❌ **Don't write this:**
```
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

---

### 4. operations-guide.md

**Focus:** What operations are needed, not how they're currently done

**Sections:**
- Deployment requirements (needs hosting, database, email service)
- Monitoring needs (what metrics matter for business)
- Backup requirements (business continuity)
- Maintenance windows (if any)

**Avoid:**
- Specific CI/CD tools
- Infrastructure-as-code
- Deployment commands

---

### 5. technical-debt-analysis.md

**Focus:** Business impact of technical issues

**Example:**

✅ **Business impact:**
```markdown
## Missing Features Impact
- No password reset: Users get locked out, support burden
- No file upload validation: Potential security risk
- No rate limiting: Vulnerable to abuse
```

❌ **Technical details:**
```markdown
## Code Quality Issues
- No TypeScript in 40% of files
- Missing unit tests for auth module
```

---

### 6. observability-requirements.md

**Focus:** What needs to be monitored for business reasons

**Example:**

✅ **Business monitoring:**
```markdown
## Critical Metrics
- User registration rate (business growth)
- Login success/failure rate (user experience)
- Payment processing success rate (revenue)
- Email delivery rate (communications)

## Alerting Requirements
- Alert if payment processing fails
- Alert if email service is down
- Alert if registration flow broken
```

❌ **Technical monitoring:**
```markdown
## Technical Metrics
- Server CPU usage
- Memory utilization
- Database connection pool
```

---

### 7. visual-design-system.md

**Focus:** User experience requirements

**Extract:**
- UI/UX patterns from a user perspective
- Accessibility requirements
- Responsive design needs
- User flows

**Avoid:**
- CSS frameworks
- Component libraries
- Styling implementation

---

### 8. test-documentation.md

**Focus:** What should be tested (acceptance criteria)

**Example:**

✅ **Business test requirements:**
```markdown
## User Registration Tests

### Must verify:
- User can register with valid email/password
- Duplicate email is rejected
- Weak password is rejected
- Verification email is sent
- Unverified users have limited access
```

❌ **Technical test details:**
```markdown
## Unit Tests
- auth.service.spec.ts: hashPassword function
- user.repository.spec.ts: findByEmail query
```

---

## Success Criteria

After running this prompt, you should have:

- ✅ 8 comprehensive documents in `docs/reverse-engineering/`
- ✅ Pure business logic extracted
- ✅ NO framework-specific details
- ✅ Documentation reads like a product spec, not a code walkthrough
- ✅ Can be implemented in ANY tech stack
- ✅ Ready to proceed to Step 3 (Create Agnostic Specs)

---

## Validation Checklist

Before proceeding, verify your documentation:

- [ ] No framework names (Express, React, Django, etc.) unless business requirement
- [ ] No database technology (PostgreSQL, MongoDB, etc.)
- [ ] No library names (bcrypt, joi, stripe-js, etc.)
- [ ] Focuses on user capabilities and business rules
- [ ] Could be understood by product manager (not just engineers)
- [ ] Can be implemented in Node.js, Python, Java, Go, or any other stack

---

## Next Step

Once documentation is complete, proceed to:

**Step 3: Create Agnostic Specs** (`03-create-agnostic-specs.md`)
```
