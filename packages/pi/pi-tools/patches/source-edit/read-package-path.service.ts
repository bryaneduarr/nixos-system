export function readPackagePath(): string {
  const packagePath = process.argv[2];
  if (!packagePath) throw new Error("Pi package path is required");
  return packagePath;
}
