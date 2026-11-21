import { describe, expect, it } from "vitest";
import {
  DEFAULT_UI_CONFIGURATION,
  parseUiConfiguration,
} from "./parseUiConfiguration";

describe("parseUiConfiguration", () => {
  it("switches identity management off on an explicit false only", () => {
    expect(parseUiConfiguration({ identityManagementEnabled: false })).toEqual({
      ...DEFAULT_UI_CONFIGURATION,
      identityManagementEnabled: false,
    });
    expect(parseUiConfiguration({ identityManagementEnabled: true })).toEqual(
      DEFAULT_UI_CONFIGURATION,
    );
  });

  it("switches the error logs off on an explicit false only", () => {
    expect(parseUiConfiguration({ errorLogsEnabled: false })).toEqual({
      ...DEFAULT_UI_CONFIGURATION,
      errorLogsEnabled: false,
    });
    expect(parseUiConfiguration({ errorLogsEnabled: "false" })).toEqual(
      DEFAULT_UI_CONFIGURATION,
    );
  });

  it("keeps the defaults for a host that does not know the flag", () => {
    expect(parseUiConfiguration({})).toEqual(DEFAULT_UI_CONFIGURATION);
    expect(parseUiConfiguration(null)).toEqual(DEFAULT_UI_CONFIGURATION);
    expect(parseUiConfiguration(undefined)).toEqual(DEFAULT_UI_CONFIGURATION);
    expect(parseUiConfiguration("nonsense")).toEqual(DEFAULT_UI_CONFIGURATION);
  });

  it("ignores a flag that is not a boolean", () => {
    expect(parseUiConfiguration({ identityManagementEnabled: "false" })).toEqual(
      DEFAULT_UI_CONFIGURATION,
    );
    expect(parseUiConfiguration({ identityManagementEnabled: 0 })).toEqual(
      DEFAULT_UI_CONFIGURATION,
    );
  });
});
