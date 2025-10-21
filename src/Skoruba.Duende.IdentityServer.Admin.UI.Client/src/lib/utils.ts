import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBaseHref = (): string => {
  if (typeof document === "undefined") return "/";

  const base = document.querySelector('base[id="dynamic-base"]');
  let href = base?.getAttribute("href") ?? "/";

  if (!href.endsWith("/")) {
    href += "/";
  }

  return href;
};
