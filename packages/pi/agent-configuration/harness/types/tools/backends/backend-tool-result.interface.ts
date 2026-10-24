/** Text a backend tool returned, or the absence of a usable answer. */
export type BackendToolResult =
  | {
      /** The backend tool answered without an error. */
      readonly found: true;
      /** Text the backend tool returned. */
      readonly text: string;
    }
  | {
      /** The backend tool is missing, failed, timed out, or returned no text. */
      readonly found: false;
    };
