export function isTestFile(file: string): boolean {
  const isInTestDirectory = /(^|\/)(__tests__|tests?|spec)\//i.test(file);
  const hasTestFileName = /\.(test|spec)\.[cm]?[jt]sx?$/i.test(file);
  return isInTestDirectory || hasTestFileName;
}
