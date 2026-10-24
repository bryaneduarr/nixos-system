import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("the LSP packaging patch uses host peers and removes duplicate host libraries", () => {
  const directory = mkdtempSync(join(tmpdir(), "pi-lsp-package-"));
  const script = join(import.meta.dir, "lsp-host-dependencies.patch.ts");
  const manifestPath = join(directory, "package.json");

  try {
    writeFileSync(
      manifestPath,
      JSON.stringify({
        dependencies: { "@earendil-works/pi-tui": "^0.74.1", typebox: "^1.1.38", "vscode-jsonrpc": "^8.2.1" },
        peerDependencies: { "@earendil-works/pi-ai": "*" },
      }),
    );
    for (const name of ["@earendil-works/pi-tui", "typebox"]) {
      mkdirSync(join(directory, "node_modules", name), { recursive: true });
    }
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = Bun.spawnSync(["node", script, directory]);
      expect(result.exitCode).toBe(0);
    }
    const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
    expect(manifest).toEqual({
      dependencies: { "vscode-jsonrpc": "^8.2.1" },
      peerDependencies: {
        "@earendil-works/pi-ai": "*",
        "@earendil-works/pi-tui": "*",
        typebox: "*",
      },
    });
    expect(existsSync(join(directory, "node_modules/@earendil-works/pi-tui"))).toBe(false);
    expect(existsSync(join(directory, "node_modules/typebox"))).toBe(false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
