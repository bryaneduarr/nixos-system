import type { AssistantActivitySnapshot } from "../../store/assistant-activity-snapshot.interface.ts";

/** Result of reading the thinking and response text of an assistant message. */
export type AssistantActivityLookup =
  | { readonly found: true; readonly snapshot: AssistantActivitySnapshot }
  | { readonly found: false };
