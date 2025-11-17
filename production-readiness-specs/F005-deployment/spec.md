# F005: Deployment and Publishing Improvements

## Overview

Fix deployment configuration issues to enable npm publishing, GitHub releases, and proper package distribution.

## Problem Statement

Critical deployment blockers:
1. **npm package not published** - Can't install via npm
2. **Package includes unnecessary files** - 112 files instead of ~20
3. **Release workflow disabled** - npm publish step commented out
4. **Missing package configuration** - No `files` array, wrong privacy settings
5. **Version synchronization issues** - Multiple package.json files

### Current State

```bash
# Cannot install from npm
npm install -g stackshift-mcp
# ERROR: 404 Not Found

# Package too large
npm pack --dry-run
# 112 files (should be ~20)
```

## Requirements

### Package Configuration Fixes

#### Fix 1: Root package.json

**File:** `/stackshift/package.json`

```json
{
  "name": "stackshift",
  "version": "1.0.0",
  "private": true,  // ADD THIS
  "description": "Reverse engineering toolkit",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "test": "npm run test:workspace",  // FIX THIS
    "test:workspace": "npm -w mcp-server test",
    "build:mcp": "npm -w mcp-server run build",
    "lint": "npm -w mcp-server run lint",
    "prepare": "husky"
  },
  "workspaces": [  // ADD THIS
    "mcp-server"
  ]
}
```

#### Fix 2: MCP Server package.json

**File:** `/stackshift/mcp-server/package.json`

```json
{
  "name": "stackshift-mcp",
  "version": "1.0.0",
  "description": "StackShift MCP server for AI-powered reverse engineering",
  "main": "./dist/index.js",
  "bin": {
    "stackshift-mcp": "./dist/index.js"
  },
  "files": [  // ADD THIS - CRITICAL
    "dist/**/*",
    "README.md",
    "LICENSE",
    "package.json"
  ],
  "scripts": {
    "build": "tsc && chmod +x dist/index.js",
    "test": "vitest run",
    "prepublishOnly": "npm run build && npm test"  // ADD THIS
  },
  "publishConfig": {  // ADD THIS
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "keywords": [
    "mcp",
    "ai",
    "reverse-engineering",
    "spec-kit",
    "claude"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/jschulte/stackshift.git"
  },
  "bugs": {
    "url": "https://github.com/jschulte/stackshift/issues"
  },
  "homepage": "https://github.com/jschulte/stackshift#readme"
}
```

#### Fix 3: .npmignore Updates

**File:** `/stackshift/mcp-server/.npmignore`

```
# Source and tests
src/
*.test.ts
*.spec.ts
__tests__/
coverage/
.nyc_output/

# Config files
tsconfig.json
eslint.config.js
.prettierrc.json
vitest.config.ts
.husky/

# Development files
*.log
.DS_Store
node_modules/
.git/
.github/
*.tgz

# Build artifacts
*.ts.map
*.js.map
!dist/**/*.map

# Documentation source
docs/
*.md
!README.md
!LICENSE

# State files
.stackshift-state.json
.stackshift/
```

### GitHub Actions Fixes

#### Fix 4: Release Workflow

**File:** `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: |
          npm ci
          cd mcp-server && npm ci

      - name: Run tests
        run: |
          cd mcp-server
          npm test
          npm run lint

      - name: Build
        run: |
          cd mcp-server
          npm run build

      - name: Verify package contents
        run: |
          cd mcp-server
          npm pack --dry-run
          echo "Package contents:"
          tar -tzf *.tgz | head -20

      - name: Publish to npm
        working-directory: ./mcp-server
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            mcp-server/*.tgz
            plugin-package.tar.gz
          generate_release_notes: true
          body_path: CHANGELOG.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Pre-Publishing Checklist

```bash
#!/bin/bash
# pre-publish.sh

echo "Pre-Publishing Checklist for StackShift"
echo "========================================"

# 1. Check versions match
ROOT_VERSION=$(node -p "require('./package.json').version")
MCP_VERSION=$(node -p "require('./mcp-server/package.json').version")

if [ "$ROOT_VERSION" != "$MCP_VERSION" ]; then
  echo "❌ Version mismatch: root=$ROOT_VERSION, mcp=$MCP_VERSION"
  exit 1
else
  echo "✅ Versions match: $ROOT_VERSION"
fi

# 2. Check npm pack size
cd mcp-server
FILES=$(npm pack --dry-run 2>&1 | grep -oE '[0-9]+ files?' | grep -oE '[0-9]+')
cd ..

if [ "$FILES" -gt 30 ]; then
  echo "⚠️  Package contains $FILES files (expected <30)"
  echo "   Check your 'files' array in package.json"
else
  echo "✅ Package size ok: $FILES files"
fi

# 3. Check for CHANGELOG entry
if grep -q "\[$ROOT_VERSION\]" CHANGELOG.md; then
  echo "✅ CHANGELOG has entry for v$ROOT_VERSION"
else
  echo "❌ No CHANGELOG entry for v$ROOT_VERSION"
  exit 1
fi

# 4. Run tests
echo "Running tests..."
cd mcp-server
npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ All tests passing"
else
  echo "❌ Tests failing"
  exit 1
fi
cd ..

# 5. Check npm token
if [ -z "$NPM_TOKEN" ]; then
  echo "⚠️  NPM_TOKEN not set (needed for CI)"
else
  echo "✅ NPM_TOKEN is set"
fi

# 6. Audit
cd mcp-server
VULNS=$(npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical')
if [ "$VULNS" -gt 0 ]; then
  echo "⚠️  $VULNS high/critical vulnerabilities found"
else
  echo "✅ No high/critical vulnerabilities"
fi
cd ..

echo ""
echo "Ready to publish? Run:"
echo "  git tag v$ROOT_VERSION"
echo "  git push origin v$ROOT_VERSION"
```

### npm Publishing Setup

#### Step 1: Create npm Account

```bash
# If you don't have an npm account
npm adduser

# Login
npm login
```

#### Step 2: Generate Token

1. Go to https://www.npmjs.com/settings/[username]/tokens
2. Generate new token (Automation type)
3. Copy token value

#### Step 3: Add to GitHub Secrets

1. Go to https://github.com/jschulte/stackshift/settings/secrets/actions
2. Add new secret: `NPM_TOKEN`
3. Paste token value

#### Step 4: Test Local Publishing

```bash
cd mcp-server

# Dry run
npm publish --dry-run

# Check what will be published
npm pack
tar -tzf stackshift-mcp-*.tgz

# If looks good, cleanup
rm *.tgz
```

### Version Management

#### Versioning Script

**File:** `scripts/version.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error('Usage: node version.js <version>');
  console.error('Example: node version.js 1.0.1');
  process.exit(1);
}

// Update all package.json files
const files = [
  'package.json',
  'mcp-server/package.json',
  'plugin/.claude-plugin/plugin.json'
];

files.forEach(file => {
  const filepath = path.resolve(file);
  if (fs.existsSync(filepath)) {
    const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    content.version = version;
    fs.writeFileSync(filepath, JSON.stringify(content, null, 2) + '\n');
    console.log(`✅ Updated ${file} to v${version}`);
  }
});

console.log('\nNext steps:');
console.log(`1. Update CHANGELOG.md with v${version} entry`);
console.log(`2. Commit: git add -A && git commit -m "chore: release v${version}"`);
console.log(`3. Tag: git tag v${version}`);
console.log(`4. Push: git push && git push --tags`);
```

### Post-Deployment Validation

```bash
#!/bin/bash
# validate-deployment.sh

VERSION=$1

echo "Validating deployment of v$VERSION"
echo "===================================="

# 1. Check npm
echo "Checking npm registry..."
NPM_VERSION=$(npm view stackshift-mcp version 2>/dev/null)

if [ "$NPM_VERSION" = "$VERSION" ]; then
  echo "✅ npm package published: v$NPM_VERSION"
else
  echo "❌ npm package not found or wrong version: $NPM_VERSION"
fi

# 2. Test installation
echo "Testing npm installation..."
npm install -g stackshift-mcp@$VERSION

if command -v stackshift-mcp &> /dev/null; then
  echo "✅ CLI installed successfully"
else
  echo "❌ CLI not found after installation"
fi

# 3. Check GitHub release
echo "Checking GitHub release..."
RELEASE=$(curl -s https://api.github.com/repos/jschulte/stackshift/releases/tags/v$VERSION)

if echo "$RELEASE" | grep -q "\"tag_name\": \"v$VERSION\""; then
  echo "✅ GitHub release created"
else
  echo "❌ GitHub release not found"
fi

# 4. Test npx
echo "Testing npx execution..."
npx -y stackshift-mcp@$VERSION --version

if [ $? -eq 0 ]; then
  echo "✅ npx execution works"
else
  echo "❌ npx execution failed"
fi

echo ""
echo "Deployment validation complete!"
```

## Success Criteria

1. Package publishes to npm successfully
2. Package size <1MB (currently ~300KB expected)
3. Only necessary files included (dist/, README, LICENSE)
4. Can install globally: `npm install -g stackshift-mcp`
5. Can run via npx: `npx stackshift-mcp`
6. GitHub release created with artifacts
7. All versions synchronized

## Dependencies

- npm account and token
- GitHub repository secrets configured
- No new code dependencies

## Non-Goals

- Not implementing private registry
- Not setting up Docker images (yet)
- Not creating GUI installer

## Timeline

- **Configuration fixes:** 2 hours
- **Testing and validation:** 1 hour
- **First publish:** 30 minutes
- **Documentation updates:** 30 minutes
- **Total:** 4 hours

## Rollback Plan

If publication causes issues:

```bash
# Unpublish (within 72 hours)
npm unpublish stackshift-mcp@1.0.0

# Or deprecate
npm deprecate stackshift-mcp@1.0.0 "Contains critical bug"

# Publish patch
npm version patch
npm publish
```

## References

- npm Publishing: https://docs.npmjs.com/packages-and-modules/
- GitHub Actions npm: https://docs.github.com/en/actions/publishing-packages/
- Package.json files field: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files