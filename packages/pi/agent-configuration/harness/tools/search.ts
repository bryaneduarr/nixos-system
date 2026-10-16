import type { SearchMatch } from "../types/tools/search/search-match.interface.ts";
import type { SearchRequest } from "../types/tools/search/search-request.interface.ts";
import { fdMatches, gitHistory, rgMatches, structuralMatches } from "./search/matches.ts";
import { formatSearchResult } from "./search/result.ts";

const DEFINITION_KEYWORDS = [
  "function",
  "class",
  "interface",
  "type",
  "enum",
  "const",
  "let",
  "var",
  "def",
  "func",
  "fn",
  "struct",
  "trait",
  "impl",
  "record",
];

export function isBareIdentifier(query: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$.-]*$/.test(query.trim());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isTestFile(file: string): boolean {
  return /(^|\/)(__tests__|tests?|spec)\//i.test(file) || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(file);
}

function isDefinitionLine(line: string, query: string): boolean {
  if (!isBareIdentifier(query)) return false;
  const name = escapeRegExp(query.trim());
  const keyword = DEFINITION_KEYWORDS.join("|");
  const patterns = [
    new RegExp(`\\b(?:${keyword})\\s+${name}\\b`),
    new RegExp(`\\b${name}\\s*[:=]\\s*(?:async\\s*)?(?:function\\b|\\()`),
    new RegExp(`\\b${name}\\s*\\([^)]*\\)\\s*[:{]`),
  ];
  return patterns.some((pattern) => pattern.test(line));
}

function uniqueByLocation(matches: SearchMatch[]): SearchMatch[] {
  const seen = new Set<string>();
  const result: SearchMatch[] = [];
  for (const match of matches) {
    const key = `${match.file}:${match.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(match);
  }
  return result;
}

export async function searchRepo(request: SearchRequest): Promise<string> {
  const { cwd, scope, cancellation } = request;
  const query = request.query.trim();
  const kind = request.kind;
  const limit = request.limit;

  if (!query) return "No query provided.";
  if (limit <= 0) return "Limit must be greater than zero.";

  if (kind === "history") {
    return gitHistory(cwd, query, scope, limit, cancellation);
  }

  let matches: SearchMatch[] = [];
  if (kind === "structural") {
    matches = await structuralMatches(cwd, query, scope, cancellation);
    if (matches.length === 0) {
      matches = await rgMatches(cwd, query, scope, cancellation);
      if (matches.length > 0) {
        return formatSearchResult(
          query,
          "structural (no AST matches; text fallback)",
          [],
          [],
          uniqueByLocation(matches),
          limit,
        );
      }
      return `No structural matches for: ${query}`;
    }
  } else if (kind === "file") {
    const files = await fdMatches(cwd, query, scope, cancellation);
    const filtered = files.slice(0, limit);
    if (filtered.length === 0) return `No files matching: ${query}`;
    const omitted = Math.max(0, files.length - limit);
    const omittedNote = omitted > 0 ? `\n\nAdditional files omitted: ${omitted}` : "";
    return `Files:\n${filtered.join("\n")}${omittedNote}`;
  } else {
    matches = await rgMatches(cwd, query, scope, cancellation);
  }

  const files = kind === "text" || kind === "symbol" ? [] : await fdMatches(cwd, query, scope, cancellation);

  matches = uniqueByLocation(matches);

  if (kind === "symbol") {
    const definitions = matches.filter((match) => isDefinitionLine(match.text, query));
    const fallback = definitions.length > 0 ? definitions : matches;
    return formatSearchResult(
      query,
      definitions.length > 0 ? "symbol" : "symbol (no declaration found; showing text matches)",
      [],
      [],
      fallback,
      limit,
    );
  }

  const definitions = matches.filter((match) => isDefinitionLine(match.text, query));
  const tests = matches.filter((match) => isTestFile(match.file));
  const references = matches.filter((match) => !isDefinitionLine(match.text, query) && !isTestFile(match.file));

  return formatSearchResult(query, kind, files, tests, references, limit, definitions);
}
