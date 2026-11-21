export type LogEventProperty = {
  name: string;
  value: string;
};

export type ParsedLogEvent = {
  properties: LogEventProperty[];
  applicationName?: string;
  sourceContext?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value);

// LogEvent is the Serilog JSON of the event. It is written by the STS and may
// be missing or come from an older sink, so anything unexpected gives no
// properties instead of an error.
export const parseLogEvent = (logEvent?: string): ParsedLogEvent => {
  if (!logEvent) {
    return { properties: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(logEvent);
  } catch {
    return { properties: [] };
  }

  const properties =
    isRecord(parsed) && isRecord(parsed.Properties) ? parsed.Properties : {};
  const text = (name: string) =>
    typeof properties[name] === "string" ? properties[name] : undefined;

  return {
    properties: Object.entries(properties)
      .map(([name, value]) => ({ name, value: toText(value) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    applicationName: text("ApplicationName"),
    sourceContext: text("SourceContext"),
  };
};
