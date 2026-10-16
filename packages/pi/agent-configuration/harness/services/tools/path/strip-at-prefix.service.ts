export function stripAtPrefix(value: string): string {
  return value.startsWith("@") ? value.slice(1) : value;
}
