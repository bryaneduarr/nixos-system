/** How a provider HTTP status code affects a usage request, discriminated by the outcome it leads to. */
export type HttpStatusClass =
  | {
      /** The endpoint rejected the access token with HTTP 401 or 403. */
      readonly state: "rejected-token";
    }
  | {
      /** The endpoint answered with a status other than 2xx, 401, or 403. */
      readonly state: "http-error";
      /** HTTP status code the endpoint answered with. */
      readonly status: number;
    }
  | {
      /** The endpoint answered with a 2xx status, so its body can be read. */
      readonly state: "success";
    };
