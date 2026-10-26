import { SESSION_IDENTITY_PATTERN } from "../../../../constants/sessions/registry/registry.constant.ts";

export function isSessionIdentity(identity: string): boolean {
  return SESSION_IDENTITY_PATTERN.test(identity);
}
