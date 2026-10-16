import { commandArgumentsSchema } from "./schemas/arguments/command-arguments.schema.ts";
import { auditProject } from "./services/audit/audit-project.service.ts";
import { readBoundaries } from "./services/boundaries/read-boundaries.service.ts";
import { formatFinding } from "./services/report/format-finding.service.ts";
import type { BoundariesLookup } from "./types/boundaries/rule-audit-boundaries.interface.ts";

const USAGE = "Usage: rule-audit <typescript-project-directory> [<rule-file-with-exceptions>]";
const EXIT_FINDINGS = 1;
const EXIT_USAGE = 2;
const WITHOUT_EXCEPTIONS: BoundariesLookup = { state: "valid", boundaries: { boundaries: [] } };

const parsedArguments = commandArgumentsSchema.safeParse(process.argv.slice(2));
if (!parsedArguments.success) {
  console.error(USAGE);
  process.exit(EXIT_USAGE);
}

const commandArguments = parsedArguments.data;
const [projectDirectory] = commandArguments;
const boundaries = commandArguments.length === 1 ? WITHOUT_EXCEPTIONS : readBoundaries(commandArguments[1]);
if (boundaries.state === "invalid") {
  console.error(boundaries.problem);
  process.exit(EXIT_USAGE);
}

const findings = auditProject(projectDirectory, boundaries.boundaries);
for (const finding of findings) {
  console.log(formatFinding(projectDirectory, finding));
}
console.log(`rule-audit: ${findings.length} finding(s) in ${projectDirectory}`);
process.exit(findings.length > 0 ? EXIT_FINDINGS : 0);
