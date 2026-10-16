import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const packagePath = process.argv[2];
if (!packagePath) throw new Error("Pi package path is required");

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

function replaceOnce(path: string, before: string, after: string): void {
  const source = readFileSync(path, "utf8");
  const first = source.indexOf(before);
  const duplicate = source.indexOf(before, first + before.length);
  if (first < 0 || duplicate >= 0) {
    throw new Error(`Expected exactly one assistant render site in ${path}`);
  }
  writeFileSync(path, source.replace(before, after));
}

function findSingleChunkContaining(chunkPaths: readonly string[], needle: string): string {
  const matches = chunkPaths.filter((path) => readFileSync(path, "utf8").includes(needle));
  const [match] = matches;
  if (matches.length !== 1 || match === undefined) {
    throw new Error(`Expected one bundled assistant component, found ${matches.length}`);
  }
  return match;
}

const modularFilter = `class HarnessFilteredChatContainer extends Container {
    render(width) {
        if (Reflect.get(globalThis, "pi.harness.toolHistoryVisible") !== false)
            return super.render(width);
        const children = this.children;
        this.children = children.filter((child) => !(child instanceof ToolExecutionComponent) &&
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

const chunksPath = join(packagePath, "dist/bundle/chunks");
const chunkPaths = readdirSync(chunksPath)
  .filter((name) => name.endsWith(".js"))
  .map((name) => join(chunksPath, name));
const bundledChunkPath = findSingleChunkContaining(chunkPaths, BUNDLED_RENDER_BEFORE);
replaceOnce(bundledChunkPath, BUNDLED_RENDER_BEFORE, BUNDLED_RENDER_AFTER);

const bundledFilter = [
  "var HarnessFilteredChatContainer=class extends Container{render(width){",
  'if(Reflect.get(globalThis,"pi.harness.toolHistoryVisible")!==false)return super.render(width);',
  "let children=this.children;",
  "this.children=children.filter(child=>!(child instanceof ToolExecutionComponent)&&",
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
