import { expect, test } from "bun:test";
import { fastModelsFromCache } from "./fast-models-from-cache.service.ts";

test("the model cache keeps only models with a priority service tier", () => {
  for (const value of [null, {}, { models: null }, { models: [null, 2, {}] }]) {
    expect(fastModelsFromCache(value).size).toBe(0);
  }
  const models = fastModelsFromCache({
    models: [
      { slug: "fast", service_tiers: [null, { id: "priority" }] },
      { slug: "slow", service_tiers: [{ id: "default" }] },
    ],
  });
  expect([...models]).toEqual(["fast"]);
});
