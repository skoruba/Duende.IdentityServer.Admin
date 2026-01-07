(function () {
  const storageKey = "vite-ui-theme";
  const theme = localStorage.getItem(storageKey) || "light";

  const root = document.documentElement;
  root.classList.remove("light", "dark");

  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  root.classList.add(resolvedTheme);
})();
