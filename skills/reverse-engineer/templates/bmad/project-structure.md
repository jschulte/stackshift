# Project Structure

> **IMPORTANT**: This file is loaded on EVERY dev agent session. Keep it under 100 lines.

## Directory Layout

```
[project-root]/
├── src/                    # Source code
│   ├── [dir]/             # [Purpose]
│   ├── [dir]/             # [Purpose]
│   └── [dir]/             # [Purpose]
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   └── e2e/               # End-to-end tests
├── docs/                   # Documentation (you are here)
├── [config-dir]/          # Configuration
└── [other-dirs]/          # [Purpose]
```

## Key Files

| File | Purpose |
|------|---------|
| `[path]` | [Main entry point] |
| `[path]` | [Database schema] |
| `[path]` | [API routes] |
| `[path]` | [Environment config] |
| `[path]` | [Type definitions] |

## Where to Put Things

| Type of Code | Location |
|--------------|----------|
| React components | `src/components/` |
| API routes | `src/api/` or `src/server/` |
| Database models | `src/models/` or `prisma/` |
| Utility functions | `src/lib/` or `src/utils/` |
| Type definitions | `src/types/` |
| Tests | `tests/` or `__tests__/` |

## Important Paths

- **Entry point**: `[path]`
- **Database schema**: `[path]`
- **Environment variables**: `[path]`
- **Build output**: `[path]`

---

*Keep this file as a quick reference. Full architecture in architecture.md*
