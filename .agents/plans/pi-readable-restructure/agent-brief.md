# Agent brief: Pi architecture restructure

You are one of 8 parallel agents restructuring `packages/pi/` (TypeScript, run by Pi without a bundler). You own exactly one **area**. Follow this brief exactly; when it and your judgment disagree, follow the brief. When something is truly ambiguous, choose the simplest option that follows the rules and list it under "Decisions" in your report.

## Before you start

1. Read these rule files completely; they are mandatory: `.agents/rules/code-quality.md`, `.agents/rules/structure.md`, `.agents/rules/typescript.md`, `.agents/rules/scripts.md` (Tests section).
2. Run `bun install --frozen-lockfile` in `packages/pi/` (your worktree has no `node_modules`).
3. Record the baseline from `packages/pi/`: `tsc --noEmit 2>&1 | grep -c "error TS"` (use the `tsc` on `PATH`; the package has no local TypeScript, and a "command not found" counts as 0, which is wrong), `biome lint . --reporter=summary --colors=off`, `./node_modules/.bin/knip --reporter compact`, and `bun test 2>&1 | tail -3`.

## Fixed constraints

- Do not change behavior. Every existing test must still pass (tests may move and be renamed; assertions keep their meaning).
- Imports are relative and keep the `.ts` extension. No `index.ts` re-exports, no barrels, no path aliases.
- Entry files keep their paths: `agent-configuration/harness/index.ts`, `agent-configuration/extensions/*.ts`, `agent-configuration/extensions/*/index.ts`, `agent-configuration/harness/instructions.md`.
- Do not edit any `.nix` file, `package.json`, lockfiles, `tsconfig.json`, `biome.json`, or `knip.json`. If one needs a change, say so in the report.
- Do not edit `.agents/`. Do not run `nrs`, `nixos-rebuild`, or `git push`.
- Commit your work once at the end in your worktree: `git add -A packages/pi && git commit -m "refactor(pi): <phase> <area>"`.

## Target layout

Inside `agent-configuration/harness/` (the harness root), code lives in role roots. Use these domain names so all agents agree:

```text
harness/
  index.ts                          entry, registers everything
  types/<domain>/<operation>/       <responsibility>.interface.ts
  schemas/<domain>/<operation>/     <responsibility>.schema.ts      (TypeBox)
  constants/<domain>/               <responsibility>.constant.ts
  services/<domain>/<operation>/    <verb-object>.service.ts        (one exported function)
  tools/<tool>/                     <tool>.tool.ts                  (pi.registerTool definitions)
  commands/<command>/               <command>.command.ts            (pi.registerCommand definitions)
  components/<domain>/              <responsibility>.component.ts   (pi-tui Component)
```

Domains: `activity`, `sessions`, `subagents`, `tools` (the file tools: read, edit, run, search), `inspector`, `prompts`, `tool-rendering`. Pick operation subfolders inside a domain only when they group 2 or more files; otherwise put files directly in the domain folder.

Each multi-file extension (`extensions/codex-fast-mode/`, `extensions/last-model/`) is its own root with the same role roots beside its `index.ts`.

## Areas and files you own

Paths are relative to `packages/pi/agent-configuration/` unless they start with `tests/` or `pi-tools/` (relative to `packages/pi/`).

| Area | Current files | Tests to move next to their subjects |
| --- | --- | --- |
| activity | `harness/activity/*`, `harness/ui/activity/*` | (none) |
| sessions | `harness/sessions/*` (including `cleanup-worker.mjs`) | `tests/sessions.test.ts`, `tests/sessions-exit.test.ts`, `tests/sessions-install.test.ts`, `tests/sessions-menu.test.ts` |
| subagents | `harness/subagents/*` | `tests/subagent-card.test.ts`, `tests/subagent-implementation-queue.test.ts`, `tests/subagent-roles.test.ts` |
| tools | `harness/tools/**` (read, edit, run, search, config, format, exec, diff, locks, artifacts, parameters) and the four `pi.registerTool` blocks plus tool descriptions in `harness/index.ts` | `tests/search-result.test.ts` |
| inspector | `harness/ui/inspector/*` | `tests/activity-navigation.test.ts`, `tests/inspector-task-detail.test.ts`, `tests/inspector-usage.test.ts` |
| prompts | `harness/ui/prompts/*` | `tests/prompt-browser.test.ts`, `tests/prompt-previews.test.ts` |
| tool-rendering | `harness/ui/tool-renderer.ts`, `tool-presentation.ts`, `tool-status.ts`, `formatting.ts`, `working.ts`, `install.ts` | (none) |
| extensions | `extensions/**`, `pi-tools/*.mjs` | `tests/clear-session.test.ts`, `tests/codex-fast-mode.test.ts`, `tests/lsp-host-dependencies.test.ts` |

Placement hints (follow them):

- activity: `ActivityStore` class becomes `createActivityStore()` in `services/activity/store/`; the shared `activityStore` instance stays exported from its own file. Parsing goes to `services/activity/parsing/`, session history restore (hydrate, restore, records) to `services/activity/history/`, summary state and rendering to `services/activity/summary/` and `components/activity/`, event wiring (`events.ts`, `tool-events.ts`) to `services/activity/events/`, visibility to `services/activity/visibility/`. Entry keys and widget keys go to `constants/activity/`.
- sessions: registry to `services/sessions/registry/`, Herdr client to `services/sessions/herdr/`, exit to `services/sessions/exit/` plus `commands/exit/`, cleanup and its worker to `services/sessions/cleanup/`, menu to `services/sessions/menu/`, commands from `install.ts` to `commands/<command>/`. Convert `cleanup-worker.mjs` to `cleanup-worker.ts`: it is started with `process.execPath` (Node 24 strips types), so use only erasable syntax (no `enum`, no `namespace`, no parameter properties) and update the path in the launcher. Registry rows and the worker payload are trust boundaries: validate them with TypeBox schemas in `schemas/sessions/`.
- subagents: roles to `services/subagents/roles/` and `constants/subagents/`, task running and result parsing to `services/subagents/tasks/`, registry and implementation queue to `services/subagents/registry/`, approved command to `tools/approved-command/`, the task tool (`tool.ts`) to `tools/task/task.tool.ts`, the card to `components/subagents/`, task parameters to `schemas/subagents/`.
- tools: `config.ts` constants to `constants/tools/`, parameters to `schemas/tools/<tool>/`, implementations to `services/tools/<tool>/`, shared text helpers (`format.ts`) to `services/tools/text/`, process execution to `services/tools/process/`. Move each `pi.registerTool` block from `harness/index.ts` into `tools/<tool>/<tool>.tool.ts` exporting `register<Tool>Tool(pi)`.
- inspector: navigation class becomes a factory in `services/inspector/navigation/`, detail building to `services/inspector/detail/`, key and mouse input to `services/inspector/input/`, rendering (`view.ts`, `frame.ts`, `lists.ts`) to `components/inspector/`, labels (`usage.ts`) to `services/inspector/labels/`, layout numbers to `constants/inspector/`.
- prompts: collection, layout, and navigation to `services/prompts/<operation>/`; `PromptBrowser` to `components/prompts/` (a class only if pi-tui requires one); install to `services/prompts/`.
- tool-rendering: `ToolBox` and `EmptyComponent` stay classes (they implement pi-tui `Component`) in `components/tool-rendering/`; presentation and status to `services/tool-rendering/`; box formatting to `services/tool-rendering/box/`; widths and shortcut to `constants/tool-rendering/`.
- extensions: `last-model.ts` (197 lines) becomes `extensions/last-model/index.ts` with its own roots; `codex-fast-mode/` gets roots; `quiet-tool-output.ts` and `clear-session.ts` stay single files unless splitting yields a clearly separate responsibility. Convert `pi-tools/*.mjs` to `.ts` (run by Node 24, erasable syntax only) and report the install script lines that must change (do not edit the `.sh`, the build owner will).

## Coding rules with examples

Optional fields are forbidden in contracts you own. Use a discriminated union:

```ts
// Wrong
interface ToolActivity { usage?: SubagentUsage; artifactPath?: string }

// Right (types/activity/tool-activity.interface.ts)
/* Usage reported by a finished subagent. */
interface ReportedUsage {
  /* Marks that the subagent reported usage. */
  readonly usageState: "reported";
  /* Token and cost totals of the run. */
  readonly usage: SubagentUsage;
}
/* The subagent finished or failed before reporting usage. */
interface UnreportedUsage {
  /* Marks that no usage was reported. */
  readonly usageState: "unreported";
}
export type ToolActivityUsage = ReportedUsage | UnreportedUsage;
```

A lookup that can fail returns a union, not `| undefined`:

```ts
export type ArtifactPathLookup = { readonly found: true; readonly path: string } | { readonly found: false };
export function findArtifactPath(text: string): ArtifactPathLookup { ... }
```

Pi library types and tool parameter schemas may contain optional fields. Convert them once where they enter your code, then pass only the converted value.

`unknown` only goes straight into a schema check:

```ts
const parsedRow: unknown = JSON.parse(rowText);
if (!Value.Check(SessionRowSchema, parsedRow)) return { valid: false };
return { valid: true, row: parsedRow };
```

Long conditions become named checks:

```ts
// Wrong
if (row.mode !== "explicit-exit" || !row.processStart || !Number.isSafeInteger(row.pid) || row.pid < 1 || ...)

// Right
const isExplicitExit = row.mode === "explicit-exit";
const hasValidProcess = isPositiveInteger(row.pid) && row.processStart !== "";
const isPaneInWorkspace = row.pane.startsWith(`${row.workspace}:`);
if (!isExplicitExit || !hasValidProcess || !isPaneInWorkspace) return;
```

Prefer a schema (patterns, minimums) over hand-written shape checks.

Classes become factories returning plain objects typed by an interface:

```ts
export function createSubagentRegistry(): SubagentRegistry {
  const handlesById = new Map<string, SubagentHandle>();
  return {
    register(handle) { handlesById.set(handle.id, handle); },
    find(id) { ... },
  };
}
```

Other rules:

- No comments on functions (remove existing `/** ... */` above functions). Every interface, type alias, and member has a `/* ... */` comment stating its meaning. Schema fields too.
- Interfaces live only in `types/`; implementation files import them. Schema-derived types: `Static<typeof Schema>` in the matching interface file.
- Repeated literals (strings, numbers, regexes) go to `constants/`.
- `const` and `readonly` by default; no unused variables, parameters, exports, or files.
- No `any`, no `as` casts (except `as const`), no `!`, no `?.` on your own contracts, no `@ts-ignore`.
- One exported function per service file, named after the file: `read-session-registry.service.ts` exports `readSessionRegistry`. Small private helpers used only by that function may stay in the file.
- Files around 150 lines at most; split by responsibility.
- Names say exactly what things do. No `data`, `item`, `value`, `info`, `utils`, `helpers`.
- Tests: `<subject>.test.ts` next to the subject, grouped with `describe`, test names state the behavior checked.

## Cross-area edits

You may edit files outside your area only to update import paths and call sites of things you moved or changed. Do not restructure another area's files. Do not edit `harness/index.ts` except its import lines and call sites (the tools area also moves the tool registrations out of it).

## Phases

### Phase A: contracts

Create `types/`, `schemas/`, and `constants/` for your area. Move every interface and type alias of your area into `types/`, convert optional and nullable fields to unions, add schemas for trust boundaries, and move repeated literals into constants. Update the implementation files and every consumer so the code compiles. Do not move or split implementation functions yet.

Done when: no new tsc errors anywhere (total count not above baseline, and zero in `types/`, `schemas/`, `constants/`), `biome ci` reports nothing in files you created, `bun test` passes.

### Phase B: code

Phase A is merged. Contracts now live in `types/`, `schemas/`, and `constants/`; reuse them, do not recreate them. Known items from phase A:

- activity and subagents: `TaskProgress` still has optional `model`, `thinkingLevel`, and `usage`. Replace them with the activity unions (`ToolActivityUsage`, `ValueState<T>`). Task progress is saved in Pi session history, so old sessions may lack these fields: the activity parser converts persisted `details` once through a schema into the unions. `ToolActivity.details` must stop being `unknown`: store the parsed task progress union instead. subagents owns `TaskProgress`; activity owns the parser and `ToolActivity`. Agree on the shape through the types files: subagents changes `types/subagents/tasks/`, activity consumes it.
- activity: `services/activity/value/` helpers (`presentValue`, `toValueState`) are used by inspector, subagents, and tool-rendering. Keep them in `services/activity/value/` with one function per file.
- activity: inspector pseudo-tool names (`constants/inspector/pseudo-tool.constant.ts`) duplicate `constants/activity/activity-entry.constant.ts`. activity keeps its constants; inspector imports them and deletes its duplicates.
- sessions: the cleanup worker runs as a plain Node process outside Pi's loader, from the Nix store, with no `node_modules` beside it. It may import only `node:` built-ins and relative files that do the same. Do not import `typebox` there; validate its payload with named check functions instead (see the long-condition example).
- tool-rendering: remove the re-exports from `ui/tool-renderer.ts`; consumers import from the owning file.
- extensions: `codex-fast-mode` imports the raw source of `pi-powerline-footer/theme.ts`, which causes one tsc error inside `node_modules`. Leave the import; report it.
- Biome's `useShorthandFunctionType` requires a function type alias instead of an interface with only a call signature. That is allowed.
- Single-file roots: a `pi.registerTool` or `pi.registerCommand` block that moves out of an entry or install file goes to `tools/` or `commands/`; event wiring (`pi.on(...)`) goes to `services/<domain>/events/` as an `install-<what>-events.service.ts`.

Move all implementation of your area into `services/`, `tools/`, `commands/`, and `components/` as described above, apply every coding rule, convert classes, split long files and conditions, move tests next to subjects, and delete the emptied old files and folders.

Done when: zero tsc errors, zero Biome diagnostics, and zero knip findings in your area's files; `bun test` passes with the same number of tests or more.

### Phase C: review

You review another area's diff (given in your prompt) against this brief and the rule files. Fix every violation you find in that area directly, run the checks, and commit.

## Report

End with this report, nothing else:

```text
Area: <area>  Phase: <A|B|C>
Commit: <hash>
Files created: <count>  Files moved: <count>  Files deleted: <count>
Checks: tsc <errors before -> after>, biome <before -> after>, knip <findings in area>, bun test <pass/fail counts>
Cross-area edits: <files>
Decisions: <bullets, or none>
Blockers: <bullets, or none>
```
