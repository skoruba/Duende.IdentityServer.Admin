import { toast } from "@/components/ui/use-toast";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      cacheTime: 5 * 60 * 1000,
      staleTime: 2 * 60 * 1000,
      onError: (error) => {
        handleGlobalError(error, "Ooops! 🙈");
      },
    },
    mutations: {
      onError: (error) => {
        handleGlobalError(error, "Ooops! 🙈");
      },
    },
  },
});

export function extractValidationMessageFromProblemDetails(error: any): string {
  if (error?.errors && typeof error.errors === "object") {
    return Object.values(error.errors).flat().join(", ");
  }

  return error?.title || "Ooops! 🙈";
}

export const extractValidationMessageFromSwaggerError = (
  error: unknown
): string => {
  if (
    typeof error !== "object" ||
    error === null ||
    !("response" in error) ||
    typeof (error as any).response !== "string"
  ) {
    return "Unknown error";
  }

  try {
    const parsed = JSON.parse((error as any).response);

    if (!parsed.errors) {
      return parsed.title || parsed.detail || "Unexpected error";
    }

    const messages = Object.values(parsed.errors).flat();
    return messages.join(", ");
  } catch (e) {
    return "Invalid error format";
  }
};

function handleGlobalError(error: unknown, defaultTitle: string) {
  let message = "Unexpected error 🥶";

  if (error instanceof client.SwaggerException && error.status === 400) {
    message = extractValidationMessageFromSwaggerError(error);
  } else if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as any).status === 400
  ) {
    message = extractValidationMessageFromProblemDetails(error);
  }

  toast({
    variant: "destructive",
    title: defaultTitle,
    description: message,
  });
}
