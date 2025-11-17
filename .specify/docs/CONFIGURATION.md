# Configuration Reference

Complete configuration reference for the Spec Sync system.

## Configuration Files

### File Locations

1. **Default config** (`.specify/hooks/modules/config.sh`)
   - Hardcoded defaults
   - Always loaded first

2. **Project config** (`.specify/config/sync-rules.json`)
   - Version controlled
   - Shared across team
   - Overrides defaults

3. **Local config** (`.specify/config/sync-rules.local.json`)
   - Git-ignored
   - User-specific overrides
   - Highest precedence (except env vars)

4. **Environment variables**
   - Runtime overrides
   - Highest precedence
   - Prefix: `SPEC_SYNC_*`

### Precedence Order

```
defaults < project config < local config < environment variables
```

## Configuration Schema

### Complete Example

```json
{
  "mode": "strict",
  "autoFix": false,
  "requireApproval": true,
  "fileMappings": {
    "src/cli/**/*.ts": [
      "production-readiness-specs/F001-cli/spec.md"
    ],
    "src/features/auth/**": [
      "production-readiness-specs/F002-auth/spec.md"
    ]
  },
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.test.js",
    "**/*.spec.js",
    "**/node_modules/**",
    "**/__tests__/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**"
  ],
  "rules": [
    {
      "name": "API changes require spec updates",
      "id": "api_exports",
      "filePattern": "src/**/*.{ts,js}",
      "changePattern": "^[+-]\\s*export\\s+(function|class|interface|type|const)",
      "requiresSpecUpdate": true,
      "specSections": ["API Reference", "User Stories"],
      "severity": "error",
      "enabled": true,
      "priority": 100
    },
    {
      "name": "Feature additions require spec updates",
      "id": "feature_additions",
      "filePattern": "src/features/**/*",
      "changeType": "added",
      "requiresSpecUpdate": true,
      "specSections": ["User Stories", "Functional Requirements"],
      "severity": "error",
      "enabled": true,
      "priority": 90
    },
    {
      "name": "Internal refactoring allowed",
      "id": "internal_refactor",
      "filePattern": "src/**/internal/**",
      "requiresSpecUpdate": false,
      "severity": "info",
      "enabled": true,
      "priority": 50
    }
  ],
  "exemptions": {
    "branches": ["main", "release/*"],
    "users": ["bot@example.com", "ci@example.com"],
    "emergencyOverride": true
  },
  "timeout": 30000,
  "parallel": true,
  "maxParallel": 4
}
```

## Core Settings

### mode

**Type:** `"strict" | "lenient" | "off"`
**Default:** `"lenient"`
**Env var:** `SPEC_SYNC_MODE`

Controls validation behavior:

- **`strict`**: Blocks git push when validation fails
- **`lenient`**: Shows warnings but allows push
- **`off`**: Disables validation entirely

**Example:**

```json
{
  "mode": "strict"
}
```

**Environment override:**

```bash
export SPEC_SYNC_MODE=lenient
```

### autoFix

**Type:** `boolean`
**Default:** `false`
**Env var:** `SPEC_SYNC_AUTO_FIX`

Enable AI-powered automatic spec updates.

**Requirements:**
- `ANTHROPIC_API_KEY` environment variable
- Claude API access

**Example:**

```json
{
  "autoFix": true,
  "requireApproval": true
}
```

**Environment override:**

```bash
export SPEC_SYNC_AUTO_FIX=true
```

### requireApproval

**Type:** `boolean`
**Default:** `true`

When `autoFix` is enabled, controls whether user approval is required before applying AI-generated updates.

- **`true`**: Interactive mode, prompts for approval
- **`false`**: Headless mode, auto-applies updates

**Note:** In CI environments (when `$CI` is set), approval is automatically skipped.

**Example:**

```json
{
  "autoFix": true,
  "requireApproval": false
}
```

## File Mapping

### fileMappings

**Type:** `Record<string, string[]>`
**Default:** `{}`

Explicitly map code files or patterns to specification files.

**Supports:**
- Exact file paths
- Glob patterns
- Multiple specs per file

**Example:**

```json
{
  "fileMappings": {
    "src/cli/index.ts": [
      "production-readiness-specs/F001-cli/spec.md"
    ],
    "src/features/auth/**": [
      "production-readiness-specs/F002-auth/spec.md",
      "production-readiness-specs/F003-security/spec.md"
    ],
    "src/api/**/*.ts": [
      "production-readiness-specs/F004-api/spec.md"
    ]
  }
}
```

**Glob patterns:**
- `*`: Matches any characters except `/`
- `**`: Matches any characters including `/`
- `{ts,js}`: Matches either `ts` or `js`
- `[0-9]`: Matches any digit

### ignorePatterns

**Type:** `string[]`
**Default:** See below

Files matching these patterns are excluded from validation.

**Default patterns:**

```json
{
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.ts",
    "**/*.spec.js",
    "**/node_modules/**",
    "**/__tests__/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**"
  ]
}
```

**Additional patterns:**

```json
{
  "ignorePatterns": [
    "**/*.test.ts",
    "src/generated/**",
    "src/vendor/**",
    "**/migrations/**"
  ]
}
```

## Validation Rules

### rules

**Type:** `Rule[]`
**Default:** `[]` (built-in heuristics used)

Custom validation rules that define which code changes require spec updates.

### Rule Schema

```typescript
interface Rule {
  name: string;              // Human-readable name
  id: string;                // Unique identifier
  filePattern: string;       // Glob pattern
  changePattern?: string;    // Regex for code changes
  changeType?: string;       // Git change type
  requiresSpecUpdate: boolean;
  specSections?: string[];   // Suggested spec sections
  severity: "error" | "warning" | "info";
  enabled: boolean;
  priority: number;          // Higher = matched first
}
```

### Rule Properties

#### name

**Type:** `string`
**Required:** Yes

Human-readable description of the rule.

**Example:**

```json
{
  "name": "API changes require spec updates"
}
```

#### id

**Type:** `string`
**Required:** Yes

Unique identifier for the rule (used in logs and debugging).

**Example:**

```json
{
  "id": "api_exports"
}
```

#### filePattern

**Type:** `string` (glob)
**Required:** Yes

Glob pattern matching files this rule applies to.

**Examples:**

```json
{
  "filePattern": "src/**/*.ts"                    // All .ts files
}
```

```json
{
  "filePattern": "src/**/*.{ts,js}"               // All .ts and .js files
}
```

```json
{
  "filePattern": "src/features/**"                // All files in features/
}
```

#### changePattern

**Type:** `string` (regex)
**Required:** No

Regular expression matching specific code changes within the diff.

**Note:** Regex is applied line-by-line to the git diff output.

**Examples:**

**Detect export changes:**

```json
{
  "changePattern": "^[+-]\\s*export\\s+(function|class|interface|type|const)"
}
```

**Detect CLI commands:**

```json
{
  "changePattern": "^[+-]\\s*(program\\.command|yargs\\.|commander\\.)"
}
```

**Detect database schema:**

```json
{
  "changePattern": "^[+-]\\s*(CREATE TABLE|ALTER TABLE|DROP TABLE)"
}
```

#### changeType

**Type:** `"added" | "modified" | "deleted"`
**Required:** No

Match files by git change type.

**Example:**

```json
{
  "filePattern": "src/features/**",
  "changeType": "added",
  "requiresSpecUpdate": true
}
```

#### requiresSpecUpdate

**Type:** `boolean`
**Required:** Yes

Whether this rule requires spec updates when matched.

- **`true`**: Spec update required (validation fails if spec outdated)
- **`false`**: Spec update not required (validation passes)

#### specSections

**Type:** `string[]`
**Required:** No

Suggested sections in the spec that should be updated.

**Used by auto-fix** to focus AI-generated updates.

**Example:**

```json
{
  "specSections": ["API Reference", "User Stories", "Configuration"]
}
```

#### severity

**Type:** `"error" | "warning" | "info"`
**Required:** Yes

Severity level for validation failures.

- **`error`**: Shown in red, blocks push in strict mode
- **`warning`**: Shown in yellow, never blocks push
- **`info`**: Shown in blue, informational only

**Example:**

```json
{
  "severity": "error"
}
```

#### enabled

**Type:** `boolean`
**Default:** `true`

Whether this rule is enabled.

**Use case:** Temporarily disable rules without deleting them.

**Example:**

```json
{
  "enabled": false
}
```

#### priority

**Type:** `number`
**Default:** `50`

Priority for rule matching (higher values matched first).

**Use case:** Ensure more specific rules match before generic ones.

**Example:**

```json
{
  "priority": 100
}
```

**Recommended priorities:**
- `100-90`: Critical rules (API changes, breaking changes)
- `89-70`: Important rules (feature additions, CLI)
- `69-50`: Normal rules (configuration, schema)
- `49-30`: Lenient rules (docs, internal)
- `29-10`: Informational rules

### Rule Examples

**API Export Changes:**

```json
{
  "name": "API changes require spec updates",
  "id": "api_exports",
  "filePattern": "src/**/*.{ts,js}",
  "changePattern": "^[+-]\\s*export\\s+(function|class|interface|type|const)",
  "requiresSpecUpdate": true,
  "specSections": ["API Reference"],
  "severity": "error",
  "enabled": true,
  "priority": 100
}
```

**CLI Commands:**

```json
{
  "name": "CLI command changes require docs",
  "id": "cli_commands",
  "filePattern": "src/cli/**/*.{ts,js}",
  "changePattern": "^[+-]\\s*(program\\.command|yargs\\.|commander\\.)",
  "requiresSpecUpdate": true,
  "specSections": ["CLI Reference", "User Guide"],
  "severity": "error",
  "enabled": true,
  "priority": 95
}
```

**Database Migrations:**

```json
{
  "name": "Database schema changes require spec updates",
  "id": "database_schema",
  "filePattern": "**/migrations/**/*.{ts,js,sql}",
  "requiresSpecUpdate": true,
  "specSections": ["Data Model", "Architecture"],
  "severity": "error",
  "enabled": true,
  "priority": 95
}
```

**Configuration Changes:**

```json
{
  "name": "Configuration changes",
  "id": "config_changes",
  "filePattern": "**/{config,settings}/**/*.{ts,js,json}",
  "changePattern": "^[+-]\\s*(export|const|let|var)\\s+\\w+Config",
  "requiresSpecUpdate": true,
  "specSections": ["Configuration", "Deployment"],
  "severity": "warning",
  "enabled": true,
  "priority": 70
}
```

**Internal Refactoring (Allowed):**

```json
{
  "name": "Internal refactoring doesn't need specs",
  "id": "internal_refactor",
  "filePattern": "src/**/internal/**",
  "requiresSpecUpdate": false,
  "severity": "info",
  "enabled": true,
  "priority": 50
}
```

## Exemptions

### exemptions.branches

**Type:** `string[]`
**Default:** `[]`

Branches exempted from validation.

**Supports:** Exact names and glob patterns.

**Example:**

```json
{
  "exemptions": {
    "branches": [
      "main",
      "release/*",
      "hotfix/*"
    ]
  }
}
```

**Use cases:**
- Skip validation on protected branches (handled by PR reviews)
- Allow direct pushes to release branches
- Exempt bot/automation branches

### exemptions.users

**Type:** `string[]`
**Default:** `[]`

Users exempted from validation (by git email).

**Example:**

```json
{
  "exemptions": {
    "users": [
      "bot@example.com",
      "ci@example.com",
      "dependabot[bot]@users.noreply.github.com"
    ]
  }
}
```

**Use cases:**
- Exempt bots (Dependabot, Renovate)
- Exempt CI users
- Exempt specific developers (use sparingly!)

### exemptions.emergencyOverride

**Type:** `boolean`
**Default:** `true`

Whether to allow emergency bypass via `SKIP_SPEC_SYNC=1`.

**Example:**

```json
{
  "exemptions": {
    "emergencyOverride": false
  }
}
```

**When to disable:**
- Enforce strict spec synchronization (no bypasses)
- Production-critical projects
- Compliance requirements

## Performance Settings

### timeout

**Type:** `number` (milliseconds)
**Default:** `30000`

Maximum time for validation to complete.

**Example:**

```json
{
  "timeout": 60000
}
```

### parallel

**Type:** `boolean`
**Default:** `true`

Enable parallel file validation.

**Example:**

```json
{
  "parallel": false
}
```

### maxParallel

**Type:** `number`
**Default:** `4`

Maximum number of parallel validations.

**Example:**

```json
{
  "maxParallel": 8
}
```

**Tuning:**
- **Low values (1-2):** Slower but lower resource usage
- **Medium values (4-6):** Balanced
- **High values (8+):** Faster but higher resource usage

## Environment Variables

### SPEC_SYNC_MODE

**Type:** `"strict" | "lenient" | "off"`

Override validation mode.

**Example:**

```bash
export SPEC_SYNC_MODE=lenient
git push
```

### SPEC_SYNC_AUTO_FIX

**Type:** `"true" | "false" | "1" | "0"`

Enable/disable auto-fix.

**Example:**

```bash
export SPEC_SYNC_AUTO_FIX=true
git push
```

### SKIP_SPEC_SYNC

**Type:** `"1"`

Emergency bypass (skip all validation).

**Example:**

```bash
SKIP_SPEC_SYNC=1 git push
```

**Warning:** Use only for urgent hotfixes. Update specs ASAP.

### ANTHROPIC_API_KEY

**Type:** `string`

API key for Claude AI (required for auto-fix).

**Example:**

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## Advanced Configuration

### Custom Prompt Templates

Create custom AI prompts for spec generation.

**File:** `.specify/config/prompt-templates/spec-update.txt`

**Variables:**
- `{{FILE_PATH}}`: Changed file path
- `{{SPEC_PATH}}`: Specification file path
- `{{DIFF}}`: Git diff for file
- `{{CURRENT_SPEC}}`: Current spec content

**Example:**

```
You are a technical writer updating specifications.

File: {{FILE_PATH}}
Spec: {{SPEC_PATH}}

Changes:
{{DIFF}}

Current spec:
{{CURRENT_SPEC}}

Update the specification to reflect these changes.
```

### Per-Directory Configuration

Use `.specify/config/sync-rules.local.json` in subdirectories for directory-specific overrides.

**Example:** Different rules for different teams

```
project/
├── frontend/
│   └── .specify/config/sync-rules.local.json  (lenient mode)
└── backend/
    └── .specify/config/sync-rules.local.json  (strict mode)
```

## Migration Guide

### From No Validation to Lenient

1. Add minimal config:

```json
{
  "mode": "lenient"
}
```

2. Push and observe warnings
3. Fix outdated specs gradually
4. Switch to strict when ready

### From Lenient to Strict

1. Fix all existing warnings
2. Update config:

```json
{
  "mode": "strict"
}
```

3. Commit and push

### Adding Auto-Fix

1. Set up API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

2. Enable in config:

```json
{
  "autoFix": true,
  "requireApproval": true
}
```

3. Test on a branch first

## Troubleshooting

### Config Not Loading

**Check file syntax:**

```bash
jq . .specify/config/sync-rules.json
```

**Check file location:**

```bash
ls -la .specify/config/
```

### Rules Not Matching

**Debug rule evaluation:**

Enable verbose mode and check which rules are being evaluated.

**Check pattern syntax:**

Test glob patterns:

```bash
# In bash
[[ "src/features/auth.ts" == src/features/*.ts ]] && echo "match"
```

### Performance Issues

**Reduce parallel processing:**

```json
{
  "maxParallel": 2
}
```

**Add more ignore patterns:**

```json
{
  "ignorePatterns": [
    "**/*.test.ts",
    "src/generated/**"
  ]
}
```

**Disable auto-fix:**

```json
{
  "autoFix": false
}
```

## Best Practices

1. **Start lenient, move to strict**
   - Begin with `mode: "lenient"`
   - Fix warnings over time
   - Switch to `mode: "strict"` when stable

2. **Use explicit mappings for critical files**
   - Don't rely solely on heuristics
   - Map important code to specs explicitly

3. **Create project-specific rules**
   - Tailor rules to your tech stack
   - Match your team's workflow

4. **Use local config for personal preferences**
   - Keep `.specify/config/sync-rules.local.json` git-ignored
   - Set personal mode (lenient vs strict)

5. **Document your configuration**
   - Add comments (via `$comment` field in JSON)
   - Keep a README explaining project-specific rules

6. **Test configuration changes**
   - Test on a branch first
   - Verify rules match expected files

7. **Review auto-generated specs**
   - Always review AI output
   - Treat as a starting point, not final version

## Reference

### Complete Schema (TypeScript)

```typescript
interface Config {
  mode: "strict" | "lenient" | "off";
  autoFix: boolean;
  requireApproval: boolean;
  fileMappings: Record<string, string[]>;
  ignorePatterns: string[];
  rules: Rule[];
  exemptions: {
    branches: string[];
    users: string[];
    emergencyOverride: boolean;
  };
  timeout: number;
  parallel: boolean;
  maxParallel: number;
}

interface Rule {
  name: string;
  id: string;
  filePattern: string;
  changePattern?: string;
  changeType?: "added" | "modified" | "deleted";
  requiresSpecUpdate: boolean;
  specSections?: string[];
  severity: "error" | "warning" | "info";
  enabled: boolean;
  priority: number;
}
```
