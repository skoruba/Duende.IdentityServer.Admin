import { toast } from "@/components/ui/use-toast";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import {
  QueryClient,
  DefaultOptions,
  MutationCache,
  QueryCache,
} from "react-query";

const ERROR_MESSAGES = {
  UNEXPECTED: "Unexpected error 🥶",
  INVALID_FORMAT: "Invalid error format",
  UNKNOWN: "Unknown error",
  DEFAULT_TITLE: "Ooops! 🙈",
};

type ProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
};

type HasStatus = { status?: number };
type SwaggerErrorShape = { response: string; status: number };

const isProblemDetails = (val: unknown): val is ProblemDetails =>
  typeof val === "object" && val !== null;

const isBadRequest = (val: unknown): val is HasStatus =>
  typeof val === "object" && val !== null && "status" in val;

const isSwaggerErrorShape = (val: unknown): val is SwaggerErrorShape =>
  typeof val === "object" &&
  val !== null &&
  "response" in val &&
  typeof (val as any).response === "string" &&
  "status" in val &&
  typeof (val as any).status === "number";

const tryParseJson = <T = unknown>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const flattenErrors = (errors: ProblemDetails["errors"]): string => {
  if (!errors) return "";
  const values = Object.values(errors).flatMap((v) =>
    Array.isArray(v) ? v : [v]
  );
  return values.join(", ");
};

export const extractValidationMessageFromProblemDetails = (
  error: unknown
): string => {
  if (!isProblemDetails(error)) return ERROR_MESSAGES.UNEXPECTED;
  if (error.errors && typeof error.errors === "object") {
    const msg = flattenErrors(error.errors);
    if (msg) return msg;
  }
  return error.title || error.detail || ERROR_MESSAGES.UNEXPECTED;
};

export const extractValidationMessageFromSwaggerError = (
  error: unknown
): string => {
  if (error instanceof client.SwaggerException || isSwaggerErrorShape(error)) {
    const payload = "response" in (error as any) ? (error as any).response : "";
    const parsed =
      typeof payload === "string"
        ? tryParseJson<ProblemDetails>(payload)
        : null;

    if (!parsed) return ERROR_MESSAGES.INVALID_FORMAT;
    if (parsed.errors) {
      const msg = flattenErrors(parsed.errors);
      if (msg) return msg;
    }
    return parsed.title || parsed.detail || ERROR_MESSAGES.UNEXPECTED;
  }
  return ERROR_MESSAGES.UNKNOWN;
};

const getBadRequestMessage = (error: unknown): string => {
  if (error instanceof client.SwaggerException && error.status === 400) {
    return extractValidationMessageFromSwaggerError(error);
  }

  if (isBadRequest(error) && error.status === 400) {
    return extractValidationMessageFromProblemDetails(error);
  }

  return ERROR_MESSAGES.UNEXPECTED;
};

function handleGlobalError(
  error: unknown,
  title: string = ERROR_MESSAGES.DEFAULT_TITLE
) {
  const description = getBadRequestMessage(error);
  toast({
    variant: "destructive",
    title,
    description,
  });
}

const DEFAULT_CACHE_TIME_MS = 5 * 60 * 1000; // 5 min
const DEFAULT_STALE_TIME_MS = 2 * 60 * 1000; // 2 min
const DEFAULT_RETRY_COUNT = 3;

const defaultOptions: DefaultOptions = {
  queries: {
    retry: DEFAULT_RETRY_COUNT,
    cacheTime: DEFAULT_CACHE_TIME_MS,
    staleTime: DEFAULT_STALE_TIME_MS,
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
  queryCache: new QueryCache({
    onError: (error) => handleGlobalError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleGlobalError(error),
  }),
});
