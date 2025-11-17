# Step 2: Reverse Engineer

**Estimated Time:** 30 minutes
**Output:** 8 comprehensive documentation files in `docs/reverse-engineering/`

---

## 📋 Copy and Paste This Prompt

```
Your mission: Systematically analyze the application in the current working directory and create comprehensive, framework-agnostic documentation that enables understanding, maintenance, and potential reimplementation in any technology stack.

Use the analysis from Step 1 (`analysis-report.md`) to understand the application context.

---

## Phase 1: Deep Codebase Analysis

Use the Task tool with subagent_type=Explore to perform thorough analysis:

### 1.1 Backend Analysis (if applicable)

Find and document:
- **All API Endpoints**: HTTP method, path, authentication, parameters, purpose
- **Data Models**: Extract all schemas, types, interfaces with complete field definitions
- **Configuration**: All environment variables, config files, settings
- **External Integrations**: APIs, services, databases
- **Business Logic**: Key services, utilities, algorithms

### 1.2 Frontend Analysis (if applicable)

Find and document:
- **All Pages/Routes**: Path, purpose, authentication requirement
- **Components**: Catalog all components by type (layout, form, UI, etc.)
- **State Management**: Store structure, global state
- **API Client**: How frontend calls backend
- **Styling**: Design system, themes, component styles

### 1.3 Infrastructure Analysis

Find and document:
- **Deployment**: How is it deployed? (Terraform, CloudFormation, manual)
- **CI/CD**: GitHub Actions, Jenkins, GitLab CI?
- **Hosting**: AWS, GCP, Azure, on-premise?
- **Database**: Type, schema, migrations
- **Storage**: Object storage, file systems

### 1.4 Testing Analysis

Find and document:
- **Test Files**: Location, framework, coverage
- **Test Types**: Unit, integration, E2E
- **Coverage**: Estimate % covered
- **Test Data**: Mocks, fixtures, seeds

---

## Phase 2: Generate 8 Comprehensive Documents

Create `docs/reverse-engineering/` directory and generate these files:

### 1. functional-specification.md

**Focus:** Business logic, WHAT the system does (not HOW)

**Sections:**
1. Executive Summary
   - Application purpose
   - Target users
   - Key value proposition

2. Functional Requirements (FR-001, FR-002, ...)
   - User capabilities
   - System behaviors
   - Business workflows
   - Each requirement: specific, measurable, framework-agnostic, testable

3. User Stories (P0/P1/P2/P3)
   - Format: "As a [user type], I want [capability] so that [benefit]"
   - Acceptance criteria for each
   - Priority classification

4. Non-Functional Requirements (NFR-001, NFR-002, ...)
   - Performance, Security, Scalability, Reliability, Usability, Maintainability

5. Business Rules
   - Domain logic, Validation, Authorization, Workflow rules

6. System Boundaries
   - In scope vs out of scope
   - External dependencies
   - Integration points

7. Success Criteria
   - Measurable outcomes, KPIs

**Critical:** Avoid framework/technology names unless they're true constraints

---

### 2. configuration-reference.md

**Focus:** All configuration options

**Extract:**
- Backend configuration (environment variables, config files)
- Frontend configuration (build-time, runtime)
- Infrastructure configuration (Terraform variables, etc.)
- Feature flags
- Secrets management approach

**For each config:**
- Name, Type, Default, Required, Description, Validation, Example

---

### 3. data-architecture.md

**Focus:** Data models and API contracts

**Sections:**
1. Data Models
   - Complete entity schemas with field types
   - Constraints (unique, required, format)
   - Relationships between entities
   - Business rules for each entity

2. Database Schema
   - Tables/collections structure
   - Indexes
   - Access patterns

3. API Contracts
   - Every endpoint with full request/response examples
   - Authentication requirements
   - Error responses
   - Business rules per endpoint

4. Data Flow
   - How data moves through the system
   - Key workflows (e.g., user registration flow)

5. External Data Sources
   - Third-party APIs
   - Integration details

---

### 4. operations-guide.md

**Focus:** Deployment and infrastructure

**Sections:**
1. Technology Stack (complete breakdown)
2. Development Environment (local setup)
3. Build Process (all build steps, artifacts)
4. Testing Strategy (how to run tests)
5. Deployment Pipeline (CI/CD workflows)
6. Infrastructure (all cloud resources)
7. Environment Configuration (dev/staging/prod)
8. Monitoring & Alerting
9. Security
10. Backup & Recovery
11. Operational Procedures (deployment, rollback, scaling)
12. Troubleshooting (common issues)

---

### 5. technical-debt-analysis.md

**Focus:** Current issues and improvements

**Sections:**
1. Current Technical Debt
   - Code quality issues
   - Dependency issues
   - Architecture issues
   - Performance issues

2. Security Concerns
   - Vulnerabilities
   - Best practices not followed

3. Accessibility Issues
   - WCAG violations
   - Screen reader issues

4. Testing Gaps
   - Coverage gaps
   - Missing test types

5. Documentation Gaps

6. DevOps & Infrastructure Issues

7. Improvement Opportunities
   - Quick wins (low effort, high impact)
   - Medium-term improvements
   - Long-term improvements

8. Migration Considerations
   - Do NOT carry over
   - Must preserve
   - Opportunities in rewrite

9. Technical Debt Metrics
   - Total estimated debt (person-days)
   - Prioritization

---

### 6. observability-requirements.md

**Focus:** Monitoring, logging, analytics

**Sections:**
1. Application Metrics
   - Performance metrics (latency, throughput, errors)
   - Business metrics (DAU, MAU, feature usage)

2. Logging Requirements
   - Log levels (ERROR, WARN, INFO, DEBUG)
   - Log format (structured JSON)
   - What to log (auth events, errors, external API calls)

3. Analytics & Tracking
   - User interaction events
   - Conversion funnels

4. Error Tracking
   - Error categories
   - Error context to capture

5. Alerting Rules
   - Critical alerts
   - High priority alerts
   - Warning alerts

6. Dashboards
   - Application health
   - User activity
   - Infrastructure
   - Cost

---

### 7. visual-design-system.md

**Focus:** UI/UX design patterns

**Sections:**
1. Design Tokens
   - Colors (extract actual hex values)
   - Typography (fonts, sizes, weights)
   - Spacing (spacing scale)
   - Borders & Shadows

2. Layout Patterns
   - Responsive breakpoints
   - Page layouts

3. Component Patterns
   - Document each component type with variants, states, specifications

4. Interaction Patterns
   - Hover, focus, loading states
   - Animations & transitions

5. Accessibility
   - Color contrast
   - Keyboard navigation
   - ARIA labels

6. Icons & Images
   - Icon system
   - Image handling

---

### 8. test-documentation.md

**Focus:** Testing requirements and coverage

**Sections:**
1. Test Coverage Analysis
   - Current coverage metrics (by module)
   - Critical paths coverage

2. Testing Strategy
   - Test pyramid (unit/integration/E2E percentages)
   - Test types description

3. Critical Test Cases
   - List by feature area
   - Mark as implemented or not

4. Test Data Requirements
   - Mock data structures
   - Test database setup

5. Test Execution
   - How to run tests
   - Continuous integration

6. Testing Gaps & Recommendations
   - What's missing
   - Coverage improvement plan

---

## Output Validation

After generation, verify each file:
- [ ] functional-specification.md (framework-agnostic, focuses on WHAT not HOW)
- [ ] configuration-reference.md (all config extracted with actual values)
- [ ] data-architecture.md (complete schemas and API contracts)
- [ ] operations-guide.md (real infrastructure documented)
- [ ] technical-debt-analysis.md (concrete improvements identified)
- [ ] observability-requirements.md (all tracking captured)
- [ ] visual-design-system.md (actual design token values)
- [ ] test-documentation.md (actual coverage numbers)

---

## Tips for Thoroughness

1. **Read actual code** - Don't guess or assume
2. **Capture reality** - Document what IS, not what SHOULD be
3. **Extract actual values** - Real numbers, not placeholders
4. **Find all configs** - Search for all types of config files
5. **Read tests** - They reveal actual requirements
6. **Check version control** - Recent commits show active development
7. **Look for TODOs** - Reveal planned improvements

---

## Commit the Documentation

After generating all 8 files:

```bash
git add docs/reverse-engineering/
git commit -m "docs: add comprehensive reverse-engineering documentation

Generated 8 framework-agnostic documents covering:
- Functional specifications and business logic
- Configuration reference
- Data architecture and API contracts
- Operations and infrastructure
- Technical debt analysis
- Observability requirements
- Visual design system
- Test documentation

Total: [X] KB of comprehensive documentation"
git push
```

---

## Success Criteria

After running this prompt:
- [x] 8 comprehensive markdown files created
- [x] All documentation is framework-agnostic
- [x] Actual values extracted (not placeholders)
- [x] Clear view of what exists in the codebase
- [x] Documentation committed to git
- [x] Ready to proceed to Step 3
```

---

## 🔄 Next Step

Once all 8 documents are generated and committed, proceed to:

**Step 3: Create Specifications** (`03-create-specifications.md`)
