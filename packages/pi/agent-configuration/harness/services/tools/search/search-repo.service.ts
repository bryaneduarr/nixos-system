import type { SearchMatch } from "../../../types/tools/search/search-match.interface.ts";
import type { SearchRequest } from "../../../types/tools/search/search-request.interface.ts";
import { fdMatches } from "./fd-matches.service.ts";
import { formatSearchResult } from "./format-search-result.service.ts";
import { gitHistory } from "./git-history.service.ts";
import { isDefinitionLine } from "./is-definition-line.service.ts";
import { rgMatches } from "./rg-matches.service.ts";
import { structuralMatches } from "./structural-matches.service.ts";

function uniqueByLocation(matches: readonly SearchMatch[]): SearchMatch[] {
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

function isTestFile(file: string): boolean {
  const isInTestDirectory = /(^|\/)(__tests__|tests?|spec)\//i.test(file);
  const hasTestFileName = /\.(test|spec)\.[cm]?[jt]sx?$/i.test(file);
  return isInTestDirectory || hasTestFileName;
}

function formatMixedResult(
  query: string,
  kind: string,
  files: string[],
  matches: SearchMatch[],
  limit: number,
): string {
  const definitions = matches.filter((match) => isDefinitionLine(match.text, query));
  const tests = matches.filter((match) => isTestFile(match.file));
  const references = matches.filter((match) => !isDefinitionLine(match.text, query) && !isTestFile(match.file));
  return formatSearchResult(query, kind, files, tests, references, limit, definitions);
}

async function searchText(request: SearchRequest, query: string): Promise<string> {
  const { cwd, scope, cancellation, kind, limit } = request;
  const matches = uniqueByLocation(await rgMatches(cwd, query, scope, cancellation));
  const files = kind === "text" ? [] : await fdMatches(cwd, query, scope, cancellation);
  return formatMixedResult(query, kind, files, matches, limit);
}

async function searchStructural(request: SearchRequest, query: string): Promise<string> {
  const { cwd, scope, cancellation, limit } = request;
  const structural = await structuralMatches(cwd, query, scope, cancellation);
  if (structural.length === 0) {
    const textMatches = await rgMatches(cwd, query, scope, cancellation);
    if (textMatches.length === 0) return `No structural matches for: ${query}`;
    return formatSearchResult(
      query,
      "structural (no AST matches; text fallback)",
      [],
      [],
      uniqueByLocation(textMatches),
      limit,
    );
  }
  const files = await fdMatches(cwd, query, scope, cancellation);
  return formatMixedResult(query, "structural", files, uniqueByLocation(structural), limit);
}

async function searchFiles(request: SearchRequest, query: string): Promise<string> {
  const { cwd, scope, cancellation, limit } = request;
  const files = await fdMatches(cwd, query, scope, cancellation);
  const shown = files.slice(0, limit);
  if (shown.length === 0) return `No files matching: ${query}`;
  const omitted = Math.max(0, files.length - limit);
  const omittedNote = omitted > 0 ? `\n\nAdditional files omitted: ${omitted}` : "";
  return `Files:\n${shown.join("\n")}${omittedNote}`;
}

async function searchSymbols(request: SearchRequest, query: string): Promise<string> {
  const { cwd, scope, cancellation, limit } = request;
  const matches = uniqueByLocation(await rgMatches(cwd, query, scope, cancellation));
  const definitions = matches.filter((match) => isDefinitionLine(match.text, query));
  const hasDefinitions = definitions.length > 0;
  return formatSearchResult(
    query,
    hasDefinitions ? "symbol" : "symbol (no declaration found; showing text matches)",
    [],
    [],
    hasDefinitions ? definitions : matches,
    limit,
  );
}

export async function searchRepo(request: SearchRequest): Promise<string> {
  const { cwd, scope, cancellation, limit } = request;
  const query = request.query.trim();

  if (!query) return "No query provided.";
  if (limit <= 0) return "Limit must be greater than zero.";

  if (request.kind === "history") return gitHistory(cwd, query, scope, limit, cancellation);
  if (request.kind === "structural") return searchStructural(request, query);
  if (request.kind === "file") return searchFiles(request, query);
  if (request.kind === "symbol") return searchSymbols(request, query);
  return searchText(request, query);
}
