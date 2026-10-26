/** Result of reading Pi's auth file for an OpenCode Go key, discriminated by whether a usable key exists. */
export type OpenCodeKeyRead =
  | {
      /** A usable OpenCode Go key was found. */
      readonly state: "signed-in";
      /** API key that authorizes requests to the usage endpoint. */
      readonly apiKey: string;
    }
  | {
      /** The auth file is missing, or it holds no OpenCode Go entry with a key. */
      readonly state: "not-signed-in";
    }
  | {
      /** The auth file exists but cannot be read or its OpenCode Go entry has an unexpected shape. */
      readonly state: "unreadable";
    };
