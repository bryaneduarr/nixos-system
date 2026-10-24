import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

// Must match API_ERROR_RENDERER_KEY in the harness transcript constants.
const RENDERER_KEY = "pi.harness.renderApiError";

const MODULAR_PI_ERROR_TEXT = `new Text(theme.fg("error", \`Error: \${errorMsg}\`), this.outputPad, 0)`;
const MODULAR_ERROR_TEXT = `this.contentContainer.addChild(${MODULAR_PI_ERROR_TEXT});`;
const MODULAR_ERROR_BOX = `this.contentContainer.addChild(harnessApiErrorComponent(errorMsg) ?? ${MODULAR_PI_ERROR_TEXT});`;
const MODULAR_COMPONENT_CLASS = "export class AssistantMessageComponent extends Container {";
const MODULAR_RENDERER = `function harnessApiErrorComponent(errorMessage) {
    const renderApiError = Reflect.get(globalThis, "${RENDERER_KEY}");
    if (typeof renderApiError !== "function")
        return undefined;
    return { render: (width) => renderApiError(errorMessage, width), invalidate() { } };
}
`;

const BUNDLED_PI_ERROR_TEXT = `new Text(theme.fg("error",\`Error: \${errorMsg}\`),this.outputPad,0)`;
const BUNDLED_ERROR_TEXT = `this.contentContainer.addChild(${BUNDLED_PI_ERROR_TEXT})`;
const BUNDLED_ERROR_BOX = `this.contentContainer.addChild(harnessApiErrorComponent(errorMsg)??${BUNDLED_PI_ERROR_TEXT})`;
const BUNDLED_COMPONENT_DECLARATION = 'var OSC133_ZONE_START="\\x1B]133;A\\x07"';
const BUNDLED_RENDERER = [
  "function harnessApiErrorComponent(errorMessage){",
  `let renderApiError=Reflect.get(globalThis,"${RENDERER_KEY}");`,
  'return typeof renderApiError!="function"?void 0:',
  "{render:width=>renderApiError(errorMessage,width),invalidate(){}}}",
].join("");

const packagePath = readPackagePath();

const componentPath = join(packagePath, "dist/modes/interactive/components/assistant-message.js");
replaceOnce(componentPath, MODULAR_ERROR_TEXT, MODULAR_ERROR_BOX);
replaceOnce(componentPath, MODULAR_COMPONENT_CLASS, `${MODULAR_RENDERER}${MODULAR_COMPONENT_CLASS}`);

const bundledChunkPath = findBundledChunkContaining(packagePath, BUNDLED_ERROR_TEXT);
replaceOnce(bundledChunkPath, BUNDLED_ERROR_TEXT, BUNDLED_ERROR_BOX);
replaceOnce(bundledChunkPath, BUNDLED_COMPONENT_DECLARATION, `${BUNDLED_RENDERER}${BUNDLED_COMPONENT_DECLARATION}`);
