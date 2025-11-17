# API Contracts: F005-mermaid-diagrams

**Feature:** Mermaid Diagram Generation
**Date:** 2025-11-17
**Version:** 1.0.0

---

## Overview

This directory contains TypeScript interface definitions and API contracts for the Mermaid diagram generation system. These contracts define the public API for diagram generators, parsers, and embedders.

---

## Contract Files

### 1. `diagram-generator.contract.ts`
Main diagram generation API contracts.

### 2. `ast-parser.contract.ts`
TypeScript AST parsing contracts.

### 3. `embedder.contract.ts`
Documentation embedding contracts.

### 4. `types.ts`
Shared type definitions.

---

## Usage

These contracts serve as:
1. **Implementation Guide:** Developers implement these interfaces
2. **Test Specifications:** Tests validate conformance to contracts
3. **Documentation:** Clear API surface for diagram generation
4. **Type Safety:** TypeScript enforces contract compliance

---

## Contract Versioning

All contracts follow semantic versioning:
- **Major:** Breaking changes to API signatures
- **Minor:** New optional parameters or methods
- **Patch:** Documentation updates only

**Current Version:** 1.0.0

---

## See Also

- `../data-model.md` - Data structures used by contracts
- `../quickstart.md` - Implementation guide
- `../research.md` - Technology decisions
