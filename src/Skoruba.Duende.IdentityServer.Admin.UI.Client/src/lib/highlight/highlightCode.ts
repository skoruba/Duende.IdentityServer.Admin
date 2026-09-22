/**
 * Minimal syntax highlighter for the code snippets rendered by CodeBlock.
 *
 * A full grammar engine (shiki, prism) would be several hundred kilobytes for
 * the handful of snippets we generate ourselves - and because we generate them,
 * we know exactly which constructs can appear. The tokenizer below covers those
 * and degrades to plain text for anything it does not recognize.
 */

export type SnippetLanguage = "csharp" | "bash" | "json";

export type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "type"
  | "number"
  | "property"
  | "punctuation"
  | "plain";

export type Token = {
  text: string;
  type: TokenType;
};

type Rule = {
  type: Exclude<TokenType, "plain">;
  pattern: string;
};

const CSHARP_KEYWORDS = [
  "using",
  "namespace",
  "public",
  "private",
  "protected",
  "internal",
  "sealed",
  "static",
  "async",
  "await",
  "class",
  "record",
  "struct",
  "interface",
  "override",
  "virtual",
  "readonly",
  "var",
  "new",
  "return",
  "if",
  "else",
  "while",
  "for",
  "foreach",
  "in",
  "this",
  "base",
  "null",
  "true",
  "false",
  "void",
  "string",
  "int",
  "bool",
  "double",
  "decimal",
  "long",
  "object",
];

const BASH_KEYWORDS = [
  "dotnet",
  "add",
  "package",
  "new",
  "run",
  "user-secrets",
  "set",
  "init",
  "export",
  "cd",
];

const JSON_KEYWORDS = ["true", "false", "null"];

const RULES: Record<SnippetLanguage, Rule[]> = {
  csharp: [
    { type: "comment", pattern: "//[^\\n]*" },
    // Covers plain, verbatim (@"..."), interpolated ($"...") and raw-ish literals.
    { type: "string", pattern: '[$@]{0,2}"(?:[^"\\\\\\n]|\\\\.)*"' },
    { type: "keyword", pattern: `\\b(?:${CSHARP_KEYWORDS.join("|")})\\b` },
    // PascalCase identifiers are types or members in the code we emit.
    { type: "type", pattern: "\\b[A-Z][A-Za-z0-9_]*\\b" },
    { type: "number", pattern: "\\b\\d+(?:\\.\\d+)?\\b" },
    { type: "punctuation", pattern: "[{}()\\[\\];,.<>=+\\-*/!?:&|]" },
  ],
  bash: [
    { type: "comment", pattern: "#[^\\n]*" },
    { type: "string", pattern: '"(?:[^"\\\\\\n]|\\\\.)*"|\'[^\'\\n]*\'' },
    { type: "keyword", pattern: `\\b(?:${BASH_KEYWORDS.join("|")})\\b` },
    { type: "property", pattern: "--?[A-Za-z][\\w-]*" },
    { type: "punctuation", pattern: "[|&><]" },
  ],
  json: [
    // A quoted string followed by a colon is an object key.
    { type: "property", pattern: '"(?:[^"\\\\]|\\\\.)*"(?=\\s*:)' },
    { type: "string", pattern: '"(?:[^"\\\\]|\\\\.)*"' },
    { type: "keyword", pattern: `\\b(?:${JSON_KEYWORDS.join("|")})\\b` },
    { type: "number", pattern: "-?\\b\\d+(?:\\.\\d+)?\\b" },
    { type: "punctuation", pattern: "[{}\\[\\]:,]" },
  ],
};

/**
 * One alternation per language, built once. Each rule gets its own capture
 * group so the matching rule can be recovered from the match result.
 */
const PATTERNS: Record<SnippetLanguage, RegExp> = {
  csharp: buildPattern("csharp"),
  bash: buildPattern("bash"),
  json: buildPattern("json"),
};

function buildPattern(language: SnippetLanguage): RegExp {
  const source = RULES[language].map((rule) => `(${rule.pattern})`).join("|");

  return new RegExp(source, "g");
}

export const TOKEN_CLASS_NAMES: Record<TokenType, string> = {
  comment: "text-muted-foreground italic",
  string: "text-emerald-600 dark:text-emerald-400",
  keyword: "text-violet-600 dark:text-violet-400",
  type: "text-sky-600 dark:text-sky-400",
  number: "text-orange-600 dark:text-orange-400",
  property: "text-sky-700 dark:text-sky-300",
  punctuation: "text-muted-foreground",
  plain: "",
};

/**
 * Splits code into tokens. Everything the rules do not match is returned as a
 * `plain` token, so concatenating `token.text` always reproduces the input.
 */
export const tokenizeCode = (
  code: string,
  language: SnippetLanguage,
): Token[] => {
  const pattern = PATTERNS[language];
  const rules = RULES[language];
  const tokens: Token[] = [];

  pattern.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(code)) !== null) {
    // A rule that can match an empty string would loop forever otherwise.
    if (match[0] === "") {
      pattern.lastIndex += 1;
      continue;
    }

    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), type: "plain" });
    }

    // Group i + 1 belongs to rule i - only one of them can be defined.
    const ruleIndex = match.findIndex(
      (group, index) => index > 0 && group !== undefined,
    );

    tokens.push({
      text: match[0],
      type: ruleIndex > 0 ? rules[ruleIndex - 1].type : "plain",
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), type: "plain" });
  }

  return tokens;
};
