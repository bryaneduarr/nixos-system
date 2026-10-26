/** Runs one Herdr CLI command and returns the result object of its response. */
export type HerdrCommand = (args: readonly string[]) => Promise<Record<string, unknown>>;
