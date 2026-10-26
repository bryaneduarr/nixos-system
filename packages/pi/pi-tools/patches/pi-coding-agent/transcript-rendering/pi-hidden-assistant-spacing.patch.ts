import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

const packagePath = readPackagePath();

const ASSISTANT_RENDER_BEFORE = [
  "const lines = super.render(width);",
  "        if (this.hasToolCalls || lines.length === 0) {",
].join("\n");
const ASSISTANT_RENDER_AFTER = [
  "const lines = super.render(width);",
  '        if (lines.every((line) => line.trim() === "")) return [];',
  "        if (this.hasToolCalls || lines.length === 0) {",
].join("\n");
const BUNDLED_RENDER_BEFORE = [
  "render(width){",
  "let lines=super.render(width);",
  "return this.hasToolCalls||lines.length===0||",
].join("");
const BUNDLED_RENDER_AFTER = [
  "render(width){",
  "let lines=super.render(width);",
  'return lines.every(line=>line.trim()==="")?[]:this.hasToolCalls||lines.length===0||',
].join("");
const MODULAR_THINKING_STATUS = `            this.showStatus(\`Thinking level: \${newLevel}\`);\n`;
const MODULAR_DEFAULT_THINKING_STATUS = `            this.showStatus(persist ? \`Default thinking level: \${level}\` : \`Thinking level: \${level}\`);\n`;
const BUNDLED_THINKING_STATUS = [
  "this.updateEditorBorderColor(),",
  `this.showStatus(\`Thinking level: \${newLevel}\`)`,
].join("");
const BUNDLED_DEFAULT_THINKING_STATUS = [
  "this.updateEditorBorderColor(),",
  `this.showStatus(persist?\`Default thinking level: \${level}\`:\`Thinking level: \${level}\`)`,
].join("");
const MODULAR_MODEL_STATUSES = [
  `                this.showStatus(\`Switched to \${result.model.name || result.model.id}\${thinkingStr}\`);\n`,
  `                this.showStatus(\`Model: \${model.id}\`);\n`,
  `                    this.showStatus(persist ? \`Default model: \${model.provider}/\${model.id}\` : \`Model: \${model.id}\`);\n`,
];
const BUNDLED_MODEL_STATUSES = [
  `this.showStatus(\`Switched to \${result.model.name||result.model.id}\${thinkingStr}\`),`,
  `this.showStatus(\`Model: \${model.id}\`),`,
  `this.showStatus(persist?\`Default model: \${model.provider}/\${model.id}\`:\`Model: \${model.id}\`),`,
];

const modularFilter = `class HarnessFilteredChatContainer extends Container {
    render(width) {
        if (Reflect.get(globalThis, "pi.harness.toolHistoryVisible") !== false)
            return super.render(width);
        const children = this.children;
        this.children = children.filter((child) => !(child instanceof ToolExecutionComponent) &&
            child.harnessHistoryEntry !== true &&
            !(child instanceof AssistantMessageComponent && (child.isStreaming || child.hasToolCalls)));
        try {
            return super.render(width);
        }
        finally {
            this.children = children;
        }
    }
}
`;

const componentPath = join(packagePath, "dist/modes/interactive/components/assistant-message.js");
replaceOnce(componentPath, ASSISTANT_RENDER_BEFORE, ASSISTANT_RENDER_AFTER);

const interactivePath = join(packagePath, "dist/modes/interactive/interactive-mode.js");
replaceOnce(interactivePath, "export class InteractiveMode {", `${modularFilter}export class InteractiveMode {`);
replaceOnce(
  interactivePath,
  "this.chatContainer = new Container();",
  "this.chatContainer = new HarnessFilteredChatContainer();",
);
replaceOnce(interactivePath, MODULAR_THINKING_STATUS, "");
replaceOnce(interactivePath, MODULAR_DEFAULT_THINKING_STATUS, "");
for (const status of MODULAR_MODEL_STATUSES) replaceOnce(interactivePath, status, "");

const bundledChunkPath = findBundledChunkContaining(packagePath, BUNDLED_RENDER_BEFORE);
replaceOnce(bundledChunkPath, BUNDLED_RENDER_BEFORE, BUNDLED_RENDER_AFTER);

const bundledFilter = [
  "var HarnessFilteredChatContainer=class extends Container{render(width){",
  'if(Reflect.get(globalThis,"pi.harness.toolHistoryVisible")!==false)return super.render(width);',
  "let children=this.children;",
  "this.children=children.filter(child=>!(child instanceof ToolExecutionComponent)&&",
  "child.harnessHistoryEntry!==!0&&",
  "!(child instanceof AssistantMessageComponent&&(child.isStreaming||child.hasToolCalls)));",
  "try{return super.render(width)}finally{this.children=children}}};",
].join("");
replaceOnce(bundledChunkPath, "var InteractiveMode=class", `${bundledFilter}var InteractiveMode=class`);
replaceOnce(
  bundledChunkPath,
  "this.chatContainer=new Container",
  "this.chatContainer=new HarnessFilteredChatContainer",
);
replaceOnce(bundledChunkPath, BUNDLED_THINKING_STATUS, "this.updateEditorBorderColor()");
replaceOnce(bundledChunkPath, BUNDLED_DEFAULT_THINKING_STATUS, "this.updateEditorBorderColor()");
for (const status of BUNDLED_MODEL_STATUSES) replaceOnce(bundledChunkPath, status, "");
