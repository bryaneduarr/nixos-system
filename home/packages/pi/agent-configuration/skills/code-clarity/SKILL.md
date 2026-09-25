---
name: code-clarity
description: Keep code direct, readable, and safe at input boundaries. Use when writing or refactoring functions, comments, types, examples, or request handling.
---

# Code clarity

Keep changes small, explicit, and focused. Make primary behavior understandable without following excessive imports or nested wrappers. Reuse code only when it does not hide straightforward behavior.

## Functions and types

- Prefer direct imports and inferred types over duplicate type definitions.
- For several related inputs, use a typed parameter object when it makes the call site clearer. Do not turn every short function into an options object.
- Do not add a wrapper that only forwards arguments. A wrapper needs its own responsibility, such as validation, transformation, authorization, error handling, required logging, business logic, or domain behavior.
- Validate external data at trust boundaries before relying on its shape or value.

For example, prefer `searchProperties({ query, limit })` over `searchProperties(query, limit)` when the arguments are easy to confuse. Prefer calling `searchProperties(options)` directly over a `runSearch(options)` function that only calls `searchProperties(options)`. A `runSearch` function is useful if it validates the options or applies a domain rule.

## Comments

- Add comments for context, behavior that is not obvious, constraints, or reasoning. Do not narrate what the next line already says.
- Do not start comments with `Why:` or `What:`. Avoid numbered step comments, decorative separator headers, and label-style comments.
- Do not call code "human readable", "human friendly", or "human-like" in comments. Avoid unnecessary references to the reader.
- End complete comment sentences with periods. Use only plain keyboard characters in comments: no em dashes or decorative Unicode.

```ts
// The provider retries timed-out requests, so keep this operation idempotent.
await saveRequest(request);
```

Avoid `// Step 1: Save the request` or `// Why: We save this request` above the same call.

## Examples and sensitive values

Do not hardcode project names, personal information, real email addresses, API keys, UUIDs, private identifiers, or user-provided personal information. Use neutral fictional example values unless the task explicitly requires a real value. Do not repeat a secret in sample code, comments, tests, or explanations.
