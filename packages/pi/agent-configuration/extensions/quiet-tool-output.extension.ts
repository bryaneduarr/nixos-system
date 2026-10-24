import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME, type ExtensionAPI, type ToolResultEvent } from "@earendil-works/pi-coding-agent";

// Must match HARNESS_TOOLS; this file is installed apart from the harness and cannot import it.
const SELF_BOUNDED_TOOLS: ReadonlySet<string> = new Set(["search", "read", "edit", "run"]);
const MAX_CHARS = 12_000;
const MAX_LINES = 240;
const PREVIEW_CHAR_LIMIT = 12_000;
const HEAD_LINES = 100;
const TAIL_LINES = 60;
const ERROR_HEAD_LINES = 160;
const ERROR_TAIL_LINES = 120;
const LINE_BREAK_PATTERN = /\r?\n/;
const UNSAFE_FILE_NAME_CHARACTERS = /[^a-zA-Z0-9_-]/g;
const UNSAFE_TIMESTAMP_CHARACTERS = /[:.]/g;
const SHORTENED_PREVIEW_RESERVED_CHARACTERS = 24;

/** A tool output to write to a file, with the call that produced it. */
interface FullOutput {
  /** Working directory the output folder belongs to. */
  readonly cwd: string;
  /** Name of the tool that produced the output. */
  readonly toolName: string;
  /** Identifier of the tool call. */
  readonly toolCallId: string;
  /** Full text of the output. */
  readonly output: string;
}

/** Result of writing the full output of a tool call to a file. */
type SavedOutput =
  /** The full output was written to the file at the relative path. */
  | { readonly saved: true; readonly relativePath: string }
  /** Writing the full output failed with the given message. */
  | { readonly saved: false; readonly message: string };

function previewOutput(output: string, headLines: number, tailLines: number): string {
  const lines = output.split(LINE_BREAK_PATTERN);
  const omittedLines = Math.max(0, lines.length - headLines - tailLines);
  const omissionMarker = `... ${omittedLines} lines omitted ...`;
  const previewLines =
    omittedLines > 0
      ? [...lines.slice(0, headLines), omissionMarker, ...lines.slice(-tailLines)]
      : [...lines, omissionMarker];

  let text = previewLines.join("\n");
  if (text.length > PREVIEW_CHAR_LIMIT) {
    const half = Math.floor((PREVIEW_CHAR_LIMIT - omissionMarker.length - SHORTENED_PREVIEW_RESERVED_CHARACTERS) / 2);
    text = `${text.slice(0, half)}\n${omissionMarker}\n... preview shortened ...\n${text.slice(-half)}`;
  }

  return text;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function joinTextBlocks(content: ToolResultEvent["content"]): string {
  let fullOutput = "";
  for (const block of content) {
    if (block.type === "text") {
      fullOutput += `${fullOutput.length > 0 ? "\n" : ""}${block.text}`;
    }
  }
  return fullOutput;
}

function fitsWithoutPreview(output: string): boolean {
  const lineCount = output.split(LINE_BREAK_PATTERN).length;
  return output.length <= MAX_CHARS && lineCount <= MAX_LINES;
}

function toSafeFileNamePart(value: string): string {
  return value.replace(UNSAFE_FILE_NAME_CHARACTERS, "-");
}

async function saveFullOutput({ cwd, toolName, toolCallId, output }: FullOutput): Promise<SavedOutput> {
  const timestamp = new Date().toISOString().replace(UNSAFE_TIMESTAMP_CHARACTERS, "-");
  const fileName = `${timestamp}-${toSafeFileNamePart(toolName)}-${toSafeFileNamePart(toolCallId)}.txt`;
  const artifactDirectory = join(cwd, CONFIG_DIR_NAME, "tool-output");
  try {
    await mkdir(artifactDirectory, { recursive: true });
    await writeFile(join(artifactDirectory, fileName), output, "utf8");
    return { saved: true, relativePath: join(CONFIG_DIR_NAME, "tool-output", fileName) };
  } catch (error) {
    return { saved: false, message: errorMessage(error) };
  }
}

export default function quietToolOutputExtension(pi: ExtensionAPI): void {
  pi.on("tool_result", async (event, context) => {
    if (SELF_BOUNDED_TOOLS.has(event.toolName)) return;

    const fullOutput = joinTextBlocks(event.content);
    if (fitsWithoutPreview(fullOutput)) return;

    const preview = previewOutput(
      fullOutput,
      event.isError ? ERROR_HEAD_LINES : HEAD_LINES,
      event.isError ? ERROR_TAIL_LINES : TAIL_LINES,
    );
    const saved = await saveFullOutput({
      cwd: context.cwd,
      toolName: event.toolName,
      toolCallId: event.toolCallId,
      output: fullOutput,
    });
    if (!saved.saved) {
      return {
        content: [{ type: "text", text: `${preview}\n\nFull output could not be saved: ${saved.message}` }],
      };
    }

    return {
      content: [
        { type: "text", text: `${preview}\n\nFull output: ${saved.relativePath}` },
        ...event.content.filter((block) => block.type !== "text"),
      ],
    };
  });
}
