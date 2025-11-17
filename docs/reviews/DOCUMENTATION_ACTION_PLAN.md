# StackShift Documentation - Action Plan & Templates

**Companion to:** DOCUMENTATION_REVIEW.md
**Purpose:** Specific, copy-paste-ready templates for creating missing documentation

---

## Quick Start: Create These Files First

### 1. CONTRIBUTING.md (CRITICAL - 2-3 hours)

**Location:** `~/git/stackshift/CONTRIBUTING.md`

**Template:**

```markdown
# Contributing to StackShift

Thank you for your interest in contributing to StackShift! This document provides guidelines for participating in the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful of others.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, check the [issue tracker](https://github.com/jschulte/stackshift/issues) to avoid duplicates.

**When reporting a bug, include:**
- Clear description of what doesn't work
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Node.js version)
- Screenshots/logs if applicable

### Suggesting Enhancements

Feature suggestions are welcome! Create an issue with:
- Clear use case and motivation
- How it would benefit users
- Possible implementation approach (optional)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Add tests for new functionality
5. Run: `npm test` and `npm run lint`
6. Commit with clear message: `git commit -m "feat: add your feature"`
7. Push to your fork
8. Open a pull request with description of changes

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/jschulte/stackshift.git
cd stackshift

# Install MCP server dependencies
cd mcp-server
npm install

# Build the project
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Link plugin locally (if testing plugin)
cd ..
./install-local.sh
```

## Code Style

### TypeScript Standards
- Strict mode enabled
- ES2022 target
- Meaningful variable names
- JSDoc for exported functions
- Use ESLint rules (`.eslintrc.js`)

### Commit Messages

Use present tense:
```
✓ feat: add support for Python projects
✓ fix: handle missing configuration file
✓ docs: update installation guide
✓ refactor: simplify path validation
✓ test: add tests for analyze tool

✗ Added support...
✗ Fixed bug where...
```

## Testing Requirements

- **Minimum coverage:** 80% statement coverage
- **Unit tests:** For all business logic
- **Integration tests:** For tool integration
- **Test file location:** `src/**/__tests__/*.test.ts`

### Run Tests

```bash
npm test                  # Run once
npm test -- --watch     # Watch mode
npm run test:coverage   # With coverage report
```

## Before Submitting

- [ ] Tests pass: `npm test`
- [ ] Types check: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Coverage meets 80% minimum
- [ ] Updated relevant documentation
- [ ] Commit message follows convention

## Review Process

1. Maintainer reviews your PR
2. Feedback or approval
3. All checks must pass (tests, types, lint)
4. Merge to main branch

## Questions?

- Open an issue on [GitHub Issues](https://github.com/jschulte/stackshift/issues)
- Start a [Discussion](https://github.com/jschulte/stackshift/discussions)
- Check [README](README.md) for overview

---

**Thank you for contributing!**
```

---

### 2. SECURITY.md (CRITICAL - 2 hours)

**Location:** `~/git/stackshift/SECURITY.md`

**Template:**

```markdown
# Security Policy

StackShift takes security seriously. This document describes our security policy and how to report vulnerabilities.

## Reporting a Vulnerability

**Do not open public issues for security vulnerabilities.**

### Responsible Disclosure

If you discover a security vulnerability, please email: **[YOUR-SECURITY-EMAIL@example.com]**

Include:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Your contact information (optional)

**Response Timeline:**
- Acknowledgment within 48 hours
- Status update within 1 week
- Fix deployed within 30 days (or roadmap if longer)

## Supported Versions

Security updates are provided for:

| Version | Node.js | Status | Security Updates |
|---------|---------|--------|-----------------|
| 1.1.x   | 18+     | Current | Yes |
| 1.0.x   | 18+     | Legacy | Limited |
| < 1.0   | 18+     | Obsolete | No |

## Known Limitations

### Security Mitigations

StackShift implements the following security measures:

1. **Path Traversal Prevention** (CWE-22)
   - All file paths validated against directory traversal
   - Symlink attacks prevented
   - Use `SecurityValidator.validateDirectory()`

2. **Command Injection Prevention** (CWE-78)
   - No shell command execution
   - All file operations use Node.js APIs
   - Input sanitization for user-provided paths

3. **Concurrency Safety** (CWE-367)
   - Atomic state file operations
   - Lock mechanism for `.stackshift-state.json`
   - Race condition protection in file writes

### Dependencies

StackShift minimizes dependencies:
- Core dependency: `@modelcontextprotocol/sdk@^1.0.0`
- Dev dependencies: Test and build tools only

## Security Best Practices

### For Users

1. **Keep Updated**
   - Update StackShift regularly
   - Monitor release notes for security fixes

2. **Use Safely**
   - Only run on trusted codebases
   - Review generated specifications before using
   - Keep API keys and credentials out of analyzed code

3. **Protect Configuration**
   - `.stackshift-state.json` contains project metadata
   - Store in version control or encrypted
   - Don't share state files across projects

4. **Plugin Security**
   - Install from official marketplace only
   - Verify plugin source before installing
   - Review plugin code before granting permissions

### For Contributors

1. **Code Review**
   - All security-sensitive code reviewed by maintainers
   - Security tests required before merge

2. **Dependencies**
   - Minimize external dependencies
   - Regular security audits (`npm audit`)
   - Update dependencies promptly

3. **Testing**
   - Fuzz testing for input validation
   - Path traversal tests
   - Command injection tests

## Security Features

### Input Validation
- All user input validated against whitelist rules
- File paths checked for directory traversal
- String length limits to prevent DoS

### Error Handling
- Errors don't leak sensitive information
- Stack traces sanitized in user output
- Logging doesn't capture credentials

### State Management
- State files use atomic writes
- No sensitive data stored in state
- State file permissions checked

## Incident Response

If a vulnerability is discovered in a released version:

1. Security fix is developed
2. Patch version released (e.g., 1.1.1)
3. Security advisory published
4. Users notified via release notes

## Compliance

StackShift follows:
- OWASP Top 10 security principles
- CWE/SANS Top 25 mitigation strategies
- Node.js security best practices

## Questions?

Email: **[YOUR-SECURITY-EMAIL@example.com]**

For non-security issues, use [GitHub Issues](https://github.com/jschulte/stackshift/issues).

---

**Last Updated:** [DATE]
```

---

### 3. CHANGELOG.md (CRITICAL - 1-2 hours)

**Location:** `~/git/stackshift/CHANGELOG.md`

**Template:**

```markdown
# Changelog

All notable changes to StackShift are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- (Future features)

### Changed
- (Breaking changes)

### Fixed
- (Bug fixes)

### Removed
- (Deprecated features)

---

## [1.1.0] - 2025-11-16

### Added
- Test infrastructure resolution
- ESLint and Prettier configuration
- Husky pre-commit hooks
- Comprehensive test coverage (78.66%)
- Security fixes for v1.0.0

### Changed
- Improved test suite organization
- Enhanced code quality tooling

### Fixed
- SecurityValidator workspace restriction
- Race condition in state file operations
- Path traversal vulnerability (CWE-22)
- Command injection prevention (CWE-78)
- Concurrency safety (CWE-367)

### Removed
- (None)

---

## [1.0.0] - 2024-11-15

### Added
- Initial release of StackShift
- 6-gear reverse engineering process
- Claude Code plugin with 6 interactive skills
- MCP server with 7 tools and 3 resources
- Web bootstrap for browser usage
- Greenfield and Brownfield workflows
- State management and progress tracking
- GitHub Spec Kit integration
- Cruise Control mode (automated workflow)
- Comprehensive documentation

### Changed
- (N/A - Initial release)

### Fixed
- (N/A - Initial release)

### Removed
- (N/A - Initial release)

---

## Version Timeline

| Version | Release Date | Node.js | Status |
|---------|-------------|---------|--------|
| 1.1.0 | 2025-11-16 | 18+ | Current |
| 1.0.0 | 2024-11-15 | 18+ | Legacy |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting changes.

## Security

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

---

**[Latest Release](https://github.com/jschulte/stackshift/releases)**
```

---

## Next Priority: Developer Documentation

### 4. DEVELOPMENT.md (HIGH - 2-3 hours)

**Location:** `~/git/stackshift/docs/developer-guides/DEVELOPMENT.md` (create folder)

**Key Sections:**

```markdown
# StackShift Development Guide

## Environment Setup

### Prerequisites
- Node.js 18+ (check with `node -v`)
- npm 9+ (check with `npm -v`)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/jschulte/stackshift.git
cd stackshift

# Install dependencies
cd mcp-server
npm install
cd ..
```

## Project Structure

```
stackshift/
├── plugin/              # Claude Code plugin
│   ├── skills/         # 6 interactive skills
│   ├── templates/      # Spec templates
│   └── scripts/        # State management
├── mcp-server/         # MCP server (TypeScript)
│   ├── src/
│   │   ├── tools/      # 7 MCP tools
│   │   ├── resources/  # 3 MCP resources
│   │   └── utils/      # Shared utilities
│   ├── __tests__/      # Test suite
│   └── package.json
├── web/                # Web bootstrap
├── docs/               # Documentation
└── prompts/            # Original prompts (reference)
```

## Running Tests

```bash
cd mcp-server

# Run all tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm run test:coverage

# Specific test file
npm test -- tools/analyze
```

## Linting & Formatting

```bash
# Check linting
npm run lint

# Fix linting
npm run lint -- --fix

# Check formatting
npm run format -- --check

# Apply formatting
npm run format
```

## Building

```bash
cd mcp-server
npm run build

# Creates: dist/index.js
```

## Testing Locally

### Testing the Plugin

```bash
# Link plugin to Claude Code
./install-local.sh

# Restart Claude Code
# The plugin should appear in /plugin list
```

### Testing the MCP Server

```bash
# In VSCode settings.json, add:
{
  "mcp.servers": {
    "stackshift-dev": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

## Common Tasks

### Add a New Test

```bash
# Create test file
touch mcp-server/src/__tests__/tools/my-tool.test.ts

# Structure:
// import { describe, it, expect } from 'vitest';
// describe('MyTool', () => {
//   it('should do something', () => {
//     expect(true).toBe(true);
//   });
// });
```

### Add a New Tool

1. Create tool file: `mcp-server/src/tools/my-tool.ts`
2. Export tool function
3. Add to tools index: `mcp-server/src/tools/index.ts`
4. Register in server: `mcp-server/src/index.ts`
5. Add tests: `mcp-server/src/__tests__/tools/my-tool.test.ts`

### Debug Mode

```bash
# Run with debug logging
DEBUG=stackshift:* npm test

# Or in code:
console.log('Debug info:', variable);
```

## Troubleshooting

**Tests failing after changes?**
- Run: `npm test -- --reporter=verbose`
- Check type errors: `npx tsc --noEmit`

**Plugin not loading?**
- Restart Claude Code completely
- Check: `~/.claude/plugins/local/stackshift` exists
- Re-run: `./install-local.sh`

**MCP server not connecting?**
- Check configuration path is absolute
- Verify: `node dist/index.js` runs without errors
- Check error logs in VSCode

## Before Submitting PR

```bash
# Full test suite
npm test

# Coverage check
npm run test:coverage

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format
```

All must pass before PR submission!
```

---

### 5. TESTING.md (HIGH - 2-3 hours)

**Location:** `~/git/stackshift/docs/developer-guides/TESTING.md`

**Key Sections:**

```markdown
# StackShift Testing Guide

## Overview

- **Framework:** Vitest (Jest-compatible)
- **Coverage Tool:** V8 (built-in)
- **Current Coverage:** 78.66% (target: 80%+)
- **Test Command:** `npm test`

## Running Tests

```bash
# All tests
npm test

# Watch mode (re-run on changes)
npm test -- --watch

# Specific file
npm test -- tools/analyze

# Coverage report
npm run test:coverage

# Verbose output
npm test -- --reporter=verbose
```

## Test Structure

### File Location
Tests are in `src/__tests__/` mirroring source structure:

```
src/
├── tools/
│   ├── analyze.ts
│   └── __tests__/
│       └── analyze.test.ts
├── utils/
│   ├── validation.ts
│   └── __tests__/
│       └── validation.test.ts
```

### Test File Format

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('MyTool', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should handle error case', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

## Writing Tests

### Unit Tests (Business Logic)

Test individual functions with various inputs:

```typescript
describe('validateDirectory', () => {
  it('accepts valid directory paths', () => {
    expect(validateDirectory('/valid/path')).toBe(true);
  });

  it('rejects path traversal', () => {
    expect(validateDirectory('../../../etc/passwd')).toBe(false);
  });

  it('handles null input', () => {
    expect(() => validateDirectory(null)).toThrow('Path required');
  });
});
```

### Integration Tests (Multiple Components)

Test tool integration with other tools:

```typescript
describe('analyze + state-manager integration', () => {
  it('creates state file after analysis', async () => {
    const result = await analyzeCodebase('/test/project');
    expect(result.stateCreated).toBe(true);
    expect(fs.existsSync('.stackshift-state.json')).toBe(true);
  });
});
```

### Security Tests (Input Validation)

Test security constraints:

```typescript
describe('Security: Path Traversal Prevention', () => {
  it('prevents relative path traversal', () => {
    const paths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '/tmp/../../../etc/passwd',
    ];
    paths.forEach(path => {
      expect(() => validateDirectory(path)).toThrow();
    });
  });
});
```

## Coverage Goals

### By Component

| Component | Target | Current |
|-----------|--------|---------|
| Tools (business logic) | 95%+ | 98.49% ✓ |
| Utils (helpers) | 95%+ | 95.62% ✓ |
| Resources | 80%+ | 0% ⚠️ |
| Server (MCP setup) | 60%+ | 0% ⚠️ |
| **Overall** | **80%+** | **78.66%** |

### Priority: Improve Resources and Server

Resources and Server (MCP infrastructure) could use tests, but are lower priority than business logic.

## Mocking Patterns

### Mock File System

```typescript
import { vi } from 'vitest';
import fs from 'fs';

// Mock fs.readFileSync
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => '{}'),
}));
```

### Mock External Functions

```typescript
import { analyzeDirectory } from '../tools/analyze';

const mockAnalyze = vi.fn(() => ({
  techStack: 'node.js',
}));

vi.mock('../tools/analyze', () => ({
  analyzeDirectory: mockAnalyze,
}));
```

## Before Committing

1. **Run full test suite:**
   ```bash
   npm test
   ```

2. **Check coverage:**
   ```bash
   npm run test:coverage
   # Coverage must be >= 80%
   ```

3. **Check for broken tests:**
   ```bash
   npm test -- --reporter=verbose
   ```

## Continuous Integration

Tests run automatically on:
- Push to main/develop
- Pull requests
- With Node.js 18.x and 20.x

Coverage reports uploaded to Codecov.
```

---

## How to Use These Templates

1. **Copy the template content** for each missing file
2. **Customize** with your specific information:
   - Replace email addresses with your contact info
   - Adjust version numbers to current
   - Update dates as needed
   - Modify tool/resource names if different
3. **Create the file** at the specified location
4. **Review** for accuracy
5. **Commit** with message: `docs: add [FILENAME]`

---

## File Creation Checklist

### CRITICAL (Week 1)

- [ ] **CONTRIBUTING.md** - Enable community contributions
  - Location: Root directory
  - Time: 2-3 hours
  - Copy from: Template above

- [ ] **SECURITY.md** - Security policy
  - Location: Root directory
  - Time: 2 hours
  - Copy from: Template above
  - Custom: Add your email for security@

- [ ] **CHANGELOG.md** - Version tracking
  - Location: Root directory
  - Time: 1-2 hours
  - Copy from: Template above
  - Custom: Update dates and version info

### HIGH (Week 1-2)

- [ ] **DEVELOPMENT.md** - Setup guide
  - Location: `docs/developer-guides/DEVELOPMENT.md`
  - Time: 2-3 hours
  - Copy from: Template above
  - Create folder: `docs/developer-guides/`

- [ ] **TESTING.md** - Testing guide
  - Location: `docs/developer-guides/TESTING.md`
  - Time: 2-3 hours
  - Copy from: Template above

### Additional High Priority

- [ ] **API_REFERENCE.md**
  - Location: `docs/reference/API_REFERENCE.md`
  - Time: 3-4 hours
  - Content: Document all 7 MCP tools + parameters

- [ ] **TROUBLESHOOTING.md**
  - Location: `docs/user-guides/TROUBLESHOOTING.md`
  - Time: 2-3 hours
  - Content: Common issues and solutions

---

## Quick Wins (Start Here)

If short on time, do these first:

1. **CONTRIBUTING.md** (2 hours)
   - Most important for community
   - Uses provided template

2. **SECURITY.md** (1.5 hours)
   - Critical for public project
   - Uses provided template

3. **Fix README.md** (1 hour)
   - Add table of contents
   - Fix broken links
   - No template needed

4. **Complete MCP README** (1.5 hours)
   - Finish the tool reference section
   - No template needed

Total Quick Wins: **6 hours** to significantly improve documentation!

---

## Validation Checklist

After creating files, verify:

- [ ] All files use Markdown (.md)
- [ ] File names are UPPERCASE (CONTRIBUTING.md)
- [ ] All links point to correct files
- [ ] No broken internal references
- [ ] Terminology is consistent
- [ ] Examples are accurate
- [ ] Contact information is correct
- [ ] Git paths are absolute or relative to root
- [ ] No sensitive information included

---

## Additional Resources

### Markdown Best Practices
- Use headings: # H1, ## H2, ### H3
- Code blocks: \`\`\`language
- Links: [text](url)
- Lists: - item or 1. item

### Documentation Standards
- [Google Style Guide](https://developers.google.com/style)
- [Microsoft Manual of Style](https://docs.microsoft.com/en-us/style-guide/)
- [Keep a Changelog](https://keepachangelog.com/)

### Tools
- [Markdown Linter](https://github.com/igorshubovych/markdownlint-cli)
- [Link Validator](https://github.com/tcort/markdown-link-check)
- [Spell Checker](https://github.com/streetsidesoftware/cspell)

---

**Next Steps:** Pick one file, use the template, customize, create, and commit!

*After creating critical docs, focus on API reference and then architectural documentation.*
