export const DECLARATION_KEYWORDS = "function|class|interface|type|enum|const|let|var|def|func|fn|struct|trait|impl";

export const DECLARATION_MODIFIERS = "(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?";

export const METHOD_MODIFIERS = "(?:public|private|protected|static|async|get|set|readonly|override|\\s)*";

export const SYMBOL_DECLARATION_PATTERN = new RegExp(
  `^\\s*${DECLARATION_MODIFIERS}(?:${DECLARATION_KEYWORDS})\\s+([A-Za-z_$][A-Za-z0-9_$]*)`,
);

export const METHOD_DECLARATION_PATTERN = new RegExp(`^\\s*${METHOD_MODIFIERS}([A-Za-z_$][A-Za-z0-9_$]*)\\s*\\(`);

export const INDENTED_LINE_PATTERN = /^\s{2,}/;
