# Pi rule audit

These rules are mandatory for TypeScript in `packages/pi/`. They apply [typescript.md](typescript.md) and [code-quality.md](code-quality.md) to the Pi harness and its extensions.

## What the audit enforces

`rule-audit` runs through `check-code` and the `pi-check` flake check. It reports:

- `nullable-union`: `| undefined` or `| null` in a type.
- `optional-chaining`: `?.`.
- `optional-property`: `name?:` in a contract.
- `type-assertion`: any cast other than `as const`.
- `function-comment`: a comment directly above a function.
- `plain-block-comment`: a `/* */` comment; contract comments use JSDoc `/** */`.
- `file-length`: a file over 150 lines.
- `stale-boundary`: an exception below that no longer matches a finding.

## Pi structure

- Each extension directory has a `<name>.extension.ts` entry file that registers everything, and a `package.json` whose `pi.extensions` field points to it. Never name an entry file `index.ts`.
- Shared test fakes go in `<subject>.test-double.ts`; Home Manager never installs tests or test doubles.

## Adding an exception

Fix the code first. Add a row only for a file that converts a Pi or pi-tui value once at the boundary, or a test double that must cast a library type it cannot construct. Paths are relative to `packages/pi/`, one rule per row, with a one-line reason. Remove the row when the finding disappears.

## Exceptions

| File | Rule | Reason |
| --- | --- | --- |
| `agent-configuration/harness/components/activity/summary.component.ts` | `nullable-union` | pi-tui Component.handleMouse returns undefined for mouse events the component does not handle. |
| `agent-configuration/harness/components/inspector/inspector-overlay.component.ts` | `nullable-union` | pi-tui Component.handleMouse returns undefined for mouse events the component does not handle. |
| `agent-configuration/harness/components/tool-rendering/tool-box.component.ts` | `nullable-union` | pi-tui Component.handleMouse returns undefined for mouse events the component does not handle. |
| `agent-configuration/harness/services/inspector/input/handle-inspector-mouse.service.ts` | `nullable-union` | Produces the pi-tui handleMouse result, which is undefined for unhandled mouse events. |
| `agent-configuration/harness/services/activity/value/to-value-state.service.ts` | `nullable-union` | Converts library values that may be undefined into ValueState once. |
| `agent-configuration/harness/services/tools/process/tool-cancellation.service.ts` | `nullable-union` | Converts Pi's optional AbortSignal into a ToolCancellation once. |
| `agent-configuration/harness/types/tool-rendering/renderer.interface.ts` | `nullable-union` | Mirrors Pi's render context, whose lastComponent is Component or undefined. |
| `agent-configuration/extensions/clear-session.test-double.ts` | `type-assertion` | Fake ExtensionAPI for an end-to-end test; Pi overloads `on` per event, so the fake cannot be typed without a cast. |
| `agent-configuration/extensions/codex-fast-mode/fast-mode-runtime.test-double.ts` | `type-assertion` | Fake ExtensionAPI for end-to-end tests; Pi overloads `on` per event, so the fake cannot be typed without a cast. |
| `agent-configuration/harness/services/sessions/install/install-sessions.test-double.ts` | `type-assertion` | Fake ExtensionAPI and ExtensionContext; Pi overloads `on` and its context classes have private members with no factory. |
