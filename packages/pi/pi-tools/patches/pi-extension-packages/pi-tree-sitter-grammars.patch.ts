import { join } from "node:path";
import { readPackagePath } from "../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../source-edit/replace-once.service.ts";

// tree-sitter-wasms builds Lua for an older tree-sitter ABI that web-tree-sitter 0.26 refuses to load.
const BROKEN_LUA_ENTRY = '  ".lua":    { pkg: "tree-sitter-wasms", wasm: "out/tree-sitter-lua.wasm" },';
const WORKING_LUA_ENTRY =
  '  ".lua":    { pkg: "@tree-sitter-grammars/tree-sitter-lua", wasm: "tree-sitter-lua.wasm" },';

const packagePath = readPackagePath();

replaceOnce(join(packagePath, "src/grammar.ts"), BROKEN_LUA_ENTRY, WORKING_LUA_ENTRY);
