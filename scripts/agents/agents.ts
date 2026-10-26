import { setTimeout as delay } from "node:timers/promises";
import { readUsageSnapshot } from "./services/runtime/read-usage-snapshot.service.ts";
import { runAgents } from "./services/runtime/run-agents.service.ts";

const exitCode = await runAgents({
  argv: process.argv.slice(2),
  environment: process.env,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
  signals: process,
  wait: delay,
  readUsageSnapshot,
});
process.exit(exitCode);
