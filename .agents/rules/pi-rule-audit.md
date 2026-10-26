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
- `fabricated-default`: `?? ""`, `|| ""`, `?? 0`, `|| 0`, an `undefined` or `null` test that yields `""` or `0`, or a destructuring default of `""` or `0`.
- `definite-assignment`: `let value!: T`.
- `mutable-array`: a `T[]` member or alias in an `.interface.ts` file instead of `readonly T[]`.
- `unchecked-default`: a `default:` clause without a `satisfies never` or `: never` check within three lines.
- `positional-parameters`: a function or function type with more than three parameters.
- `multi-export`: a second export in a `.service.ts` or `.store.ts` file.
- `multi-interface-file`: a second exported interface in an `.interface.ts` file.
- `banned-name`: `shared`, `common`, `utils`, `helpers`, or `misc` in a file or folder name.
- `missing-role-suffix`: a file outside the project root without a role suffix (`.interface`, `.schema`, `.constant`, `.service`, `.tool`, `.command`, `.component`, `.extension`, `.store`, `.patch`, `.test`, `.test-double`).
- `duplicate-constant`: an exported constant whose name, or whose separator or glyph text (two or more characters including a non-word character), another `.constant.ts` file already declares.
- `duplicate-function`: a top-level function name declared in more than one file, tests included.
- `crowded-constants-folder`: more than eight `.constant.ts` files directly in one folder.
- `stale-boundary`: an exception below that no longer matches a finding.

## Pi structure

- Each extension directory has a `<name>.extension.ts` entry file that registers everything, and a `package.json` whose `pi.extensions` field points to it. Never name an entry file `index.ts`.
- Shared test fakes go in `<subject>.test-double.ts`; Home Manager never installs tests or test doubles.

## Ownership in the harness

One owner per concept; consumers import it and never redeclare it.

| Concept | Owner |
| --- | --- |
| Theme color names, the theme contract, and the focus union | `constants/split-view/` and `types/split-view/`; prompts, inspector, and subagent pages reuse them. |
| Overlay width, height, margin, and anchor | `constants/split-view/overlay.constant.ts` |
| List scroll clamping | `services/split-view/layout/compute-list-scroll.service.ts` |
| Seconds per minute and hour | `constants/time/` |
| Separators, ellipsis, and glyphs such as the diamond marker | `constants/text/` |
| Type guards such as `isRecord` and `isUnknownArray` | `services/values/` |
| Tool names | `HARNESS_TOOLS` in `constants/tools/` |
| Text tool results and location keys | one service each in `services/tools/` |
| Process-wide state | `stores/<domain>/<noun>.store.ts`, created by a `create-*` factory |

## Build-time patches

- Scripts in `pi-tools/patches/` are named `<target>.patch.ts`, with tests as `<target>.patch.test.ts`. Helpers they share are services with the same one-function rule.

## Adding an exception

Fix the code first. Add a row only for a file that converts a Pi or pi-tui value once at the boundary, a test double that must cast a library type it cannot construct, or a signature Pi or pi-tui fixes with more than three parameters. Paths are relative to `packages/pi/`, one rule per row, with a one-line reason. Remove the row when the finding disappears.

## Exceptions

| File | Rule | Reason |
| --- | --- | --- |
| `agent-configuration/harness/components/activity/summary.component.ts` | `nullable-union` | pi-tui Component.handleMouse returns undefined for mouse events the component does not handle. |
| `agent-configuration/harness/components/inspector/inspector-overlay.component.ts` | `nullable-union` | pi-tui Component.handleMouse returns undefined for mouse events the component does not handle. |
| `agent-configuration/harness/components/tool-rendering/tool-box.component.ts` | `nullable-union` | pi-tui Component.handleMouse returns undefined for mouse events the component does not handle. |
| `agent-configuration/harness/services/inspector/input/handle-inspector-mouse.service.ts` | `nullable-union` | Produces the pi-tui handleMouse result, which is undefined for unhandled mouse events. |
| `agent-configuration/harness/services/activity/value/to-value-state.service.ts` | `nullable-union` | Converts library values that may be undefined into ValueState once. |
| `agent-configuration/harness/services/inspector/open/open-inspector.service.ts` | `positional-parameters` | Pi's ctx.ui.custom factory callback receives four positional arguments. |
| `agent-configuration/harness/services/tools/process/tool-cancellation.service.ts` | `nullable-union` | Converts Pi's optional AbortSignal into a ToolCancellation once. |
| `agent-configuration/harness/types/tool-rendering/renderers/renderer-context.interface.ts` | `nullable-union` | Mirrors Pi's render context, whose lastComponent is Component or undefined. |
| `agent-configuration/harness/types/transcript/turn/transcript-refresh-ui.interface.ts` | `nullable-union` | Mirrors Pi's setWidget, which removes a widget when given undefined. |
| `agent-configuration/extensions/clear-session.test-double.ts` | `type-assertion` | Fake ExtensionAPI for an end-to-end test; Pi overloads `on` per event, so the fake cannot be typed without a cast. |
| `agent-configuration/extensions/codex-fast-mode/fast-mode-runtime.test-double.ts` | `type-assertion` | Fake ExtensionAPI for end-to-end tests; Pi overloads `on` per event, so the fake cannot be typed without a cast. |
| `agent-configuration/harness/services/sessions/install/install-sessions.test-double.ts` | `type-assertion` | Fake ExtensionAPI and ExtensionContext; Pi overloads `on` and its context classes have private members with no factory. |
| `agent-configuration/harness/types/prompts/view/prompt-viewer-ui.interface.ts` | `positional-parameters` | Mirrors Pi's custom UI factory, which receives host, theme, keybindings, and done. |
| `agent-configuration/harness/services/prompts/view/view-prompt.service.ts` | `positional-parameters` | Implements Pi's custom UI factory, which receives host, theme, keybindings, and done. |
| `agent-configuration/harness/services/sessions/menu/session/select-session.service.ts` | `positional-parameters` | Implements Pi's custom UI factory, which receives tui, theme, keybindings, and done. |
| `agent-configuration/harness/types/sessions/menu/session/session-menu-ui.interface.ts` | `positional-parameters` | Mirrors Pi's custom UI factory, which receives tui, theme, keybindings, and done. |
