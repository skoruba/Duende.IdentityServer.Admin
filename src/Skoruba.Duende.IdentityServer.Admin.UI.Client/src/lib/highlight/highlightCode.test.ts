import { describe, expect, it } from "vitest";
import { SnippetLanguage, tokenizeCode } from "./highlightCode";

const samples: Record<SnippetLanguage, string> = {
  csharp: [
    "// a comment",
    'var name = "value";',
    "public class Worker : BackgroundService",
    "{",
    "    private const int Retries = 3;",
    "}",
  ].join("\n"),
  bash: [
    "# .NET 10 project",
    "dotnet add package Duende.AccessTokenManagement",
    'dotnet user-secrets set "Oidc:ClientSecret" "<value>"',
  ].join("\n"),
  json: '{\n  "Oidc": {\n    "Authority": "https://localhost:44310",\n    "Enabled": true\n  }\n}',
};

describe("tokenizeCode", () => {
  it.each(Object.keys(samples) as SnippetLanguage[])(
    "reproduces the %s input exactly when the tokens are joined",
    (language) => {
      const tokens = tokenizeCode(samples[language], language);

      expect(tokens.map((token) => token.text).join("")).toBe(samples[language]);
    },
  );

  it("never emits an empty token", () => {
    for (const language of Object.keys(samples) as SnippetLanguage[]) {
      const tokens = tokenizeCode(samples[language], language);

      expect(tokens.every((token) => token.text.length > 0)).toBe(true);
    }
  });

  const typeOf = (code: string, language: SnippetLanguage, text: string) =>
    tokenizeCode(code, language).find((token) => token.text === text)?.type;

  it("classifies C# comments, strings and keywords", () => {
    const code = samples.csharp;

    expect(typeOf(code, "csharp", "// a comment")).toBe("comment");
    expect(typeOf(code, "csharp", '"value"')).toBe("string");
    expect(typeOf(code, "csharp", "public")).toBe("keyword");
    expect(typeOf(code, "csharp", "BackgroundService")).toBe("type");
    expect(typeOf(code, "csharp", "3")).toBe("number");
  });

  it("treats a whole shell comment line as a comment", () => {
    expect(typeOf(samples.bash, "bash", "# .NET 10 project")).toBe("comment");
    expect(typeOf(samples.bash, "bash", "dotnet")).toBe("keyword");
  });

  it("tells JSON keys apart from JSON string values", () => {
    expect(typeOf(samples.json, "json", '"Authority"')).toBe("property");
    expect(typeOf(samples.json, "json", '"https://localhost:44310"')).toBe(
      "string",
    );
    expect(typeOf(samples.json, "json", "true")).toBe("keyword");
  });

  it("returns nothing for empty input", () => {
    expect(tokenizeCode("", "csharp")).toEqual([]);
  });
});
