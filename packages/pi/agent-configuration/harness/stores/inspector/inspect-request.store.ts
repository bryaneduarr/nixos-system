import { createInspectRequestStore } from "../../services/inspector/request/create-inspect-request-store.service.ts";
import type { InspectRequestStore } from "../../types/inspector/request/inspect-request-store.interface.ts";

export const inspectRequestStore: InspectRequestStore = createInspectRequestStore();
