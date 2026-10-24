export function handlerNamed<T>(handlers: Map<string, T>, name: string): T {
  const handler = handlers.get(name);
  if (handler === undefined) throw new Error(`Missing handler ${name}`);
  return handler;
}
