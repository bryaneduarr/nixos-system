import { expect, test } from "bun:test";
import { createImplementationQueue } from "./create-implementation-queue.service.ts";

test("implementation tasks run one at a time", async () => {
  const queue = createImplementationQueue();
  let active = 0;
  let peak = 0;
  let releaseFirst!: () => void;
  let markFirstStarted!: () => void;
  const firstStarted = new Promise<void>((resolve) => {
    markFirstStarted = resolve;
  });
  const firstGate = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });
  const events: string[] = [];

  const first = queue.run(async () => {
    active += 1;
    peak = Math.max(peak, active);
    events.push("first started");
    markFirstStarted();
    await firstGate;
    events.push("first finished");
    active -= 1;
  });
  await firstStarted;

  const second = queue.run(async () => {
    active += 1;
    peak = Math.max(peak, active);
    events.push("second started");
    active -= 1;
  });
  await Promise.resolve();

  expect(events).toEqual(["first started"]);
  releaseFirst();
  await Promise.all([first, second]);

  expect(peak).toBe(1);
  expect(events).toEqual(["first started", "first finished", "second started"]);
});
