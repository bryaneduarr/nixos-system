import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

// Must match THINKING_BOX_RENDERER_KEY in the harness thinking box constants.
const RENDERER_KEY = "pi.harness.renderThinkingBox";

const THINKING_REGION = "new MouseRegion(harnessThinkingWhenVisible(thinkingComponent),";
const THINKING_BOXED_REGION =
  "new MouseRegion(harnessThinkingWhenVisible(harnessThinkingBoxComponent(thinkingComponent)),";

const MODULAR_COMPONENT_CLASS = "export class AssistantMessageComponent extends Container {";
const MODULAR_HELPER = `function harnessThinkingBoxComponent(component) {
    const renderBox = Reflect.get(globalThis, "${RENDERER_KEY}");
    if (typeof renderBox !== "function")
        return component;
    return {
        render: (width) => renderBox(width, (contentWidth) => component.render(contentWidth)),
        invalidate() { component.invalidate(); },
    };
}
`;

const BUNDLED_COMPONENT_DECLARATION = 'var OSC133_ZONE_START="\\x1B]133;A\\x07"';
const BUNDLED_HELPER = [
  "function harnessThinkingBoxComponent(component){",
  `let renderBox=Reflect.get(globalThis,"${RENDERER_KEY}");`,
  'if(typeof renderBox!="function")return component;',
  "return{render:width=>renderBox(width,contentWidth=>component.render(contentWidth)),",
  "invalidate(){component.invalidate()}}}",
].join("");

const packagePath = readPackagePath();

const componentPath = join(packagePath, "dist/modes/interactive/components/assistant-message.js");
replaceOnce(componentPath, MODULAR_COMPONENT_CLASS, `${MODULAR_HELPER}${MODULAR_COMPONENT_CLASS}`);
replaceOnce(componentPath, THINKING_REGION, THINKING_BOXED_REGION);

const bundledChunkPath = findBundledChunkContaining(packagePath, THINKING_REGION);
replaceOnce(bundledChunkPath, BUNDLED_COMPONENT_DECLARATION, `${BUNDLED_HELPER}${BUNDLED_COMPONENT_DECLARATION}`);
replaceOnce(bundledChunkPath, THINKING_REGION, THINKING_BOXED_REGION);
