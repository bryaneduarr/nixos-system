/** Response to a provider HTTP request, reduced to what the usage readers need. */
export interface ProviderHttpResponse {
  /** HTTP status code the provider answered with. */
  readonly status: number;
  /** Reads the body as parsed JSON, which must be validated by a schema before use. */
  readonly json: () => Promise<unknown>;
}

/** Options sent with a provider HTTP GET request. */
export interface ProviderHttpRequestOptions {
  /** Header values keyed by header name. */
  readonly headers: Readonly<Record<string, string>>;
}

/** Sends a GET request to a provider endpoint; the promise rejects when the network fails. */
export type FetchProviderUrl = (url: string, options: ProviderHttpRequestOptions) => Promise<ProviderHttpResponse>;

/** Machine state a provider usage reader depends on, injected so tests never touch real user state. */
export interface ProviderEnvironment {
  /** Home directory that holds the provider's credential folders. */
  readonly homeDirectory: string;
  /** Moment used to judge whether a stored login has expired. */
  readonly now: Date;
  /** Performs HTTP requests to provider usage endpoints. */
  readonly fetchUrl: FetchProviderUrl;
}
