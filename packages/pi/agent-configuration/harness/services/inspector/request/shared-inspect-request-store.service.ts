import type { InspectRequestStore } from "../../../types/inspector/request/inspect-request-store.interface.ts";
import { createInspectRequestStore } from "./create-inspect-request-store.service.ts";

export const inspectRequestStore: InspectRequestStore = createInspectRequestStore();
