import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

const MODULAR_SUBMIT_BEFORE = [
  "            this.flushPendingBashComponents();",
  "            if (this.onInputCallback) {",
  "",
].join("\n");
const MODULAR_SUBMIT_AFTER = [
  '            if ("scrollToBottom" in this.ui)',
  "                this.ui.scrollToBottom();",
  MODULAR_SUBMIT_BEFORE,
].join("\n");

const BUNDLED_SUBMIT_BEFORE = "this.flushPendingBashComponents(),this.onInputCallback?this.onInputCallback(text)";
const BUNDLED_SUBMIT_AFTER = `"scrollToBottom"in this.ui&&this.ui.scrollToBottom(),${BUNDLED_SUBMIT_BEFORE}`;

const packagePath = readPackagePath();

replaceOnce(
  join(packagePath, "dist/modes/interactive/interactive-mode.js"),
  MODULAR_SUBMIT_BEFORE,
  MODULAR_SUBMIT_AFTER,
);
replaceOnce(
  findBundledChunkContaining(packagePath, BUNDLED_SUBMIT_BEFORE),
  BUNDLED_SUBMIT_BEFORE,
  BUNDLED_SUBMIT_AFTER,
);
