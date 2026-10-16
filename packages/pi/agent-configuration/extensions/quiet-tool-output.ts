import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME, type ExtensionAPI, isToolCallEventType } from "@earendil-works/pi-coding-agent";

const MAX_CHARS = 12_000;
const MAX_LINES = 240;
const READ_LIMIT = 120;
const PREVIEW_CHAR_LIMIT = 12_000;

function previewOutput(output: string, headLines: number, tailLines: number): string {
  const lines = output.split(/\r?\n/);
  const omittedLines = Math.max(0, lines.length - headLines - tailLines);
  const omissionMarker = `... ${omittedLines} lines omitted ...`;
  const previewLines =
    omittedLines > 0
      ? [...lines.slice(0, headLines), omissionMarker, ...lines.slice(-tailLines)]
      : [...lines, omissionMarker];

  let text = previewLines.join("\n");
  if (text.length > PREVIEW_CHAR_LIMIT) {
    const half = Math.floor((PREVIEW_CHAR_LIMIT - omissionMarker.length - 24) / 2);
    text = `${text.slice(0, half)}\n${omissionMarker}\n... preview shortened ...\n${text.slice(-half)}`;
  }

  return text;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function quietToolsExtension(pi: ExtensionAPI): void {
  pi.on("tool_call", (event) => {
    if (isToolCallEventType("read", event) && event.input.limit === undefined) {
      event.input.limit = READ_LIMIT;
    }
  });

  pi.on("tool_result", async (event, context) => {
    let fullOutput = "";
    for (const block of event.content) {
      if (block.type === "text") {
        fullOutput += `${fullOutput.length > 0 ? "\n" : ""}${block.text}`;
      }
    }

    const lineCount = fullOutput.split(/\r?\n/).length;
    if (fullOutput.length <= MAX_CHARS && lineCount <= MAX_LINES) {
      return;
    }

    const headLines = event.isError ? 160 : 100;
    const tailLines = event.isError ? 120 : 60;
    const preview = previewOutput(fullOutput, headLines, tailLines);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeToolName = event.toolName.replace(/[^a-zA-Z0-9_-]/g, "-");
    const safeCallId = event.toolCallId.replace(/[^a-zA-Z0-9_-]/g, "-");
    const fileName = `${timestamp}-${safeToolName}-${safeCallId}.txt`;
    const artifactDirectory = join(context.cwd, CONFIG_DIR_NAME, "tool-output");
    const artifactPath = join(artifactDirectory, fileName);
    const relativeArtifactPath = join(CONFIG_DIR_NAME, "tool-output", fileName);

    try {
      await mkdir(artifactDirectory, { recursive: true });
      await writeFile(artifactPath, fullOutput, "utf8");
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `${preview}\n\nFull output could not be saved: ${errorMessage(error)}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `${preview}\n\nFull output: ${relativeArtifactPath}`,
        },
        ...event.content.filter((block) => block.type !== "text"),
      ],
    };
  });
}
