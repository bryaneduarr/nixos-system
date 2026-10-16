const queues = new Map<string, Promise<unknown>>();

export function withPathLock<T>(path: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(path) ?? Promise.resolve();
  const next = previous.then(task, task);
  queues.set(
    path,
    next.then(
      () => undefined,
      () => undefined,
    ),
  );
  return next;
}
