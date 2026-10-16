export const DECLARATION_KEYWORDS = "function|class|interface|type|enum|const|let|var|def|func|fn|struct|trait|impl";

export const SYMBOL_DECLARATION_PATTERN = new RegExp(
  `^\\s*(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:${DECLARATION_KEYWORDS})\\s+([A-Za-z_$][A-Za-z0-9_$]*)`,
);

export const METHOD_DECLARATION_PATTERN =
  /^\s*(?:public|private|protected|static|async|get|set|readonly|override|\s)*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/;

export const INDENTED_LINE_PATTERN = /^\s{2,}/;
