export function requireElement<T>(elements: readonly T[], index: number, message: string): T {
  const element = elements.at(index);
  if (element === undefined) throw new Error(message);
  return element;
}
