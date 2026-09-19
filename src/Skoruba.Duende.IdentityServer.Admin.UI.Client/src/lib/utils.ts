import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeBasePath = (href?: string | null): string => {
  if (!href || href.trim() === "" || href === "/") return "/";

  let normalized = href.trim();

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (!normalized.endsWith("/")) {
    normalized = `${normalized}/`;
  }

  normalized = normalized.replace(/\/{2,}/g, "/");

  return normalized;
};

/**
 * Downloads a string as a file. The link has to be in the document and the
 * object URL must stay alive until the download starts.
 */
export const downloadTextFile = (
  value: string,
  fileName: string,
  mimeType = "text/plain",
) => {
  const url = URL.createObjectURL(new Blob([value], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking right away can cancel the download in Safari, which reads the blob after the click returns
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const getBaseHref = (): string => {
  if (typeof document === "undefined") return "/";

  const base = document.querySelector('base[id="dynamic-base"]');
  const href = base?.getAttribute("href") ?? "/";

  return normalizeBasePath(href);
};
