import {
  HTTP_FORBIDDEN_STATUS,
  HTTP_SUCCESS_MAX_STATUS,
  HTTP_SUCCESS_MIN_STATUS,
  HTTP_UNAUTHORIZED_STATUS,
} from "../../../constants/providers/provider-http.constant.ts";
import type { HttpStatusClass } from "../../../types/providers/http/http-status-class.interface.ts";

function isRejectedTokenStatus(status: number): boolean {
  return status === HTTP_UNAUTHORIZED_STATUS || status === HTTP_FORBIDDEN_STATUS;
}

function isSuccessStatus(status: number): boolean {
  return status >= HTTP_SUCCESS_MIN_STATUS && status <= HTTP_SUCCESS_MAX_STATUS;
}

export function classifyHttpStatus(status: number): HttpStatusClass {
  if (isRejectedTokenStatus(status)) return { state: "rejected-token" };
  if (isSuccessStatus(status)) return { state: "success" };
  return { state: "http-error", status };
}
