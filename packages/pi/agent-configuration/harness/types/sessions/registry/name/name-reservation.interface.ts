import type { Static } from "typebox";
import type { NameReservationSchema } from "../../../../schemas/sessions/registry/name/name-reservation.schema.ts";

/** Name reservation that orders a session among the instances of its project. */
export type NameReservation = Static<typeof NameReservationSchema>;
