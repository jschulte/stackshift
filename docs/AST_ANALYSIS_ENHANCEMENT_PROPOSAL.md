# AST Analysis Enhancement Proposal

## Executive Summary

StackShift already has a robust AST parser (`mcp-server/src/analyzers/utils/ast-parser.ts`) built on Babel. This proposal outlines how to expand AST analysis across all 6 gears to provide deeper, more accurate reverse engineering and validation capabilities.

**Current State**: AST analysis is used in Gap Analysis (Gear 4) for function detection and stub verification.

**Proposed State**: AST analysis integrated throughout the entire workflow for comprehensive code understanding.

---

## Current AST Capabilities

### What We Have Today

The existing `ASTParser` class can extract:

- ✅ **Function Signatures** - name, parameters, return types, async, exported, stub detection
- ✅ **Class Declarations** - properties, methods, inheritance, interfaces
- ✅ **Imports/Exports** - dependency mapping
- ✅ **Doc Comments** - JSDoc extraction
- ✅ **Stub Detection** - identifies incomplete implementations
- ✅ **Type Annotations** - TypeScript type information

### Current Usage

- **Gear 4 (Gap Analysis)**: `gap-analyzer.ts` uses AST to verify function implementations
- **Diagram Generation**: `generate-diagrams` uses AST for class diagrams
- **Feature Analysis**: `feature-analyzer.ts` extracts feature information

---

## Proposed Enhancements

### 1. Gear 1: Analysis Enhancement

**Current**: File-based analysis (directory structure, tech stack detection)

**Enhanced with AST**:

```typescript
// Detect actual API endpoints from code
interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
  middleware: string[];
  location: CodeLocation;
}

// Example: Express.js
app.get('/api/users/:id', authMiddleware, getUserHandler);
// AST extracts: GET /api/users/:id, middleware: [authMiddleware], handler: getUserHandler

// Example: Next.js API routes
export async function GET(request) { ... }
// AST extracts: GET /api/route-name (from file path + export name)
```

**Benefits**:
- Accurate API inventory without manual documentation search
- Detect unused routes
- Find routes missing authentication
- Map middleware chains

**Implementation**:
- Add `APIEndpointExtractor` class
- Framework-specific patterns (Express, Next.js, Fastify, NestJS)
- Extract from decorators (@Get, @Post) and function calls (app.get, app.post)

---

### 2. Gear 2: Reverse Engineering Enhancement

**Current**: Manual code reading + pattern detection

**Enhanced with AST**:

#### A. Business Logic Extraction

```typescript
interface BusinessRule {
  type: 'validation' | 'calculation' | 'transformation' | 'authorization';
  description: string;
  location: CodeLocation;
  dependencies: string[];
}

// Example: Extract validation logic
if (user.age < 18) {
  throw new Error('Must be 18 or older');
}
// AST extracts: "Age must be >= 18" validation rule
```

#### B. Data Flow Analysis

```typescript
interface DataFlow {
  source: string;          // Where data comes from
  transformations: string[]; // What happens to it
  destination: string;     // Where it goes
  path: CodeLocation[];    // Code locations
}

// Example: Track data through functions
fetchUser() -> validateUser() -> saveToDatabase()
// AST traces: User data flows from API -> validation -> persistence
```

#### C. Component Hierarchy (React/Vue)

```typescript
interface ComponentHierarchy {
  name: string;
  props: PropDeclaration[];
  state: StateDeclaration[];
  children: ComponentHierarchy[];
  hooks: HookUsage[];
}

// Example: React component
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(userId); }, [userId]);
  return <UserCard user={user} />;
}
// AST extracts: Props, state, effects, child components
```

**Benefits**:
- Auto-generate accurate functional specifications
- Understand complex business logic without manual analysis
- Detect duplicate logic across codebase
- Map complete data flows

**Implementation**:
- `BusinessLogicExtractor` - pattern matching for common business rules
- `DataFlowTracer` - follow variables through function calls
- `ComponentAnalyzer` - React/Vue/Angular component extraction
- `DecoratorExtractor` - NestJS/Angular decorator metadata

---

### 3. Gear 3: Spec Creation Enhancement

**Current**: Manual spec writing or template-based generation

**Enhanced with AST**:

```typescript
// Auto-generate specs with actual signatures
## API Endpoint: GET /api/users/:id

**Implementation**: src/routes/users.ts:42

**Handler Signature**:
\`\`\`typescript
async function getUserById(
  userId: string,
  options?: FetchOptions
): Promise<User>
\`\`\`

**Middleware**: [authenticate, rateLimitcheck]

**Return Type**: User
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
\`\`\`

**Status**: ✅ IMPLEMENTED (detected via AST)
```

**Benefits**:
- Specs match actual code signatures (no drift)
- Automatic status detection (implemented vs. missing)
- Accurate type information from TypeScript
- Link specs to actual code locations

**Implementation**:
- Enhance `feature-analyzer.ts` with AST-based extraction
- Auto-detect implementation status from AST
- Generate specs with code references
- Extract TypeScript interfaces for spec documentation

---

### 4. Gear 4: Gap Analysis Enhancement

**Current**: Function existence + stub detection

**Enhanced with AST**:

#### A. Signature Validation

```typescript
// Spec says:
function createUser(name: string, email: string): Promise<User>

// Code has:
function createUser(name: string): Promise<User>

// AST detects: ❌ Missing email parameter
```

#### B. Business Logic Verification

```typescript
// Spec says: "Email must be validated before creating user"
// AST searches for: email validation logic in createUser function
// Result: ✅ Found validateEmail(email) call or ❌ Missing validation
```

#### C. Error Handling Check

```typescript
// Spec requires: try/catch or error boundaries
// AST detects:
- ✅ Has try/catch block
- ❌ Missing error handling
- ⚠️  Only catches Error, not specific types
```

#### D. Test Coverage Analysis

```typescript
// For each function in spec, AST searches test files for:
describe('createUser', () => {
  it('should validate email', ...)
  it('should throw on duplicate', ...)
})

// Reports: ✅ 2/2 test cases found or ⚠️  1/2 missing
```

**Benefits**:
- Precise gap detection (not just "exists" but "correct signature")
- Verify business logic requirements
- Ensure error handling completeness
- Validate test coverage

**Implementation**:
- Enhance `gap-analyzer.ts` with signature comparison
- Add business logic pattern search
- Error handling AST verification
- Test file AST parsing

---

### 5. Gear 5: Spec Completion Enhancement

**Current**: Manual clarification questions

**Enhanced with AST**:

```markdown
## [NEEDS CLARIFICATION] User Authentication

**From AST Analysis**:
- Found 3 authentication implementations:
  1. JWT token validation (src/middleware/auth.ts:15)
  2. Session cookie check (src/middleware/session.ts:22)
  3. API key validation (src/middleware/apikey.ts:8)

**Questions**:
1. Which authentication method should be primary?
2. Should all three be supported or consolidated?
3. JWT tokens expire in 1h (line 42) - is this intentional?

**Evidence**: [Show code snippets from AST extraction]
```

**Benefits**:
- Data-driven clarifications (not guessing)
- Show actual code evidence
- Detect contradictions in implementation
- Ask specific, answerable questions

**Implementation**:
- AST extracts multiple implementations of same concept
- Pattern detection finds contradictions
- Code evidence snippets for questions
- Suggest consolidation opportunities

---

### 6. Gear 6: Implementation Validation

**Current**: Manual review

**Enhanced with AST**:

```typescript
interface ImplementationCheck {
  requirement: string;
  expected: SignatureSpec;
  actual: FunctionSignature;
  match: boolean;
  issues: string[];
}

// After implementation, verify:
✅ Function exists: createUser
✅ Signature matches: (name: string, email: string) => Promise<User>
✅ Has error handling: try/catch block found
✅ Has validation: validateEmail() call found
❌ Missing tests: No test file for createUser
⚠️  Stub detected: Function body returns placeholder string
```

**Benefits**:
- Automated implementation verification
- Catch incomplete implementations
- Verify specs are followed
- Quality assurance before PR

**Implementation**:
- `ImplementationVerifier` class
- Compare AST to spec requirements
- Check for stubs, TODOs, FIXMEs
- Verify test files exist

---

## New Tools Proposed

### 1. API Inventory Tool

```bash
> /stackshift.api-inventory

Analyzing API endpoints...

REST APIs (23 endpoints):
  GET    /api/users           src/routes/users.ts:12
  GET    /api/users/:id       src/routes/users.ts:45
  POST   /api/users           src/routes/users.ts:78
  DELETE /api/users/:id       src/routes/users.ts:112

GraphQL APIs (1 schema):
  Query.users                 src/graphql/users.ts:25
  Mutation.createUser         src/graphql/users.ts:67

WebSocket Events (5):
  user.connected              src/websocket/events.ts:15
  user.disconnected           src/websocket/events.ts:32
```

### 2. Business Logic Map

```bash
> /stackshift.business-logic

Business Rules Found:

Validation Rules (12):
  • Email format: /^[^@]+@[^@]+\\.[^@]+$/ (src/validators/email.ts:8)
  • Age >= 18 (src/validators/age.ts:15)
  • Password length >= 8 (src/validators/password.ts:22)

Calculations (5):
  • Tax calculation: price * 0.08 (src/cart/tax.ts:45)
  • Shipping cost: weight-based (src/shipping/cost.ts:78)

Authorization Rules (8):
  • Admin only: user.role === 'admin' (src/middleware/admin.ts:12)
  • Owner or admin: user.id === resourceOwnerId || isAdmin (src/middleware/auth.ts:45)
```

### 3. Code-to-Spec Linker

```bash
> /stackshift.link-code

Linking specifications to implementation...

✅ user-authentication.md
   → src/middleware/auth.ts:15 (JWT validation)
   → src/middleware/session.ts:22 (Session check)

⚠️  payment-processing.md
   → src/payment/stripe.ts:45 (Stripe only)
   → Missing: PayPal implementation (mentioned in spec)

❌ notifications.md
   → No implementation found
```

### 4. Architecture Visualizer

```bash
> /stackshift.architecture

Generating architecture diagram from AST...

[Mermaid diagram showing]:
- API layer → Service layer → Data layer
- Middleware chains
- Component hierarchies
- Data flows
- External dependencies
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ AST parser exists
- Add API endpoint extraction
- Add component hierarchy extraction
- Add business logic patterns

### Phase 2: Gear Integration (Week 3-4)
- Gear 1: API inventory
- Gear 2: Auto-extract logic
- Gear 4: Enhanced gap detection

### Phase 3: Validation (Week 5-6)
- Gear 6: Implementation verification
- Test coverage analysis
- Spec-to-code linking

### Phase 4: Advanced Features (Week 7-8)
- Data flow tracing
- Architecture visualization
- Performance pattern detection
- Security vulnerability detection

---

## Technical Architecture

```typescript
// Core AST framework
mcp-server/src/analyzers/
├── utils/
│   ├── ast-parser.ts           # ✅ Exists
│   ├── api-extractor.ts        # New: Extract API endpoints
│   ├── component-analyzer.ts   # New: React/Vue components
│   ├── business-logic-extractor.ts  # New: Business rules
│   └── data-flow-tracer.ts     # New: Trace data flows
├── ast-gap-analyzer.ts         # Enhanced gap analysis
├── ast-validator.ts            # New: Implementation validation
└── ast-architecture.ts         # New: Architecture extraction

// New MCP tools
mcp-server/src/tools/
├── ast-api-inventory.ts        # API endpoint listing
├── ast-business-logic.ts       # Business logic mapping
├── ast-code-linker.ts          # Code-to-spec linking
└── ast-architecture.ts         # Architecture diagrams
```

---

## Benefits Summary

### For Gear 1 (Analysis)
- **Accuracy**: Real API inventory vs. guessing
- **Completeness**: Find all endpoints automatically
- **Speed**: Seconds vs. hours of manual search

### For Gear 2 (Reverse Engineering)
- **Precision**: Extract actual logic, not assumptions
- **Depth**: Understand complex business rules
- **Traceability**: Link requirements to code

### For Gear 4 (Gap Analysis)
- **Granularity**: Not just "exists" but "correct"
- **Evidence**: Show actual code mismatches
- **Confidence**: Higher accuracy in gap detection

### For Gear 6 (Implementation)
- **Quality**: Automated verification
- **Speed**: Instant validation vs. manual review
- **Consistency**: Enforce spec compliance

---

## Example: End-to-End with AST

### Before (Manual)
1. Gear 1: "Found Express.js, assume REST API exists"
2. Gear 2: "Manually read routes folder, document 10/23 endpoints"
3. Gear 4: "Spec says createUser should exist, grep finds it ✅"
4. Gear 6: "Manually review PR, might miss signature mismatch"

### After (AST-Enhanced)
1. Gear 1: "AST found 23 REST endpoints, 5 middleware, 12 validators"
2. Gear 2: "Auto-extracted all 23 endpoint specs with exact signatures"
3. Gear 4: "createUser exists ✅, but missing email param ❌, needs tests ⚠️"
4. Gear 6: "Auto-verified: signature ✅, error handling ✅, tests ❌"

**Result**: 95% accuracy vs. 60%, 10x faster, zero manual counting

---

## Risks & Mitigation

### Risk 1: Parser Complexity
**Mitigation**: Start with common frameworks (Express, Next.js, React), expand gradually

### Risk 2: Multi-Language Support
**Mitigation**: Current Babel parser handles JS/TS. For Python/Go/Rust, add language-specific parsers later

### Risk 3: Performance
**Mitigation**: Cache AST results, parallel processing, incremental parsing

### Risk 4: False Positives
**Mitigation**: Confidence scoring (already exists), manual verification mode

---

## Success Metrics

- **Accuracy**: 95%+ correct gap detection (vs. 60% manual)
- **Speed**: 10x faster analysis (seconds vs. minutes)
- **Completeness**: 100% API/component coverage (vs. 70% manual)
- **Developer Time**: 80% reduction in manual spec writing
- **Quality**: 50% fewer implementation bugs from spec drift

---

## Next Steps

1. **Review this proposal** - Get feedback from team
2. **Prioritize features** - Which AST enhancements provide most value?
3. **Build Phase 1** - API extraction + component analysis
4. **Test on real codebases** - Validate accuracy
5. **Iterate and expand** - Add advanced features based on usage

---

## Questions for Discussion

1. Which Gear would benefit most from AST enhancement?
2. Should we prioritize API extraction or component analysis first?
3. What languages beyond JS/TS should we support?
4. Should AST analysis be opt-in or automatic?
5. How do we handle edge cases (dynamic routes, runtime-generated code)?

---

*This proposal builds on StackShift's existing AST infrastructure to provide deep, automated code understanding throughout the reverse engineering workflow.*
