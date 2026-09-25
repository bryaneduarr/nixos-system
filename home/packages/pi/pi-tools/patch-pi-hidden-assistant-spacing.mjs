import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const packagePath = process.argv[2];
if (!packagePath) throw new Error("Pi package path is required");

function replaceOnce(path, before, after) {
	const source = readFileSync(path, "utf8");
	const first = source.indexOf(before);
	if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
		throw new Error(`Expected exactly one assistant render site in ${path}`);
	}
	writeFileSync(path, source.replace(before, after));
}

// Keep tool calls mounted for Alt+V, but leave them out of the chat layout
// while hidden. Filtering the container also removes each tool's Spacer(1).
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

// Pi adds spacers before it applies Markdown transformers. During streaming,
// thinking arrives before the tool call, so a hidden assistant message can
// temporarily render blank rows even before hasToolCalls becomes true.
const componentPath = join(
	packagePath,
	"dist/modes/interactive/components/assistant-message.js",
);
replaceOnce(
	componentPath,
	"const lines = super.render(width);\n        if (this.hasToolCalls || lines.length === 0) {",
	'const lines = super.render(width);\n        if (lines.every((line) => line.trim() === "")) return [];\n        if (this.hasToolCalls || lines.length === 0) {',
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
	"            this.showStatus(`Thinking level: ${newLevel}`);\n",
	"",
);
replaceOnce(
	interactivePath,
	"            this.showStatus(persist ? `Default thinking level: ${level}` : `Thinking level: ${level}`);\n",
	"",
);

// The installed Pi executable runs the bundled copy of the same component.
const chunksPath = join(packagePath, "dist/bundle/chunks");
const bundledBefore =
	"render(width){let lines=super.render(width);return this.hasToolCalls||lines.length===0||";
const matchingChunks = readdirSync(chunksPath)
	.filter((name) => name.endsWith(".js"))
	.map((name) => join(chunksPath, name))
	.filter((path) => readFileSync(path, "utf8").includes(bundledBefore));
if (matchingChunks.length !== 1) {
	throw new Error(
		`Expected one bundled assistant component, found ${matchingChunks.length}`,
	);
}
replaceOnce(
	matchingChunks[0],
	bundledBefore,
	'render(width){let lines=super.render(width);return lines.every(line=>line.trim()==="")?[]:this.hasToolCalls||lines.length===0||',
);

const bundledFilter =
	'var HarnessFilteredChatContainer=class extends Container{render(width){if(Reflect.get(globalThis,"pi.harness.toolHistoryVisible")!==false)return super.render(width);let children=this.children;this.children=children.filter(child=>!(child instanceof ToolExecutionComponent)&&!(child instanceof AssistantMessageComponent&&(child.isStreaming||child.hasToolCalls)));try{return super.render(width)}finally{this.children=children}}};';
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
	'this.updateEditorBorderColor(),this.showStatus(`Thinking level: ${newLevel}`)',
	"this.updateEditorBorderColor()",
);
replaceOnce(
	matchingChunks[0],
	'this.updateEditorBorderColor(),this.showStatus(persist?`Default thinking level: ${level}`:`Thinking level: ${level}`)',
	"this.updateEditorBorderColor()",
);
