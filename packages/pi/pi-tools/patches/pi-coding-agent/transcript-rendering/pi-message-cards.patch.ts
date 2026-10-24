import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

// Must match MESSAGE_CARD_RENDERER_KEY in the harness transcript constants.
const RENDERER_KEY = "pi.harness.renderMessageCard";

const MODULAR_HELPER = `function harnessCardLines(kind, width, renderContent) {
    const renderCard = Reflect.get(globalThis, "${RENDERER_KEY}");
    return typeof renderCard === "function" ? renderCard(kind, width, renderContent) : renderContent(width);
}
`;
const MODULAR_REPLY_HELPER = `function harnessFinalReply(message, reply) {
    if (message.content.some((content) => content.type === "toolCall"))
        return reply;
    return {
        render: (width) => harnessCardLines("agent", width, (contentWidth) => reply.render(contentWidth)),
        invalidate: () => reply.invalidate(),
    };
}
`;
const BUNDLED_HELPER = [
  "function harnessCardLines(kind,width,renderContent){",
  `let renderCard=Reflect.get(globalThis,"${RENDERER_KEY}");`,
  'return typeof renderCard=="function"?renderCard(kind,width,renderContent):renderContent(width)}',
  "function harnessFinalReply(message,reply){",
  'return message.content.some(content=>content.type==="toolCall")?reply:',
  '{render:width=>harnessCardLines("agent",width,contentWidth=>reply.render(contentWidth)),invalidate:()=>reply.invalidate()}}',
].join("");

const MODULAR_RENDER = "const lines = super.render(width);";
const MODULAR_USER_CARD_RENDER =
  'const lines = harnessCardLines("user", width, (contentWidth) => super.render(contentWidth));';

const MODULAR_REPLY = [
  "this.contentContainer.addChild(new Markdown(content.text.trim(), this.outputPad, 0, this.markdownTheme, undefined, {",
  '                    transform: createMarkdownTransform("assistant", this.isStreaming, this.markdownTransformers),',
  "                }));",
].join("\n");
const MODULAR_REPLY_CARD = [
  "this.contentContainer.addChild(harnessFinalReply(message, new Markdown(content.text.trim(), this.outputPad, 0, this.markdownTheme, undefined, {",
  '                    transform: createMarkdownTransform("assistant", this.isStreaming, this.markdownTransformers),',
  "                })));",
].join("\n");

const BUNDLED_REPLY = [
  "this.contentContainer.addChild(new Markdown(content.text.trim(),this.outputPad,0,this.markdownTheme,void 0,",
  '{transform:createMarkdownTransform("assistant",this.isStreaming,this.markdownTransformers)}));',
].join("");
const BUNDLED_REPLY_CARD = [
  "this.contentContainer.addChild(harnessFinalReply(message,new Markdown(content.text.trim(),this.outputPad,0,this.markdownTheme,void 0,",
  '{transform:createMarkdownTransform("assistant",this.isStreaming,this.markdownTransformers)})));',
].join("");
const BUNDLED_USER_RENDER =
  "render(width){let lines=super.render(width);return lines.length===0||(lines[0]=OSC133_ZONE_START2";
const BUNDLED_USER_CARD_RENDER = [
  'render(width){let lines=harnessCardLines("user",width,contentWidth=>super.render(contentWidth));',
  "return lines.length===0||(lines[0]=OSC133_ZONE_START2",
].join("");
const BUNDLED_FIRST_ZONE_DECLARATION = "var OSC133_ZONE_START=";

const packagePath = readPackagePath();
const componentsPath = join(packagePath, "dist/modes/interactive/components");

const assistantPath = join(componentsPath, "assistant-message.js");
replaceOnce(
  assistantPath,
  "export class AssistantMessageComponent",
  `${MODULAR_HELPER}${MODULAR_REPLY_HELPER}export class AssistantMessageComponent`,
);
replaceOnce(assistantPath, MODULAR_REPLY, MODULAR_REPLY_CARD);

const userPath = join(componentsPath, "user-message.js");
replaceOnce(userPath, "export class UserMessageComponent", `${MODULAR_HELPER}export class UserMessageComponent`);
replaceOnce(userPath, MODULAR_RENDER, MODULAR_USER_CARD_RENDER);

const bundledChunkPath = findBundledChunkContaining(packagePath, BUNDLED_REPLY);
replaceOnce(bundledChunkPath, BUNDLED_FIRST_ZONE_DECLARATION, `${BUNDLED_HELPER}${BUNDLED_FIRST_ZONE_DECLARATION}`);
replaceOnce(bundledChunkPath, BUNDLED_REPLY, BUNDLED_REPLY_CARD);
replaceOnce(bundledChunkPath, BUNDLED_USER_RENDER, BUNDLED_USER_CARD_RENDER);
