import { expect, test } from "bun:test";
import { rgbColor, visibleWidth } from "@earendil-works/pi-tui";
import { selectProject, selectSession, terminalLabel } from "../agent-configuration/harness/sessions/menu.ts";

const rows = [
  {
    identity: "one",
    pid: process.pid,
    cwd: "/tmp/project-a",
    name: "First",
    branch: "main",
    percent: 12,
    status: "idle",
  },
  {
    identity: "two",
    pid: 1,
    cwd: "/tmp/project-b",
    name: "Second",
    branch: "topic",
    percent: null,
    status: "draft",
    contextTokens: 100,
    contextWindow: 1000,
  },
];

test("session menu filters groups, uses one status, and bounds terminal widths", async () => {
  let component: any;
  const colors: unknown[] = [];
  const ctx: any = {
    ui: {
      custom: (factory: any) =>
        new Promise((resolve) => {
          const tui = { terminal: { rows: 40 }, requestRender: () => {} };
          const theme = {
            fg: (_color: string, text: string) => text,
            bold: (text: string) => text,
            style: (text: string, options: any) => {
              colors.push(options.fg);
              return `\x1b[38;2;255;158;68m${text}\x1b[0m`;
            },
          };
          component = factory(tui, theme, {}, resolve);
        }),
    },
  };
  const selection = selectSession(ctx, { list: async () => rows } as any);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const text = component.render(100).join("\n");
  expect(text).toContain("project-a");
  expect(text).toContain("idle");
  expect(text).toContain("draft");
  expect(text).not.toContain("No draft");
  expect(text).toContain("12%");
  expect(text).not.toContain("/tmp/project-a");
  expect(text).not.toContain("/tmp/project-b");
  expect(text).not.toContain("Main context:");
  expect(text).not.toContain("tokens");
  expect(text).not.toContain("Filter:");
  expect(text).toContain("N New   i Filter   Esc Close");
  expect(text).not.toContain("Select");
  expect(text).not.toContain("Switch");
  expect(text).not.toContain("Current");
  expect(colors).toContainEqual(rgbColor(255, 158, 68));
  for (const width of [1, 10, 40, 100]) {
    for (const line of component.render(width)) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
  }
  component.handleInput("i");
  expect(component.focused).toBe(true);
  component.handleInput("topic");
  component.handleInput("\r");
  expect(component.focused).toBe(false);
  expect(component.render(100).join("\n")).not.toContain("First");
  expect(component.render(100).join("\n")).not.toContain("tokens");
  component.handleInput("\r");
  expect(await selection).toBe(rows[1]);
  component.dispose();
});

test("session menu uses Vim navigation and keeps command keys as text while filtering", async () => {
  let component: any;
  const ctx: any = {
    ui: {
      custom: (factory: any) =>
        new Promise((resolve) => {
          const tui = { terminal: { rows: 40 }, requestRender: () => {} };
          const theme = {
            fg: (_color: string, text: string) => text,
            bold: (text: string) => text,
            style: (text: string) => text,
          };
          component = factory(tui, theme, {}, resolve);
        }),
    },
  };
  const registry: any = { list: async () => rows };
  const open = async () => {
    const selection = selectSession(ctx, registry);
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { selection };
  };
  const selectedName = () => component.render(100).find((line: string) => line.includes("> "));

  let menu = await open();
  component.handleInput("k");
  expect(selectedName()).toContain("First");
  component.handleInput("j");
  expect(selectedName()).toContain("Second");
  component.handleInput("j");
  expect(selectedName()).toContain("Second");
  component.handleInput("k");
  expect(selectedName()).toContain("First");
  component.handleInput("\r");
  expect(await menu.selection).toBe(rows[0]);
  component.dispose();

  menu = await open();
  component.handleInput("i");
  component.handleInput("j");
  component.handleInput("k");
  component.handleInput("n");
  expect(component.render(100).join("\n")).toContain("jkn");
  component.handleInput("\x1b");
  expect(component.focused).toBe(false);
  component.handleInput("\x1b");
  expect(await menu.selection).toBeUndefined();
  component.dispose();

  menu = await open();
  component.handleInput("n");
  expect(await menu.selection).toBe("new");
  component.dispose();
});

test("project picker includes the current folder and cancellation creates nothing", async () => {
  let choices: string[] = [];
  const ctx: any = {
    cwd: process.cwd(),
    ui: {
      select: async (title: string, options: string[]) => {
        expect(title).toBe("Which project? Choose a folder");
        choices = options;
        return undefined;
      },
    },
  };
  expect(await selectProject(ctx, { projects: async () => [] } as any)).toBeUndefined();
  expect(choices).toContain(process.cwd());
});

test("terminal labels cannot inject terminal control sequences", () => {
  const label = terminalLabel("project\x1b[2J\nname");
  expect(label).not.toContain("\x1b");
  expect(label).not.toContain("\n");
});
