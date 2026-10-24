import { footerLinks } from "../../../components/split-view/footer-links.component.ts";
import { frameModal } from "../../../components/split-view/frame-modal.component.ts";
import { pageTitle } from "../../../components/split-view/page-title.component.ts";
import { splitPanes } from "../../../components/split-view/split-panes.component.ts";
import { viewHeader } from "../../../components/split-view/view-header.component.ts";
import {
  COLLECTION_BY_KEY,
  COLLECTION_EMPTY_TEXT,
  COLLECTION_LABEL,
} from "../../../constants/prompts/collection.constant.ts";
import { THEME_DIM, THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import type { BrowserRenderInput } from "../../../types/prompts/render/browser-render-input.interface.ts";
import type { PromptCollectionName } from "../../../types/prompts/view/prompt-collections.interface.ts";
import type { SplitViewFooterLink } from "../../../types/split-view/footer-link.interface.ts";
import { renderPromptList } from "./render-prompt-list.service.ts";
import { renderPromptRow } from "./render-prompt-row.service.ts";

function collectionLinks(shown: PromptCollectionName): SplitViewFooterLink[] {
  return Object.entries(COLLECTION_BY_KEY).map(([key, collection]) => ({
    key,
    name: COLLECTION_LABEL[collection],
    active: collection === shown,
  }));
}

function bodyLines(input: BrowserRenderInput): string[] {
  const { geometry, theme } = input;
  if (input.summaries.length === 0) return [theme.fg(THEME_DIM, COLLECTION_EMPTY_TEXT[input.collection])];
  const list = renderPromptList({ summaries: input.summaries, selected: input.selected, geometry, theme });
  const detail = input.rows
    .slice(input.offset, input.offset + geometry.detailHeight)
    .map((row) => renderPromptRow({ row, navigation: input.navigation, focused: input.focus === "detail", theme }));
  return splitPanes({ list, detail, geometry, focus: input.focus, theme });
}

export function renderBrowserLines(input: BrowserRenderInput): string[] {
  const { geometry, theme, collection } = input;
  const count = `${input.summaries.length} ${COLLECTION_LABEL[collection].toLowerCase()}`;
  const lines = [
    ...viewHeader(theme.fg(THEME_MUTED, `${count}  ${input.keyHint}`), geometry.contentWidth, theme),
    pageTitle(COLLECTION_LABEL[collection], theme),
    ...bodyLines(input),
    footerLinks({ links: collectionLinks(collection), status: input.status, width: geometry.contentWidth, theme }),
  ];
  return frameModal(lines, input.columns, theme);
}
