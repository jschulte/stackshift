# Coding Standards

> **IMPORTANT**: This file is loaded on EVERY dev agent session. Keep it under 150 lines.
> These are the rules the dev agent MUST follow.

## Code Style

- **Indentation**: [2 spaces / 4 spaces / tabs]
- **Quotes**: [single / double]
- **Semicolons**: [yes / no]
- **Line length**: [max chars]

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | [kebab-case] | `user-profile.ts` |
| Components | [PascalCase] | `UserProfile` |
| Functions | [camelCase] | `getUserProfile` |
| Constants | [SCREAMING_SNAKE] | `MAX_RETRIES` |
| Types/Interfaces | [PascalCase] | `UserProfile` |

## Patterns

### Error Handling
```
[Describe the error handling pattern used]
- Custom error classes?
- try/catch style?
- Error boundaries?
```

### Validation
```
[Describe validation approach]
- Where validation happens
- What library/approach
```

### Logging
```
[Describe logging approach]
- Logger library
- Log levels used
- Structured vs unstructured
```

### Authentication
```
[Describe auth pattern]
- JWT / Session / OAuth
- Where auth is checked
- Middleware pattern?
```

## Testing Requirements

- **Unit tests**: [framework] - Required for [what]
- **Integration tests**: [framework] - Required for [what]
- **E2E tests**: [framework] - Required for [what]
- **Coverage target**: [percentage]

## Code Review Checklist

- [ ] Follows naming conventions
- [ ] Has appropriate error handling
- [ ] Includes tests for new code
- [ ] No console.log statements
- [ ] TypeScript strict mode passes

---

*Keep this file focused on rules. Full patterns in architecture.md*
