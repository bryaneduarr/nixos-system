/** Writes text to the system clipboard. */
export type ClipboardWriter = (text: string) => void | Promise<void>;
