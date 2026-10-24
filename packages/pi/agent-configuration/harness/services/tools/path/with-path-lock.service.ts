const pathQueues = new Map<string, Promise<void>>();

export function withPathLock<T>(path: string, task: () => Promise<T>): Promise<T> {
  const previous = pathQueues.get(path) ?? Promise.resolve();
  const next = previous.then(task, task);
  pathQueues.set(
    path,
    next.then(
      () => undefined,
      () => undefined,
    ),
  );
  return next;
}
