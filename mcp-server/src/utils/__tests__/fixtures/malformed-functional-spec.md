# Malformed Functional Specification

This file contains intentional errors for testing error handling.

## Features

### Feature with Unclosed Code Block

```typescript
const example = "This code block is never closed

### Another Feature

This should cause parsing issues.

### Feature with Mismatched Headers

This has content but the next "header" is malformed.

## Features (Duplicate Section)

### Valid Feature

This feature is fine.

```javascript
// This code block is also unclosed

## Section with Invalid Markdown

This section has \0 null bytes and other invalid characters:

[Invalid Link](

**Bold but not closed

- List item 1
  - Nested but broken
- [ Checklist without closing bracket
- [x] Valid checklist item

As a user I want to do something (missing commas in user story)

### Feature Missing Acceptance Criteria

This feature has no criteria at all.

## Another Section

```typescript
const x = 1;
const y = 2;

No closing markers

# Unexpected Top Level After Subsections

### This Will Break Hierarchy

Content here.
