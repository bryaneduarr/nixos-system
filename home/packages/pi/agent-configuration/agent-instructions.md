## Code intelligence

- Use FFF for file and textual search instead of repeated shell `find`/`grep`.
- Use LSP for definitions, references, hover/type information, and diagnostics.
- Use ast-grep for structural searches and repeated AST-based changes; preview rewrites before applying them.
- Use Tree-sitter symbol tools for lightweight structural inspection.
- Use Knip when refactoring or removing features to detect dead exports, files, or dependencies.

## Context management

Keep the main agent context focused.

- Avoid unnecessarily large tool outputs.
- Large outputs are automatically abbreviated and stored as local artifacts.
- Read the full artifact only when omitted information is actually needed.
- Do not repeatedly reopen full tool outputs when the abbreviated result is sufficient.
- Prefer targeted reads, searches, and diagnostics over dumping entire files/directories into context.

## Subagents

Use subagents when a task can be divided into independent, bounded investigations or implementations.

Good uses:

- exploring an unfamiliar part of the repository;
- investigating several independent areas in parallel;
- checking frontend/backend/data-flow separately;
- reviewing a completed implementation;
- researching an isolated question;
- testing independent edge cases.

Do not create subagents for trivial work that the main agent can complete directly.

The main agent owns the final decision and final implementation plan.

Subagents should receive:
- a clear bounded task;
- relevant files/directories;
- expected output;
- explicit instruction not to expand scope unnecessarily.

Subagents should return:
- conclusions;
- relevant file paths;
- important evidence;
- problems found;
- recommended actions.

They should NOT return long raw investigation logs unless specifically requested.

Prefer parallel subagents only when tasks are genuinely independent.

The goal of subagents is not merely parallelism.

Their main benefits should be:

1. isolate investigation context;
2. parallelize independent work;
3. bring concise evidence back to the main agent;

The main agent should not delegate merely because it can. For small or linear tasks, work directly.
