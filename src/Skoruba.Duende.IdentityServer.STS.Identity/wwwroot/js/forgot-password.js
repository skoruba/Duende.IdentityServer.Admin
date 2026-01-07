document.addEventListener("DOMContentLoaded", function () {
  const policyInputs = document.querySelectorAll('input[name="Policy"]');
  const emailSection = document.getElementById("resetPasswordByEmail");
  const usernameSection = document.getElementById("resetPasswordByUsername");

  function updateVisibility() {
    const selectedPolicy = document.querySelector(
      'input[name="Policy"]:checked'
    );
    if (selectedPolicy && emailSection && usernameSection) {
      const selectedValue = selectedPolicy.value;

      if (selectedValue === "Email") {
        emailSection.classList.remove("hidden");
        usernameSection.classList.add("hidden");
        // Enable/disable required fields
        const emailInput = emailSection.querySelector('input[type="email"]');
        const usernameInput =
          usernameSection.querySelector('input[type="text"]');
        if (emailInput) emailInput.required = true;
        if (usernameInput) usernameInput.required = false;
      } else if (selectedValue === "Username") {
        emailSection.classList.add("hidden");
        usernameSection.classList.remove("hidden");
        // Enable/disable required fields
        const emailInput = emailSection.querySelector('input[type="email"]');
        const usernameInput =
          usernameSection.querySelector('input[type="text"]');
        if (emailInput) emailInput.required = false;
        if (usernameInput) usernameInput.required = true;
      }
    }
  }

  policyInputs.forEach((input) => {
    input.addEventListener("change", updateVisibility);
  });

  // Initialize on page load
  updateVisibility();
});
