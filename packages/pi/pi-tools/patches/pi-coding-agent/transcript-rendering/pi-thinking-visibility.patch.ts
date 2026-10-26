import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

// Must match TRANSCRIPT_VISIBILITY_KEY in the harness visibility constants.
const VISIBILITY_KEY = "pi.harness.toolHistoryVisible";

const THINKING_STATUS = `\`Thinking blocks: \${this.hideThinkingBlock ? "hidden" : "visible"}\``;
const MODULAR_THINKING_STATUS = `        this.showStatus(${THINKING_STATUS});\n`;
const MODULAR_REGION = "new MouseRegion(thinkingComponent,";
const MODULAR_REGION_HIDEABLE = "new MouseRegion(harnessThinkingWhenVisible(thinkingComponent),";
const MODULAR_SPACER =
  "if (hasVisibleContentAfter) {\n                    this.contentContainer.addChild(new Spacer(1));";
const MODULAR_SPACER_HIDEABLE =
  "if (hasVisibleContentAfter) {\n                    this.contentContainer.addChild(harnessThinkingWhenVisible(new Spacer(1)));";
const MODULAR_COMPONENT_CLASS = "export class AssistantMessageComponent extends Container {";
const MODULAR_HELPER = `function harnessThinkingWhenVisible(component) {
    return {
        render: (width) => Reflect.get(globalThis, "${VISIBILITY_KEY}") === false ? [] : component.render(width),
        invalidate() { component.invalidate(); },
    };
}
`;

const BUNDLED_THINKING_STATUS = `,this.showStatus(\`Thinking blocks: \${this.hideThinkingBlock?"hidden":"visible"}\`)`;
const BUNDLED_SPACER = "hasVisibleContentAfter&&this.contentContainer.addChild(new Spacer(1))";
const BUNDLED_SPACER_HIDEABLE =
  "hasVisibleContentAfter&&this.contentContainer.addChild(harnessThinkingWhenVisible(new Spacer(1)))";
const BUNDLED_COMPONENT_DECLARATION = 'var OSC133_ZONE_START="\\x1B]133;A\\x07"';
const BUNDLED_HELPER = [
  "function harnessThinkingWhenVisible(component){",
  `return{render:width=>Reflect.get(globalThis,"${VISIBILITY_KEY}")===false?[]:component.render(width),`,
  "invalidate(){component.invalidate()}}}",
].join("");

const packagePath = readPackagePath();

const componentPath = join(packagePath, "dist/modes/interactive/components/assistant-message.js");
replaceOnce(componentPath, MODULAR_REGION, MODULAR_REGION_HIDEABLE);
replaceOnce(componentPath, MODULAR_SPACER, MODULAR_SPACER_HIDEABLE);
replaceOnce(componentPath, MODULAR_COMPONENT_CLASS, `${MODULAR_HELPER}${MODULAR_COMPONENT_CLASS}`);
replaceOnce(join(packagePath, "dist/modes/interactive/interactive-mode.js"), MODULAR_THINKING_STATUS, "");

const bundledChunkPath = findBundledChunkContaining(packagePath, BUNDLED_SPACER);
replaceOnce(bundledChunkPath, MODULAR_REGION, MODULAR_REGION_HIDEABLE);
replaceOnce(bundledChunkPath, BUNDLED_SPACER, BUNDLED_SPACER_HIDEABLE);
replaceOnce(bundledChunkPath, BUNDLED_COMPONENT_DECLARATION, `${BUNDLED_HELPER}${BUNDLED_COMPONENT_DECLARATION}`);
replaceOnce(bundledChunkPath, BUNDLED_THINKING_STATUS, "");
