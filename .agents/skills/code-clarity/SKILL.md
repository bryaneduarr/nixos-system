---
name: code-clarity
description: Keep code spacious, explicit, and easy to scan. Use when writing or refactoring code in this repository.
---

# Code clarity

Keep code direct and make its structure visible. Preserve behavior unless the task requires a behavior change.

## Layout

- Separate imports, module constants, types, and functions into clear blocks with blank lines.
- Put a blank line between a group of variables and the function that follows it.
- Give each top-level declaration enough space to distinguish it from the next one.
- Break long expressions, object literals, and chained calls across lines when that makes their parts easier to scan.
- Prefer explicit branches over nested ternaries when a reader must decode multiple conditions.
- Keep related statements together. Do not add blank lines between every line of a short block.
- Do not add code comments or doc comments. Express intent through names, types, structure, and control flow.

## Variables and shared values

- Use named variables by default instead of embedding nontrivial values in a larger expression.
- Name values by their role in the operation so later code reads as a sequence of steps.
- Put shared constants and configuration at the top of the file, after imports and before functions.
- When multiple files use the same value or rule, define it once in the shared module that owns it and import it where needed. The file should not be named "index" or "shared" it should be something with "constants".
- Keep per-call values local. Keep only simple literals and obvious one-step calls inline.
- Use `const` unless reassignment is required.

## Functions and types

- Prefer direct imports and inferred types over duplicate type definitions.
- Use a typed parameter object when several related arguments would be easy to confuse. Keep short functions simple.
- Give a wrapper its own responsibility, such as validation, transformation, authorization, error handling, or domain behavior.
- Validate external data at trust boundaries before relying on its shape or value.

## Examples and sensitive values

Do not hardcode project names, personal information, real email addresses, API keys, UUIDs, private identifiers, or user-provided personal information in examples. Use neutral fictional values unless the task requires a real value.
