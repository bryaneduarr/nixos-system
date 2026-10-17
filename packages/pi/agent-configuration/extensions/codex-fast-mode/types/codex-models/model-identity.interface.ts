/** Provider, API, and identifier of a model, the fields that decide fast-mode support. */
export interface ModelIdentity {
  /** Provider that serves the model. */
  readonly provider: string;
  /** API the model is called through. */
  readonly api: string;
  /** Model identifier within the provider. */
  readonly id: string;
}
