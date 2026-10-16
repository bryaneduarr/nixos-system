import { readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Input, matchesKey, rgbColor, truncateToWidth } from "@earendil-works/pi-tui";
import { canonicalDirectory, type LiveSession, type SessionRegistry } from "./registry.ts";

export type MenuSelection = LiveSession | "new" | undefined;

export function terminalLabel(text: string): string {
  return text.replace(/[\x00-\x1f\x7f-\x9f]/g, " ");
}

export async function selectSession(ctx: ExtensionContext, registry: SessionRegistry): Promise<MenuSelection> {
  return ctx.ui.custom<MenuSelection>((tui, theme, _keys, done) => {
    let rows: LiveSession[] = [];
    let selectedId = "";
    let error = "";
    let refreshing = false;
    let disposed = false;
    let filtering = false;
    const filter = new Input({ prompt: "Filter: " });
    const filtered = () => {
      const query = filter.getValue().toLocaleLowerCase();
      return rows.filter((row) => `${row.cwd} ${row.name} ${row.branch} ${row.status}`.toLocaleLowerCase().includes(query));
    };
    const refresh = async () => {
      if (refreshing || disposed) return;
      refreshing = true;
      try {
        const updated = await registry.list();
        if (!disposed) {
          rows = updated;
          if (!filtered().some((row) => row.identity === selectedId)) {
            const current = filtered().find((row) => row.pid === process.pid);
            selectedId = current?.identity || filtered()[0]?.identity || "";
          }
          error = "";
        }
      } catch (failure) { error = String(failure); }
      finally { refreshing = false; if (!disposed) tui.requestRender(); }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 1000);
    return {
      dispose() { disposed = true; clearInterval(timer); },
      get focused() { return filter.focused; },
      set focused(value: boolean) { filter.focused = value && filtering; },
      invalidate() { filter.invalidate(); },
      handleInput(data: string) {
        if (filtering) {
          if (matchesKey(data, "escape") || matchesKey(data, "enter")) {
            filtering = false;
            filter.focused = false;
          } else {
            filter.handleInput(data);
            if (!filtered().some((row) => row.identity === selectedId)) {
              const current = filtered().find((row) => row.pid === process.pid);
              selectedId = current?.identity || filtered()[0]?.identity || "";
            }
          }
        } else if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) {
          done(undefined);
        } else if (data === "n" || data === "N") {
          done("new");
        } else if (matchesKey(data, "i")) {
          filtering = true;
          filter.focused = true;
        } else if (matchesKey(data, "enter")) {
          done(filtered().find((row) => row.identity === selectedId));
        } else {
          const visible = filtered();
          const index = visible.findIndex((row) => row.identity === selectedId);
          let next = index;
          if (matchesKey(data, "k") || matchesKey(data, "up")) next = Math.max(0, index - 1);
          if (matchesKey(data, "j") || matchesKey(data, "down")) next = Math.min(visible.length - 1, index + 1);
          selectedId = visible[next]?.identity || "";
        }
        tui.requestRender();
      },
      render(width: number) {
        const visible = filtered();
        const lines = [theme.bold(theme.fg("accent", "Pi sessions"))];
        if (filtering || filter.getValue()) lines.push(...filter.render(Math.max(1, width - 4)));
        lines.push("");
        const selected = visible.findIndex((row) => row.identity === selectedId);
        const count = Math.max(1, Math.floor((tui.terminal.rows * 0.7 - 11) / 2));
        const start = Math.max(0, selected - Math.floor(count / 2));
        let cwd = "";
        for (const row of visible.slice(start, start + count)) {
          if (row.cwd !== cwd) {
            cwd = row.cwd;
            lines.push(theme.fg("muted", terminalLabel(basename(cwd) || cwd)));
          }
          const prefix = row.identity === selectedId ? "> " : "  ";
          let status: string = row.status;
          if (row.status === "draft") status = theme.style("draft", { fg: rgbColor(255, 158, 68) });
          const context = row.percent === null ? "unknown" : `${row.percent.toFixed(0)}%`;
          const current = row.pid === process.pid ? " *" : "";
          lines.push(`${prefix}${terminalLabel(row.name)}${current}  ${status}  ${terminalLabel(row.branch)}  ${context}`);
        }
        if (visible.length === 0) lines.push("No matching live Pi sessions");
        if (error) lines.push("", terminalLabel(error));
        lines.push("", "N New   i Filter   Esc Close");
        const innerWidth = Math.max(1, width - 4);
        const borderWidth = Math.max(0, width - 2);
        const body = lines.map((line) => `${theme.fg("borderMuted", "│")} ${truncateToWidth(line, innerWidth, "", true)} ${theme.fg("borderMuted", "│")}`);
        return [
          theme.fg("borderMuted", `╭${"─".repeat(borderWidth)}╮`),
          ...body,
          theme.fg("borderMuted", `╰${"─".repeat(borderWidth)}╯`),
        ].map((line) => truncateToWidth(line, width));
      },
    };
  }, { overlay: true, overlayOptions: { anchor: "center", width: "92%", maxHeight: "88%", margin: 1 } });
}

async function browse(ctx: ExtensionContext): Promise<string | undefined> {
  let cwd = await canonicalDirectory(ctx.cwd, ctx.cwd);
  while (true) {
    const children = (await readdir(cwd, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const choice = await ctx.ui.select(cwd, ["Use this directory", "Enter path", "..", ...children.map((name) => `./${name}`)]);
    if (!choice) return;
    if (choice === "Use this directory") return cwd;
    if (choice === "Enter path") {
      const path = await ctx.ui.input("Project directory", cwd);
      if (!path?.trim()) continue;
      cwd = await canonicalDirectory(path, cwd);
    } else {
      cwd = await canonicalDirectory(choice === ".." ? dirname(cwd) : join(cwd, choice.slice(2)), cwd);
    }
  }
}

export async function selectProject(ctx: ExtensionContext, registry: SessionRegistry): Promise<string | undefined> {
  const paths = [...new Set([await canonicalDirectory(ctx.cwd, ctx.cwd), ...await registry.projects()])];
  const choice = await ctx.ui.select("Which project? Choose a folder", ["Browse directories", "Enter path", ...paths]);
  if (!choice) return;
  if (choice === "Browse directories") return browse(ctx);
  if (choice === "Enter path") {
    const path = await ctx.ui.input("Project directory", ctx.cwd);
    if (!path?.trim()) return;
    return canonicalDirectory(path, ctx.cwd);
  }
  return canonicalDirectory(choice, ctx.cwd);
}
