# Greenfield Path: Build New App from Business Logic

**Use this path when:** You want to build a new application based on the business logic and features of an existing application, potentially with a different tech stack.

## Key Characteristics

✅ **Tech-Stack Agnostic** - Specifications focus on WHAT, not HOW
✅ **Business Logic Only** - Extract requirements, not implementation
✅ **Framework Freedom** - Can implement in any technology
✅ **Portable Specs** - Specs work regardless of chosen stack

## Goal

Extract the **business value** from the existing application and create specifications that can be implemented in any technology stack.

## Example Use Cases

- **Platform migration:** Moving from monolith to microservices
- **Tech stack modernization:** Rebuilding Rails app in Next.js
- **Multi-platform:** Building mobile app from web app specs
- **Clean slate:** Starting fresh with better architecture

## What Gets Extracted

### ✅ Extract (Business Logic)
- User capabilities and workflows
- Business rules and validation logic
- Data relationships and constraints
- Integration requirements (what external systems, not how)
- Non-functional requirements (performance, security goals)

### ❌ Don't Extract (Technical Implementation)
- Specific frameworks or libraries
- Database technology
- Hosting/deployment platform
- Programming language
- Architectural patterns (unless business requirement)

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
- [ ] Failed login attempts are rate-limited
- [ ] Sessions expire after 24 hours of inactivity

## Business Rules
- BR-001: Email addresses must be unique across the system
- BR-002: Passwords must be hashed (algorithm: implementation choice)
- BR-003: Users must verify email before full account access

## Technical Requirements
- Authentication: Token-based (implementation choice)
- Session management: Stateless preferred
- Password security: Industry-standard hashing
```

**Note:** No mention of JWT, Express, bcrypt, etc. - those are implementation choices.

## Prompts

Use these prompts in order:

1. `01-initial-analysis.md` - Same as brownfield
2. `02-reverse-engineer-business-logic.md` - Extract business requirements only
3. `03-create-agnostic-specs.md` - Create tech-agnostic GitHub Spec Kit specs
4. `04-gap-analysis.md` - Identify missing business features
5. `05-complete-specification.md` - Clarify business requirements
6. `06-implement-greenfield.md` - Build in chosen tech stack

## Result

Specifications that describe **what the system should do**, allowing you to implement it however you want.
