(function () {
  var storageKey = "vite-ui-theme";

  function getStoredTheme() {
    return localStorage.getItem(storageKey) || "light";
  }

  function resolveTheme(theme) {
    if (theme !== "system") return theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    var resolved = resolveTheme(theme);
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    updateIcons(resolved);
  }

  function updateIcons(resolvedTheme) {
    var darkIcon = document.getElementById("theme-toggle-dark-icon");
    var lightIcon = document.getElementById("theme-toggle-light-icon");
    var darkIconMobile = document.getElementById("theme-toggle-dark-icon-mobile");
    var lightIconMobile = document.getElementById(
      "theme-toggle-light-icon-mobile"
    );

    var isDark = resolvedTheme === "dark";

    if (darkIcon) darkIcon.classList.toggle("hidden", isDark);
    if (lightIcon) lightIcon.classList.toggle("hidden", !isDark);
    if (darkIconMobile) darkIconMobile.classList.toggle("hidden", isDark);
    if (lightIconMobile) lightIconMobile.classList.toggle("hidden", !isDark);
  }

  // Initialize icons based on current theme (set by theme-init.js)
  updateIcons(document.documentElement.classList.contains("dark") ? "dark" : "light");

  function toggle() {
    var current = getStoredTheme();
    var resolved = resolveTheme(current);
    var next = resolved === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    applyTheme(next);
  }

  var btn1 = document.getElementById("theme-toggle");
  var btn2 = document.getElementById("theme-toggle-mobile");
  if (btn1) btn1.addEventListener("click", toggle);
  if (btn2) btn2.addEventListener("click", toggle);

  // React to OS theme changes in "system" mode
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function onSystemChange() {
    if (getStoredTheme() !== "system") return;
    applyTheme("system");
  }
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onSystemChange);
  } else if (typeof media.addListener === "function") {
    media.addListener(onSystemChange);
  }

  document.querySelectorAll("details").forEach(function (d) {
    d.addEventListener("click", function (e) {
      var t = e.target.closest("a, button");
      if (t && !t.matches("summary, summary *")) {
        d.open = false;
      }
    });
  });
})();
