import { BODY_TOP_ROW } from "../../../constants/inspector/layout/page-layout.constant.ts";
import { DETAIL_TITLE_ROWS } from "../../../constants/split-view/layout.constant.ts";
import type { InspectorRow } from "../../../types/inspector/detail/inspector-row.interface.ts";
import type { InspectorLayoutState } from "../../../types/inspector/view/inspector-layout.interface.ts";
import type { SplitViewGeometry } from "../../../types/split-view/split-view-geometry.interface.ts";

export function buildToolsPageLayout(geometry: SplitViewGeometry, rows: readonly InspectorRow[]): InspectorLayoutState {
  return {
    kind: "laid-out",
    layout: {
      leftWidth: geometry.leftWidth,
      bodyTop: BODY_TOP_ROW,
      bodyHeight: geometry.twoPane ? geometry.height : geometry.listHeight + DETAIL_TITLE_ROWS + geometry.detailHeight,
      listHeight: geometry.listHeight,
      twoPane: geometry.twoPane,
      rows,
    },
  };
}
