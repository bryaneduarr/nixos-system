# TypeScript

These rules are mandatory for the Pi harness and for standalone TypeScript tools. Use modern TypeScript and Bun.

## Strict compiler settings

- Each TypeScript project has a `tsconfig.json` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitOverride` enabled, and a type-check command that runs `tsc --noEmit`.
- Do not weaken compiler options or add suppressions to make a change pass.

## No unsafe typing

- Do not introduce explicit or implicit `any`, `z.any()`, or `Type.Any()`. Every value has a declared or inferred concrete type.
- `unknown` is allowed in two places only: the raw value passed directly into a schema parse at a trust boundary (parsed JSON, process output, files, environment variables, Pi or Herdr messages), and a `catch` variable narrowed in the same block. Never store, return, or pass `unknown` further; use the parsed result afterward.
- Never use `as`, `?.`, `!`, `@ts-ignore`, or `@ts-expect-error` to suppress a type error. Correct the source type, signature, or schema. An assertion is allowed only for a genuine runtime guarantee TypeScript cannot represent, with a comment naming that guarantee.
- Prefer `satisfies` over an assertion when checking a value against a type.
- Narrow with discriminants, `in`, `typeof`, or `instanceof`. A custom type guard must actually verify its claim.

## Validation at boundaries

- Validate data at every trust boundary: tool parameters, settings files, session registry files, Herdr socket responses, child process output, environment variables, and network responses.
- Use TypeBox where the Pi API requires it, such as tool parameter schemas. Use Zod 4 for other boundary validation in standalone tools. Do not mix both libraries inside one module.
- Use a non-throwing parse for expected failures and handle both outcomes. Throw only when invalid data is exceptional, such as broken startup configuration.
- Derive types from schemas (`Static<typeof schema>`, `z.output<typeof schema>`) instead of writing parallel interfaces.

## Required values and explicit absence

- Contracts the project owns never use optional properties (`usage?: SubagentUsage`), `| undefined`, or `| null`, in interfaces, parameters, or return types. Every value is present and typed end to end.
- Model real absence or alternative states with literal-discriminated unions whose variants have only required fields, such as `{ usageState: "reported"; usage: SubagentUsage } | { usageState: "unreported" }`. A lookup that can fail returns such a union too. Handle every variant; use an exhaustive `never` check in `switch` defaults.
- Library types keep their own optional fields, and input schemas for external callers (tool parameters, settings files) may declare optional input fields. Convert them once at the boundary into the project's required values or unions, then use only the converted value.
- List every file that performs such a conversion in the project's `rule-audit-boundaries.json` with the rule it needs and a one-line reason. Any other file must pass the rule audit without exceptions.
- Tests do not cast fakes. When a function needs only part of a library object, type its parameter as a small interface of what it uses, so tests pass plain objects.
- Never fill absence with fabricated defaults such as empty strings, zero, or empty objects.
- Do not use optional chaining to work around contracts the project owns. Fix the contract or narrow explicitly.
- Handle empty strings, empty collections, failed lookups, missing processes, and closed sockets deliberately.

## Plain objects and functions

- Use interfaces, plain objects, and functions. Do not write classes unless a library contract requires one, such as a class implementing a pi-tui `Component` or extending `Error`.
- Replace stateful classes with a factory function that returns a plain object typed by an interface. Keep its state in local `const` bindings inside the factory.
- Mark interface members `readonly` and use `readonly T[]` unless the code must mutate them.

## Contracts and documentation

- Put contracts in the TypeScript root's `types/` folder, in `<responsibility>.interface.ts` files organized by domain and operation as described in [structure.md](structure.md). Put runtime schemas in `schemas/` and derive their types in the matching interface file. No global type catalog, aggregate interface, `shared/` folder, or barrel file.
- Write every contract as an `interface`. Use a type alias only for unions, primitives, or schema-derived types an interface cannot represent.
- Document every exported interface, type alias, and its members with a brief `/* ... */` comment that states purpose and meaning, not the primitive type. Functions are not commented; see [code-quality.md](code-quality.md).
- Document schema fields the same way. Contract comments explain purpose without file paths.
- Names describe the actual responsibility. Avoid `Data`, `Payload`, `value`, and `item` when a specific name exists.

## Deprecated APIs

- Never import or use a symbol, type, option, or API marked `@deprecated`. Use the replacement its deprecation notice names, and fix any deprecation warning the editor or TypeScript reports (such as `ts(6385)`) before completion.
- Every Biome configuration enforces this with `suspicious/noDeprecatedImports` as an error. Do not lower that level or suppress the rule; `biome ci` and package lint must pass.
- React event types: never use `FormEvent` or `FormEventHandler`, which do not correspond to a real DOM event. Type `onSubmit` handlers with `SubmitEvent<HTMLFormElement>`, `onChange` handlers with `ChangeEvent<Element>`, `onInput` handlers with `InputEvent<Element>`, and other generic handlers with `SyntheticEvent`.
- When upgrading dependencies, check their changelogs and the lint output for newly deprecated APIs and migrate affected code in the same change.

## Modules and imports

- Name files `<specific-responsibility>.<singular-role>.ts`, where the role matches the file's role folder: `.interface`, `.schema`, `.constant`, `.service`, `.tool`, `.command`, `.component`, `.test`, or `.test-double` (typed fakes shared by several tests of one subject). For example `session-row.interface.ts`, `read-session-registry.service.ts`, `exit.command.ts`. Apply this to new files and files moved for the task.
- Import directly from the module that owns the code. No re-exporting `index.ts` files.
- Pi loads harness source files without a bundler, so harness imports stay relative and keep the `.ts` extension. Revisit this only together with a build step.
- Use `node:` prefixes for Node built-ins.
- Use typed parameter objects when several related parameters represent one input.

## Checks

Before completion, run for the affected TypeScript project:

- `tsc --noEmit` once a `tsconfig.json` exists.
- `biome ci` once a Biome configuration exists.
- `knip` once a knip configuration exists.
- `bun test` for the affected tests.
- The rule audit, through `check-code`, once a `rule-audit-boundaries.json` exists. It reports `| undefined` and `| null` unions, `?.`, casts other than `as const`, files over 150 lines, and comments above functions.

Every Biome configuration sets `noExplicitAny`, `noNonNullAssertion`, `noDeprecatedImports`, `noExcessiveCognitiveComplexity`, and `useConst` to error.
