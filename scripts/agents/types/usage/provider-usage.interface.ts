import type { z } from "zod";
import type { PROVIDER_ORDER } from "../../constants/usage/provider-order.constant.ts";
import type { usageWindowSchema } from "../../schemas/usage/usage-window.schema.ts";

/** Identifier of a provider whose usage the CLI reports. */
export type ProviderId = (typeof PROVIDER_ORDER)[number];

/** One limit window reported by a provider, with validated fields. */
export type UsageWindow = Readonly<z.output<typeof usageWindowSchema>>;

/** Plan the provider reports for the signed-in account. */
export type PlanReport =
  | {
      /** The provider reported a plan. */
      readonly state: "reported";
      /** Plan name as the provider returned it, such as `free`. */
      readonly name: string;
    }
  | {
      /** The provider did not report a plan. */
      readonly state: "unreported";
    };

/** Usage read result for one provider, discriminated by its status. */
export type ProviderUsage =
  | {
      /** The provider's windows were read successfully. */
      readonly status: "ok";
      /** Provider the usage belongs to. */
      readonly provider: ProviderId;
      /** Plan the provider reported, or that it reported none. */
      readonly plan: PlanReport;
      /** Every limit window the provider reported, in the provider's order. */
      readonly windows: readonly UsageWindow[];
    }
  | {
      /** No signed-in account exists for the provider on this machine. */
      readonly status: "not-signed-in";
      /** Provider the usage belongs to. */
      readonly provider: ProviderId;
      /** Next step shown on the provider's card. */
      readonly message: string;
    }
  | {
      /** The stored login exists but the provider rejected it. */
      readonly status: "login-expired";
      /** Provider the usage belongs to. */
      readonly provider: ProviderId;
      /** Next step shown on the provider's card. */
      readonly message: string;
    }
  | {
      /** The provider could not be read for another reason. */
      readonly status: "error";
      /** Provider the usage belongs to. */
      readonly provider: ProviderId;
      /** Reason shown on the provider's card. */
      readonly message: string;
    };
