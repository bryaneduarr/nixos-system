import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

// Must match WARNING_RENDERER_KEY in the harness transcript constants.
const RENDERER_KEY = "pi.harness.createWarningRenderer";
// The chat container filter in the hidden assistant spacing patch hides components carrying this marker.
const HISTORY_ENTRY_MARKER = "harnessHistoryEntry";

const MODULAR_WARNING_TEXT = [
  "        this.chatContainer.addChild(new Spacer(1));",
  `        this.chatContainer.addChild(new ThemedText(() => theme.fg("warning", \`Warning: \${warningMessage}\`), 1, 0));`,
].join("\n");
const MODULAR_WARNING_BOX = [
  "        const harnessWarning = harnessWarningComponent(warningMessage);",
  "        if (harnessWarning !== undefined) {",
  "            this.chatContainer.addChild(harnessWarning);",
  "        }",
  "        else {",
  "            this.chatContainer.addChild(new Spacer(1));",
  `            this.chatContainer.addChild(new ThemedText(() => theme.fg("warning", \`Warning: \${warningMessage}\`), 1, 0));`,
  "        }",
].join("\n");
const MODULAR_CLASS = "export class InteractiveMode {";
const MODULAR_RENDERER = `function harnessWarningComponent(warningMessage) {
    const createWarningRenderer = Reflect.get(globalThis, "${RENDERER_KEY}");
    if (typeof createWarningRenderer !== "function")
        return undefined;
    const render = createWarningRenderer(warningMessage);
    return { ${HISTORY_ENTRY_MARKER}: true, render, invalidate() { } };
}
`;

const BUNDLED_WARNING_TEXT = [
  "this.chatContainer.addChild(new Spacer(1)),",
  `this.chatContainer.addChild(new ThemedText(()=>theme.fg("warning",\`Warning: \${warningMessage}\`),1,0)),`,
  "this.ui.requestRender()",
].join("");
const BUNDLED_WARNING_BOX = [
  "let harnessWarning=harnessWarningComponent(warningMessage);",
  "harnessWarning!==void 0?this.chatContainer.addChild(harnessWarning):(",
  "this.chatContainer.addChild(new Spacer(1)),",
  `this.chatContainer.addChild(new ThemedText(()=>theme.fg("warning",\`Warning: \${warningMessage}\`),1,0))),`,
  "this.ui.requestRender()",
].join("");
const BUNDLED_CLASS = "var InteractiveMode=class";
const BUNDLED_RENDERER = [
  "function harnessWarningComponent(warningMessage){",
  `let createWarningRenderer=Reflect.get(globalThis,"${RENDERER_KEY}");`,
  'if(typeof createWarningRenderer!="function")return;',
  `return{${HISTORY_ENTRY_MARKER}:!0,render:createWarningRenderer(warningMessage),invalidate(){}}}`,
].join("");

const packagePath = readPackagePath();

const interactivePath = join(packagePath, "dist/modes/interactive/interactive-mode.js");
replaceOnce(interactivePath, MODULAR_WARNING_TEXT, MODULAR_WARNING_BOX);
replaceOnce(interactivePath, MODULAR_CLASS, `${MODULAR_RENDERER}${MODULAR_CLASS}`);

const bundledChunkPath = findBundledChunkContaining(packagePath, BUNDLED_WARNING_TEXT);
replaceOnce(bundledChunkPath, BUNDLED_WARNING_TEXT, BUNDLED_WARNING_BOX);
replaceOnce(bundledChunkPath, BUNDLED_CLASS, `${BUNDLED_RENDERER}${BUNDLED_CLASS}`);
