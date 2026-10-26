import { expect, test } from "bun:test";
import { createImplementationQueue } from "./create-implementation-queue.service.ts";
import { createGate } from "./create-implementation-queue.test-double.ts";

test("implementation tasks run one at a time", async () => {
  const queue = createImplementationQueue();
  let active = 0;
  let peak = 0;
  const firstStarted = createGate();
  const firstGate = createGate();
  const events: string[] = [];

  const first = queue.run(async () => {
    active += 1;
    peak = Math.max(peak, active);
    events.push("first started");
    firstStarted.open();
    await firstGate.opened;
    events.push("first finished");
    active -= 1;
  });
  await firstStarted.opened;

  const second = queue.run(async () => {
    active += 1;
    peak = Math.max(peak, active);
    events.push("second started");
    active -= 1;
  });
  await Promise.resolve();

  expect(events).toEqual(["first started"]);
  firstGate.open();
  await Promise.all([first, second]);

  expect(peak).toBe(1);
  expect(events).toEqual(["first started", "first finished", "second started"]);
});
