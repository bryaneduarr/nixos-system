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
const MODULAR_THINKING_STATUS =
	"            this.showStatus(`Thinking level: ${newLevel}`);\n";
const MODULAR_DEFAULT_THINKING_STATUS =
	"            this.showStatus(persist ? `Default thinking level: ${level}` : `Thinking level: ${level}`);\n";
const BUNDLED_THINKING_STATUS = [
	"this.updateEditorBorderColor(),",
	"this.showStatus(`Thinking level: ${newLevel}`)",
].join("");
const BUNDLED_DEFAULT_THINKING_STATUS = [
	"this.updateEditorBorderColor(),",
	"this.showStatus(persist?`Default thinking level: ${level}`:`Thinking level: ${level}`)",
].join("");

function replaceOnce(path, before, after) {
	const source = readFileSync(path, "utf8");
	const first = source.indexOf(before);
	const duplicate = source.indexOf(before, first + before.length);
	if (first < 0 || duplicate >= 0) {
		throw new Error(`Expected exactly one assistant render site in ${path}`);
	}
	writeFileSync(path, source.replace(before, after));
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

const componentPath = join(
	packagePath,
	"dist/modes/interactive/components/assistant-message.js",
);
replaceOnce(
	componentPath,
	ASSISTANT_RENDER_BEFORE,
	ASSISTANT_RENDER_AFTER,
);

const interactivePath = join(
	packagePath,
	"dist/modes/interactive/interactive-mode.js",
);
replaceOnce(
	interactivePath,
	"export class InteractiveMode {",
	`${modularFilter}export class InteractiveMode {`,
);
replaceOnce(
	interactivePath,
	"this.chatContainer = new Container();",
	"this.chatContainer = new HarnessFilteredChatContainer();",
);
replaceOnce(
	interactivePath,
	MODULAR_THINKING_STATUS,
	"",
);
replaceOnce(
	interactivePath,
	MODULAR_DEFAULT_THINKING_STATUS,
	"",
);

const chunksPath = join(packagePath, "dist/bundle/chunks");
const chunkFiles = readdirSync(chunksPath).filter((name) => name.endsWith(".js"));
const chunkPaths = chunkFiles.map((name) => join(chunksPath, name));
const matchingChunks = chunkPaths.filter((path) =>
	readFileSync(path, "utf8").includes(BUNDLED_RENDER_BEFORE),
);
if (matchingChunks.length !== 1) {
	throw new Error(
		`Expected one bundled assistant component, found ${matchingChunks.length}`,
	);
}
replaceOnce(
	matchingChunks[0],
	BUNDLED_RENDER_BEFORE,
	BUNDLED_RENDER_AFTER,
);

const bundledFilter = [
	"var HarnessFilteredChatContainer=class extends Container{render(width){",
	'if(Reflect.get(globalThis,"pi.harness.toolHistoryVisible")!==false)return super.render(width);',
	"let children=this.children;",
	"this.children=children.filter(child=>!(child instanceof ToolExecutionComponent)&&",
	"!(child instanceof AssistantMessageComponent&&(child.isStreaming||child.hasToolCalls)));",
	"try{return super.render(width)}finally{this.children=children}}};",
].join("");
replaceOnce(
	matchingChunks[0],
	"var InteractiveMode=class",
	`${bundledFilter}var InteractiveMode=class`,
);
replaceOnce(
	matchingChunks[0],
	"this.chatContainer=new Container",
	"this.chatContainer=new HarnessFilteredChatContainer",
);
replaceOnce(
	matchingChunks[0],
	BUNDLED_THINKING_STATUS,
	"this.updateEditorBorderColor()",
);
replaceOnce(
	matchingChunks[0],
	BUNDLED_DEFAULT_THINKING_STATUS,
	"this.updateEditorBorderColor()",
);
