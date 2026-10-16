import { describe, expect, test } from "bun:test";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SessionRegistry } from "../../../types/sessions/registry/session-registry.interface.ts";
import { selectProject } from "./select-project.service.ts";

describe("selectProject", () => {
  test("project picker includes the current folder and cancellation creates nothing", async () => {
    let choices: string[] = [];
    const ctx = {
      cwd: process.cwd(),
      ui: {
        select: async (title: string, options: string[]) => {
          expect(title).toBe("Which project? Choose a folder");
          choices = options;
          return undefined;
        },
      },
    } as unknown as ExtensionContext;
    const registry = { projects: async () => [] } as unknown as SessionRegistry;
    expect(await selectProject(ctx, registry)).toEqual({ selected: false });
    expect(choices).toContain(process.cwd());
  });
});
