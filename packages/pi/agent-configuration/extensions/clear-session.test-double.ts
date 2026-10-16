import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export function asExtensionApi(fake: object): ExtensionAPI {
  // Pi's API overloads `on` per event, so a fake with only the members these extensions call cannot be typed without a cast.
  return fake as ExtensionAPI;
}
