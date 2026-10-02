const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const lockfile = process.argv[2];

if (!lockfile) {
  throw new Error("A Pi package-lock.json path is required");
}

const lock = JSON.parse(fs.readFileSync(lockfile, "utf8"));
const missingDependencies = Object.entries(lock.packages ?? {}).filter(
  ([packagePath, dependency]) => {
    if (!packagePath || dependency.integrity || !dependency.resolved) {
      return false;
    }

    return !dependency.resolved.startsWith("git+") && !dependency.resolved.startsWith("git:");
  },
);

if (missingDependencies.length === 0) {
  process.exit(0);
}

function npmPackageName(resolved) {
  const pathSegments = new URL(resolved).pathname.split("/").filter(Boolean);
  const firstSegment = decodeURIComponent(pathSegments[0] ?? "");

  if (firstSegment.startsWith("@")) {
    const packageName = decodeURIComponent(pathSegments[1] ?? "");
    return `${firstSegment}/${packageName}`;
  }

  return firstSegment;
}

function packageSpec(dependency) {
  if (!dependency.version) {
    throw new Error(`Missing version for dependency resolved from ${dependency.resolved}`);
  }

  return `${npmPackageName(dependency.resolved)}@${dependency.version}`;
}

const integrityByPackage = new Map();

for (const [, dependency] of missingDependencies) {
  const spec = packageSpec(dependency);

  if (integrityByPackage.has(spec)) {
    continue;
  }

  const output = execFileSync(
    "npm",
    ["--prefix", path.dirname(lockfile), "view", "--json", spec, "dist.integrity"],
    { encoding: "utf8" },
  );
  const integrity = JSON.parse(output);

  if (typeof integrity !== "string" || !/^sha(?:1|256|384|512)-/.test(integrity)) {
    throw new Error(`No valid registry integrity found for ${spec}`);
  }

  integrityByPackage.set(spec, integrity);
}

for (const [, dependency] of missingDependencies) {
  dependency.integrity = integrityByPackage.get(packageSpec(dependency));
}

fs.writeFileSync(lockfile, `${JSON.stringify(lock, null, 2)}\n`);
