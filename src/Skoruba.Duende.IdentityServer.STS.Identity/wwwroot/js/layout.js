(function () {
  function apply(theme) {
    var root = document.documentElement;
    var darkIcon = document.getElementById("theme-toggle-dark-icon");
    var lightIcon = document.getElementById("theme-toggle-light-icon");
    if (theme === "dark") {
      root.classList.add("dark");
      if (darkIcon) darkIcon.classList.add("hidden");
      if (lightIcon) lightIcon.classList.remove("hidden");
    } else {
      root.classList.remove("dark");
      if (lightIcon) lightIcon.classList.add("hidden");
      if (darkIcon) darkIcon.classList.remove("hidden");
    }
  }

  // Initialize icons based on current theme (set by theme-init.js)
  var currentTheme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  var darkIcon = document.getElementById("theme-toggle-dark-icon");
  var lightIcon = document.getElementById("theme-toggle-light-icon");
  if (currentTheme === "dark") {
    if (darkIcon) darkIcon.classList.add("hidden");
    if (lightIcon) lightIcon.classList.remove("hidden");
  } else {
    if (lightIcon) lightIcon.classList.add("hidden");
    if (darkIcon) darkIcon.classList.remove("hidden");
  }

  function toggle() {
    var next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    localStorage.setItem("theme", next);
    apply(next);
  }

  var btn1 = document.getElementById("theme-toggle");
  var btn2 = document.getElementById("theme-toggle-mobile");
  if (btn1) btn1.addEventListener("click", toggle);
  if (btn2) btn2.addEventListener("click", toggle);

  document.querySelectorAll("details").forEach(function (d) {
    d.addEventListener("click", function (e) {
      var t = e.target.closest("a, button");
      if (t && !t.matches("summary, summary *")) {
        d.open = false;
      }
    });
  });
})();
