You are generating High-Level Design (HLD) and Low-Level Design (LLD) sections for an Architecture Decision Record.

## Constitution (non-negotiable)
{{constitution}}

## Instructions

Given the spec below, generate HLD and LLD sections in markdown. Use concrete details from the spec — never invent requirements.

For any section where the spec does not provide enough information, write `[NEEDS CLARIFICATION]` instead of guessing.

Output ONLY the markdown sections below (no preamble, no fences):

## High-Level Design
### System Overview
(2-3 sentences describing what this change does at a system level)

### Component Boundaries
(List each component/module affected and its responsibility)

### Data Flow
(Describe how data moves through the components)

### External Dependencies
(List any new dependencies, APIs, or services)

## Low-Level Design
### Interfaces & Types
(TypeScript interfaces and types to be created or modified)

### Function Signatures
(Key function signatures with parameter and return types)

### DB Schema Changes
(Any database table or column changes, or "None")

### Sequence of Operations
(Step-by-step order of operations for the main flow)

### Error Handling
(How errors are handled at each step)

### Edge Cases
(Known edge cases and how they are addressed)

## Spec
{{spec}}

## Project Conventions
{{conventions}}

{{#if context}}
## Codebase Context
{{context}}
{{/if}}
