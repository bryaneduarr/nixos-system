/** Answer from a search engine such as a language server, fff, or tree-sitter. */
export type BackendSearchResult =
  | {
      /** An engine answered. */
      readonly found: true;
      /** Strategy label naming the engine that answered. */
      readonly label: string;
      /** Text the engine returned. */
      readonly text: string;
    }
  | {
      /** No engine answered, so the built-in search runs instead. */
      readonly found: false;
    };
