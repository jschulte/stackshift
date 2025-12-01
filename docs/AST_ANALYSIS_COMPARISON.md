# AST Analysis Comparison

## What Level of AST Analysis Does StackShift Perform?

### Our Approach: **Semantic Analysis**

StackShift performs **semantic-level AST analysis** using Babel, focusing on understanding what code does and how it relates to specifications.

---

## Analysis Levels (Lowest to Highest)

### Level 1: **Lexical Analysis** (Tokenization)
**What it does**: Breaks code into tokens (keywords, identifiers, operators)

**Tools**: Lexers, basic parsers

**Example**:
```javascript
function getUserById(id) { ... }
```
→ Tokens: `function`, `getUserById`, `(`, `id`, `)`, `{`, `...`, `}`

❌ **We don't stop here**

---

### Level 2: **Syntactic Analysis** (Parsing)
**What it does**: Builds Abstract Syntax Tree structure

**Tools**:
- Tree-sitter (multi-language, fast)
- Esprima (JavaScript)
- Acorn (JavaScript)

**Example**:
```javascript
function getUserById(id) { ... }
```
→ AST Node: `FunctionDeclaration { name: "getUserById", params: [...] }`

✅ **We do this** (using Babel parser)

---

### Level 3: **Semantic Analysis** (Understanding) ← **StackShift is here**
**What it does**: Understands what code means and its relationships

**StackShift uses**:
- **@babel/parser** - Parse JS/TS into AST
- **@babel/types** - Validate and manipulate AST nodes
- **Custom analyzers** - Extract business meaning

**What we extract**:
```javascript
// Example code
router.post('/users', authenticate, async (req, res) => {
  const { email } = req.body;
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  await User.create({ email });
});
```

**Our semantic analysis extracts**:
```json
{
  "type": "api_endpoint",
  "method": "POST",
  "path": "/users",
  "middleware": ["authenticate"],
  "businessRules": [
    {
      "type": "validation",
      "field": "email",
      "function": "validateEmail",
      "errorCode": 400,
      "errorMessage": "Invalid email"
    }
  ],
  "dataOperations": [
    {
      "type": "create",
      "model": "User",
      "fields": ["email"]
    }
  ],
  "status": "implemented"
}
```

✅ **This is our level** - understanding business logic, not just syntax

---

### Level 4: **Type System Analysis** (Deep Type Checking)
**What it does**: Full type inference, flow analysis, type checking

**Tools**:
- TypeScript Compiler API (tsc)
- Flow
- Hindley-Milner type systems

**Example**:
```typescript
function process<T>(items: T[]): T[] { ... }
```
→ Infers: Generic type T, array invariance, return type constraints

⚠️ **We partially do this** (extract TypeScript annotations, but don't do full type inference)

---

### Level 5: **Program Analysis** (Advanced Static Analysis)
**What it does**: Data flow, control flow, taint analysis, symbolic execution

**Tools**:
- SonarQube (security + code quality)
- Coverity (deep static analysis)
- CodeQL (security queries)
- Abstract interpretation engines

**Example**: Track data flow from user input → validation → database

⚠️ **We do simplified version** (track data flow within functions, not across program)

---

## Comparison to Other Tools

### Tree-sitter
**Level**: Syntax (Level 2)
**Pros**: Multi-language, incremental, very fast
**Cons**: Low-level, no semantic understanding
**StackShift vs**: We use Babel (JS/TS specific but semantic-aware)

### TypeScript Compiler API
**Level**: Type System (Level 4)
**Pros**: Complete type information, full inference
**Cons**: TypeScript only, slower, complex API
**StackShift vs**: We extract TS annotations but don't do full inference (trade-off for speed)

### ESLint/TSLint
**Level**: Syntax + Simple Semantics (Level 2.5)
**Pros**: Rule-based, extensible, fast
**Cons**: Pattern matching, not deep analysis
**StackShift vs**: We do structural analysis (functions, classes, APIs) not just rules

### SonarQube
**Level**: Program Analysis (Level 5)
**Pros**: Security, code quality, multi-language
**Cons**: Heavy, complex, enterprise-focused
**StackShift vs**: We focus on spec-to-code gaps, not security/quality

### jscodeshift/ast-types
**Level**: Syntax (Level 2-3)
**Pros**: Code transformation, codemod support
**Cons**: Transformation-focused, not analysis
**StackShift vs**: We analyze for specs, not transform code

### Language Server Protocol (LSP)
**Level**: Semantic + Type System (Level 3-4)
**Pros**: IDE features, autocomplete, go-to-definition
**Cons**: Editor-focused, not specification-focused
**StackShift vs**: We extract for docs/specs, not editor features

---

## What Makes StackShift Unique

### 1. **Specification-Focused Analysis**
Other tools analyze for:
- Security (SonarQube)
- Code quality (ESLint)
- Refactoring (jscodeshift)
- IDE features (LSP)

**StackShift analyzes for**:
- Spec-to-code gap detection
- Implementation status verification
- Business logic extraction
- Reverse engineering documentation

### 2. **Business Logic Extraction**
```javascript
// Code:
if (user.age < 18) throw new Error('Too young');

// StackShift extracts:
{
  "businessRule": "Age must be >= 18",
  "type": "validation",
  "field": "age",
  "operator": ">=",
  "value": 18
}
```

Other tools see: `BinaryExpression` with `<` operator
StackShift sees: **Business rule about age validation**

### 3. **Stub Detection**
```javascript
function resetPassword() {
  return "TODO: Implement password reset";
}
```

StackShift detects:
- ✅ Function exists (syntax level)
- ❌ It's a stub (semantic level)
- ⚠️ Returns placeholder string (business level)

Other tools would say: "Function implemented" ✅
StackShift says: "Stub detected" ⚠️

### 4. **API Inventory**
```javascript
app.get('/users/:id', auth, handler);
app.post('/users', rateLimit, handler);
```

StackShift extracts:
```json
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/users/:id",
      "middleware": ["auth"],
      "status": "implemented"
    },
    {
      "method": "POST",
      "path": "/users",
      "middleware": ["rateLimit"],
      "status": "partial"  // if handler is stub
    }
  ]
}
```

Most AST tools don't understand routing frameworks.

---

## Technical Details

### Babel Parser Configuration

```typescript
const ast = parse(code, {
  sourceType: 'module',
  plugins: [
    'typescript',
    'jsx',
    'decorators-legacy',
    'classProperties',
    'objectRestSpread',
    'asyncGenerators',
    'dynamicImport',
    'optionalChaining',
    'nullishCoalescingOperator',
  ],
  errorRecovery: true,  // Continue parsing despite errors
});
```

**Why Babel**:
- ✅ Industry standard for JS/TS parsing
- ✅ Supports all modern syntax (JSX, decorators, etc.)
- ✅ Error recovery (partial AST if code has syntax errors)
- ✅ Well-documented, stable API
- ✅ Used by major tools (Webpack, Parcel, Metro)

### What We Extract

**From AST Nodes**:
- `FunctionDeclaration` → Function signatures
- `ClassDeclaration` → Classes with methods/properties
- `ImportDeclaration` → Dependencies
- `ExportDeclaration` → Public API surface
- `CallExpression` → Framework-specific patterns (e.g., `app.get()` for Express)

**Business Semantics**:
- Validation patterns (if statements checking values)
- Data operations (database calls)
- Error handling (try/catch, error returns)
- Authentication/authorization (middleware)
- Stub detection (empty functions, TODO strings)

---

## Performance

**Single file parsing**: ~10-50ms (depends on file size)
**Full codebase**: Depends on size, but parallelized

**Our approach**:
1. Run AST analysis ONCE upfront (Gear 1)
2. Save to `.stackshift-analysis/` files
3. All other gears read from cache (instant)
4. Re-run if cache stale (> 1 hour old)

**Comparison**:
- Tree-sitter: Faster (but less semantic info)
- TypeScript compiler: Slower (but more type info)
- SonarQube: Much slower (but more comprehensive)

---

## Limitations

### What We DON'T Do (Yet)

❌ **Full type inference**: We extract TS annotations, but don't infer types
❌ **Cross-file data flow**: We track within functions, not across files
❌ **Security analysis**: We don't check for vulnerabilities
❌ **Performance analysis**: We don't detect performance issues
❌ **Multi-language**: Currently JS/TS only (no Python, Go, Rust, etc.)

### Future Enhancements

Could add:
- Language Server Protocol integration (full type info)
- Multi-language support (Tree-sitter for Go/Rust/Python)
- Security analysis (CodeQL-style queries)
- Performance pattern detection

---

## Summary

**StackShift AST Analysis Level**: **Semantic Analysis (Level 3)**

**Strengths**:
- ✅ Understands business logic and patterns
- ✅ Spec-to-code gap detection
- ✅ API inventory and routing analysis
- ✅ Stub and incomplete implementation detection
- ✅ Fast enough for real-time use
- ✅ Caching for efficiency

**Compared to**:
- **More than**: Tree-sitter, Esprima, Acorn (pure syntax)
- **Similar to**: ESLint semantic rules, LSP analysis
- **Less than**: TypeScript compiler (type inference), SonarQube (security)

**Sweet spot**: Deep enough to understand code semantics, fast enough to run on every project, focused enough to generate useful specs.

**Perfect for**: Reverse engineering, spec generation, gap analysis, implementation verification.
