export function stripAtPrefix(pathText: string): string {
  return pathText.startsWith("@") ? pathText.slice(1) : pathText;
}
