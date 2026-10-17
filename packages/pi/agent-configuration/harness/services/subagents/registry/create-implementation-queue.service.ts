import type { ImplementationQueue } from "../../../types/subagents/registry/implementation-queue.interface.ts";

export function createImplementationQueue(): ImplementationQueue {
  let tail: Promise<void> = Promise.resolve();

  return {
    async run<T>(operation: () => Promise<T>): Promise<T> {
      const previous = tail;
      let release = () => {};
      const queued = new Promise<void>((resolve) => {
        release = resolve;
      });
      tail = queued;

      await previous;

      try {
        return await operation();
      } finally {
        release();
      }
    },
  };
}
