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

export const getBaseHref = (): string => {
  if (typeof document === "undefined") return "/";

  const base = document.querySelector('base[id="dynamic-base"]');
  const href = base?.getAttribute("href") ?? "/";

  return normalizeBasePath(href);
};
