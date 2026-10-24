import { join } from "node:path";
import { findBundledChunkContaining } from "../../source-edit/find-bundled-chunk-containing.service.ts";
import { readPackagePath } from "../../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../../source-edit/replace-once.service.ts";

const TURN_BOUNDS = `function harnessTurnBounds(children, turnsFromLatest) {
    const starts = [];
    children.forEach((child, index) => {
        if (child instanceof UserMessageComponent) starts.push(index);
    });
    if (starts.length === 0) return undefined;
    const focused = Math.max(0, starts.length - 1 - turnsFromLatest);
    return {
        begin: focused === 0 ? 0 : starts[focused],
        end: focused + 1 < starts.length ? starts[focused + 1] : children.length,
        earlier: focused,
        later: starts.length - 1 - focused,
    };
}
`;

const TURN_RENDER = `render(width) {
        const view = Reflect.get(globalThis, "pi.harness.turnView");
        const children = this.children;
        const bounds = view && view.hidden === true ? harnessTurnBounds(children, view.turnsFromLatest) : undefined;
        if (bounds === undefined) return this.renderToolFiltered(width);
        const renderDivider = Reflect.get(globalThis, "pi.harness.renderTurnDivider");
        const divider = (direction, hiddenCount) => hiddenCount > 0 && typeof renderDivider === "function" ? renderDivider({ direction, hiddenCount, width }) : [];
        this.children = children.slice(bounds.begin, bounds.end);
        try {
            return [...divider("earlier", bounds.earlier), ...this.renderToolFiltered(width), ...divider("later", bounds.later)];
        }
        finally {
            this.children = children;
        }
    }
    renderToolFiltered(width) {`;

const MODULAR_CLASS = "class HarnessFilteredChatContainer extends Container {\n    render(width) {";
const BUNDLED_CLASS = "var HarnessFilteredChatContainer=class extends Container{render(width){";
const BUNDLED_RENDER = TURN_RENDER.replaceAll("\n", "").replaceAll("    ", "");

const packagePath = readPackagePath();

replaceOnce(
  join(packagePath, "dist/modes/interactive/interactive-mode.js"),
  MODULAR_CLASS,
  `${TURN_BOUNDS}class HarnessFilteredChatContainer extends Container {\n    ${TURN_RENDER}`,
);
replaceOnce(
  findBundledChunkContaining(packagePath, BUNDLED_CLASS),
  BUNDLED_CLASS,
  `${TURN_BOUNDS.replaceAll("\n", "").replaceAll("    ", "")}var HarnessFilteredChatContainer=class extends Container{${BUNDLED_RENDER}`,
);
