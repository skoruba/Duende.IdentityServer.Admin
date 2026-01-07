import { toast } from "@/components/ui/use-toast";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import {
  QueryClient,
  DefaultOptions,
  MutationCache,
  QueryCache,
} from "react-query";
import { isProblemDetails, isSwaggerError } from "@/lib/type-guards";
import i18next from "@/i18n/config";

const ERROR_MESSAGES = {
  UNEXPECTED: () => String(i18next.t("Errors.Unexpected")),
  INVALID_FORMAT: () => String(i18next.t("Errors.InvalidFormat")),
  UNKNOWN: () => String(i18next.t("Errors.Unknown")),
  DEFAULT_TITLE: () => String(i18next.t("Errors.DefaultTitle")),
  UNAUTHORIZED: () => String(i18next.t("Errors.Unauthorized")),
  FORBIDDEN: () => String(i18next.t("Errors.Forbidden")),
  NOT_FOUND: () => String(i18next.t("Errors.NotFound")),
  SERVER_ERROR: () => String(i18next.t("Errors.ServerError")),
  NETWORK_ERROR: () => String(i18next.t("Errors.NetworkError")),
  TIMEOUT_ERROR: () => String(i18next.t("Errors.TimeoutError")),
};

type ProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
};

type HasStatus = { status?: number };
type SwaggerErrorShape = { response: string; status: number };

const isBadRequest = (val: unknown): val is HasStatus =>
  typeof val === "object" && val !== null && "status" in val;

const isSwaggerErrorShape = (val: unknown): val is SwaggerErrorShape =>
  isSwaggerError(val) &&
  "response" in val &&
  typeof val.response === "string" &&
  "status" in val &&
  typeof val.status === "number";

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

const getStatusCode = (error: unknown): number | undefined => {
  if (error instanceof client.SwaggerException) return error.status;
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as HasStatus).status;
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
};

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

const isNetworkError = (error: unknown): boolean =>
  error instanceof TypeError &&
  typeof error.message === "string" &&
  (error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError") ||
    error.message.includes("Load failed"));

export const extractValidationMessageFromProblemDetails = (
  error: unknown
): string => {
  if (!isProblemDetails(error)) return ERROR_MESSAGES.UNEXPECTED();
  if (error.errors && typeof error.errors === "object") {
    const msg = flattenErrors(error.errors);
    if (msg) return msg;
  }
  return error.title || error.detail || ERROR_MESSAGES.UNEXPECTED();
};

export const extractValidationMessageFromSwaggerError = (
  error: unknown
): string => {
  if (error instanceof client.SwaggerException || isSwaggerErrorShape(error)) {
    const payload =
      isSwaggerError(error) && "response" in error ? error.response : "";
    const parsed =
      typeof payload === "string"
        ? tryParseJson<ProblemDetails>(payload)
        : null;

    if (!parsed) return ERROR_MESSAGES.INVALID_FORMAT();
    if (parsed.errors) {
      const msg = flattenErrors(parsed.errors);
      if (msg) return msg;
    }
    return parsed.title || parsed.detail || ERROR_MESSAGES.UNEXPECTED();
  }
  return ERROR_MESSAGES.UNKNOWN();
};

const getErrorMessage = (error: unknown): string => {
  if (isAbortError(error)) return ERROR_MESSAGES.TIMEOUT_ERROR();
  if (isNetworkError(error)) return ERROR_MESSAGES.NETWORK_ERROR();

  const status = getStatusCode(error);
  if (status === 400) {
    if (error instanceof client.SwaggerException) {
      return extractValidationMessageFromSwaggerError(error);
    }

    if (isBadRequest(error)) {
      return extractValidationMessageFromProblemDetails(error);
    }

    return ERROR_MESSAGES.UNEXPECTED();
  }

  if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED();
  if (status === 403) return ERROR_MESSAGES.FORBIDDEN();
  if (status === 404) return ERROR_MESSAGES.NOT_FOUND();
  if (typeof status === "number" && status >= 500)
    return ERROR_MESSAGES.SERVER_ERROR();

  if (error instanceof client.SwaggerException) {
    return extractValidationMessageFromSwaggerError(error);
  }

  return ERROR_MESSAGES.UNEXPECTED();
};

function handleGlobalError(
  error: unknown,
  title: string = ERROR_MESSAGES.DEFAULT_TITLE()
) {
  const description = getErrorMessage(error);
  toast({
    variant: "destructive",
    title,
    description,
  });
}

const DEFAULT_CACHE_TIME_MS = 5 * 60 * 1000;
const DEFAULT_STALE_TIME_MS = 2 * 60 * 1000;
const DEFAULT_RETRY_COUNT = 3;

const defaultOptions: DefaultOptions = {
  queries: {
    retry: (failureCount, error) => {
      const status = getStatusCode(error);
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        return false;
      }
      return failureCount < DEFAULT_RETRY_COUNT;
    },
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
