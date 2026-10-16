# TypeScript

These rules are mandatory for the Pi harness and for standalone TypeScript tools. Use modern TypeScript and Bun.

## Strict compiler settings

- Each TypeScript project has a `tsconfig.json` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitOverride` enabled, and a type-check command that runs `tsc --noEmit`.
- The Pi harness does not have this yet. Adding it belongs to the Pi harness work in `packages/pi/`; until then, report the missing type check rather than claiming types were verified.
- Do not weaken compiler options or add suppressions to make a change pass.

## No unsafe typing

- Do not introduce explicit or implicit `any`.
- Use `unknown` for genuinely unvalidated values: parsed JSON, process output, files, environment variables, Pi or Herdr messages, and thrown errors. Validate or narrow before use and use the validated result afterward.
- Never use `as`, `!`, `@ts-ignore`, or `@ts-expect-error` to suppress a type error. Correct the source type, signature, or schema. An assertion is allowed only for a genuine runtime guarantee TypeScript cannot represent, with a comment naming that guarantee.
- Prefer `satisfies` over an assertion when checking a value against a type.
- Narrow with discriminants, `in`, `typeof`, or `instanceof`. A custom type guard must actually verify its claim.

## Validation at boundaries

- Validate data at every trust boundary: tool parameters, settings files, session registry files, Herdr socket responses, child process output, environment variables, and network responses.
- Use TypeBox where the Pi API requires it, such as tool parameter schemas. Use Zod 4 for other boundary validation in standalone tools. Do not mix both libraries inside one module.
- Use a non-throwing parse for expected failures and handle both outcomes. Throw only when invalid data is exceptional, such as broken startup configuration.
- Derive types from schemas (`Static<typeof schema>`, `z.output<typeof schema>`) instead of writing parallel interfaces.

## Required values and explicit absence

- Make domain values and internal parameters required by default. Allow `null`, `undefined`, or optional properties only when absence has a concrete meaning.
- Model mutually exclusive states with literal-discriminated unions, not bags of optional fields. Handle every variant; use an exhaustive `never` check in `switch` defaults.
- Do not use optional chaining to work around contracts the project owns. Fix the contract or narrow explicitly.
- Handle empty strings, empty collections, failed lookups, missing processes, and closed sockets deliberately.

## Contracts and documentation

- Put types next to the feature that owns them, in `<responsibility>.interface.ts` or alongside the schema in `<responsibility>.schema.ts`. No global type catalog, `shared/` folder, or barrel file.
- Document every exported interface, type alias, and its members with a brief `/* ... */` comment that states purpose and meaning, not the primitive type.
- Names describe the actual responsibility. Avoid `Data`, `Payload`, `value`, and `item` when a specific name exists.

## Modules and imports

- Name files `<specific-responsibility>.<singular-role>.ts`, for example `session-registry.store.ts`, `exit.command.ts`, `search-result.parser.ts`. Apply this to new files and files moved for the task.
- Import directly from the module that owns the code. No re-exporting `index.ts` files.
- Pi loads harness source files without a bundler, so harness imports stay relative and keep the `.ts` extension. Revisit this only together with a build step.
- Use `node:` prefixes for Node built-ins.
- Use typed parameter objects when several related parameters represent one input.

## Checks

Before completion, run for the affected TypeScript project:

- `tsc --noEmit` once a `tsconfig.json` exists.
- `biome check` once a Biome configuration exists.
- `bun test` for the affected tests.
