document.addEventListener("DOMContentLoaded", function () {
  const cultureSelect = document.getElementById("cultureSelect");
  const cultureForm = document.getElementById("selectLanguageForm");

  if (cultureSelect && cultureForm) {
    cultureSelect.addEventListener("change", function () {
      cultureForm.submit();
    });
  }
});
