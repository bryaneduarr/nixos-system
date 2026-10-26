export function matchParentheses(code: string): ReadonlyMap<number, number> {
  const closeByOpen = new Map<number, number>();
  const openIndexes: number[] = [];
  [...code].forEach((character, index) => {
    if (character === "(") openIndexes.push(index);
    const openIndex = character === ")" ? openIndexes.pop() : undefined;
    if (openIndex !== undefined) closeByOpen.set(openIndex, index);
  });
  return closeByOpen;
}
