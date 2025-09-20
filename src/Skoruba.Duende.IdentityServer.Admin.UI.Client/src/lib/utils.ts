import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBaseHref = () => {
  if (typeof document !== "undefined") {
    const base = document.querySelector('base[id="dynamic-base"]');
    return base?.getAttribute("href") ?? "/";
  }

  return "/";
};
