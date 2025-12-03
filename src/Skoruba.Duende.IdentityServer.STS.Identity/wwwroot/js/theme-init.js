(function () {
  const theme = localStorage.getItem("theme") || "light";
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
})();
