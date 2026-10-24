import { join } from "node:path";
import { readPackagePath } from "../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../source-edit/replace-once.service.ts";

// Must match INPUT_CARD_RENDERER_KEY in the harness transcript constants.
const RENDERER_KEY = "pi.harness.renderInputCard";

const EDITOR_RENDER_START = "      editor.render = (width: number): string[] => {\n";
const EDITOR_RENDER_WITH_INPUT_CARD = [
  EDITOR_RENDER_START,
  `        const renderInputCard = Reflect.get(globalThis, "${RENDERER_KEY}");\n`,
  '        if (typeof renderInputCard === "function") return renderInputCard(width, originalRender);\n',
].join("");

const packagePath = readPackagePath();
replaceOnce(join(packagePath, "index.ts"), EDITOR_RENDER_START, EDITOR_RENDER_WITH_INPUT_CARD);
