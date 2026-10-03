import { describe, expect, it } from "vitest";
import {
  FALLBACK_AUTHORITY,
  LEGACY_API_BASE_URL,
  PLACEHOLDER_API_BASE_URL,
  isPlaceholderApiBaseUrl,
  readStoredOption,
  resolveDefaultAuthority,
} from "./snippetOptions";

describe("resolveDefaultAuthority", () => {
  it("uses the IdentityServer address the Admin UI is configured with", () => {
    expect(resolveDefaultAuthority("https://sts.example.test")).toBe(
      "https://sts.example.test",
    );
  });

  it("drops a trailing slash so the address matches the generated code", () => {
    expect(resolveDefaultAuthority("https://sts.example.test/")).toBe(
      "https://sts.example.test",
    );
  });

  it("falls back to the local template port when the backend reports no address", () => {
    expect(resolveDefaultAuthority(undefined)).toBe(FALLBACK_AUTHORITY);
    expect(resolveDefaultAuthority(null)).toBe(FALLBACK_AUTHORITY);
    expect(resolveDefaultAuthority("")).toBe(FALLBACK_AUTHORITY);
    expect(resolveDefaultAuthority("   ")).toBe(FALLBACK_AUTHORITY);
  });
});

describe("readStoredOption", () => {
  it("is empty when nothing was stored", () => {
    expect(readStoredOption(null, FALLBACK_AUTHORITY)).toBe("");
  });

  it("keeps an address the user typed", () => {
    expect(readStoredOption("https://sts.example.test", FALLBACK_AUTHORITY)).toBe(
      "https://sts.example.test",
    );
  });

  it("ignores the localhost default that 3.1.0 stored on its own", () => {
    expect(readStoredOption(FALLBACK_AUTHORITY, FALLBACK_AUTHORITY)).toBe("");
    expect(readStoredOption(LEGACY_API_BASE_URL, LEGACY_API_BASE_URL)).toBe("");
  });
});

describe("isPlaceholderApiBaseUrl", () => {
  it("recognises the placeholder however it was typed", () => {
    expect(isPlaceholderApiBaseUrl(PLACEHOLDER_API_BASE_URL)).toBe(true);
    expect(isPlaceholderApiBaseUrl(` ${PLACEHOLDER_API_BASE_URL}/ `)).toBe(true);
  });

  it("treats any other address as a real API", () => {
    expect(isPlaceholderApiBaseUrl("https://api.example.test")).toBe(false);
    expect(isPlaceholderApiBaseUrl(LEGACY_API_BASE_URL)).toBe(false);
  });
});
