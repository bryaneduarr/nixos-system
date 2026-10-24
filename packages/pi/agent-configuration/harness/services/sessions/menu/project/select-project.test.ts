import { describe, expect, test } from "bun:test";
import type { ProjectPickerContext } from "../../../../types/sessions/menu/project/project-picker-context.interface.ts";
import type { ProjectSource } from "../../../../types/sessions/menu/project/project-source.interface.ts";
import { selectProject } from "./select-project.service.ts";

describe("selectProject", () => {
  test("project picker includes the current folder and cancellation creates nothing", async () => {
    let choices: string[] = [];
    const ctx: ProjectPickerContext = {
      cwd: process.cwd(),
      ui: {
        select: async (title: string, options: string[]) => {
          expect(title).toBe("Which project? Choose a folder");
          choices = options;
          return undefined;
        },
        input: async () => undefined,
      },
    };
    const registry: ProjectSource = { projects: async () => [] };
    expect(await selectProject(ctx, registry)).toEqual({ selected: false });
    expect(choices).toContain(process.cwd());
  });
});
