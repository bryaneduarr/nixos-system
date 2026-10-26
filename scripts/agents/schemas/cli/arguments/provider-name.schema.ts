import { z } from "zod";
import { PROVIDER_ORDER } from "../../../constants/usage/provider-order.constant.ts";

/** Provider name typed on the command line, limited to the providers in display order. */
export const providerNameSchema = z.enum(PROVIDER_ORDER);
