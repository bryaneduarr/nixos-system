import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

// The activity summary in the harness shows this hint instead.
const MODULAR_INDICATOR = [
  "            scrollToEndIndicator: () => {",
  '                const shortcut = keyDisplayText("tui.altScreen.bottom");',
  `                const label = \` ↓ Jump to latest message\${shortcut ? \` · \${shortcut}\` : ""} \`;`,
  '                return theme.bg("selectedBg", theme.fg("text", label));',
  "            },",
  "",
].join("\n");

const BUNDLED_INDICATOR = [
  "scrollToEndIndicator:()=>{",
  'let shortcut=keyDisplayText("tui.altScreen.bottom"),',
  `label=\` \\u2193 Jump to latest message\${shortcut?\` \\xB7 \${shortcut}\`:""} \`;`,
  'return theme.bg("selectedBg",theme.fg("text",label))},',
].join("");

const packagePath = readPackagePath();

replaceOnce(join(packagePath, "dist/modes/interactive/tui-renderer.js"), MODULAR_INDICATOR, "");
replaceOnce(findBundledChunkContaining(packagePath, BUNDLED_INDICATOR), BUNDLED_INDICATOR, "");
