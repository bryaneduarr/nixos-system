import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { replaceFile } from "./replace-file.service.ts";

const workspace = await mkdtemp(join(tmpdir(), "replace-file-"));

async function writeSample(name: string, content: string): Promise<string> {
  const target = join(workspace, name);
  await writeFile(target, content, "utf8");
  return target;
}

describe("replaceFile", () => {
  afterAll(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  test("keeps dollar patterns in newText literal", async () => {
    const target = await writeSample("script.sh", "echo pid\n");
    await replaceFile(
      {
        op: "replace",
        path: "script.sh",
        edits: [{ oldText: "echo pid", newText: "echo $$ $& $1" }],
        replaceAll: false,
      },
      target,
    );
    expect(await readFile(target, "utf8")).toBe("echo $$ $& $1\n");
  });

  test("points to lines that differ only in whitespace", async () => {
    const target = await writeSample("view.ts", "function view() {\n\tif (ready) {\n\t\trender();\n\t}\n}\n");
    const result = await replaceFile(
      {
        op: "replace",
        path: "view.ts",
        edits: [{ oldText: "  if (ready) {\n    render();", newText: "  if (ready) {\n    paint();" }],
        replaceAll: false,
      },
      target,
    );
    expect(result.changed).toBe(false);
    expect(result.summary).toContain("Ignoring whitespace, the first oldText line matches line 2.");
  });
});
