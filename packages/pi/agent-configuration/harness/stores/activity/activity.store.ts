import { createActivityStore } from "../../services/activity/store/create-activity-store.service.ts";
import type { ActivityStore } from "../../types/activity/store/activity-store.interface.ts";

export const activityStore: ActivityStore = createActivityStore();
