export function formatTaskErrorResult(id: string, title: string, message: string): string {
  const content = {
    id,
    title,
    status: "error",
    summary: "",
    findings: [],
    files_changed: [],
    errors: [message],
  };

  return JSON.stringify(content);
}
