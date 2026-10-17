import { Type } from "typebox";
import { PRIORITY_SERVICE_TIER } from "../../constants/codex/codex.constant.ts";

export const ModelsCacheSchema = Type.Object({
  models: Type.Array(Type.Unknown(), { description: "Cached model entries, each validated on its own." }),
});

export const CachedModelSchema = Type.Object({
  slug: Type.String({ description: "Model identifier used by Codex." }),
  service_tiers: Type.Array(Type.Unknown(), { description: "Service tiers, each validated on its own." }),
});

export const PriorityServiceTierSchema = Type.Object({
  id: Type.Literal(PRIORITY_SERVICE_TIER, { description: "Identifier of the priority service tier." }),
});
