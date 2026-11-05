document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll(".password-form");

    // Keep Change Password optional and collapsed until the player requests it.
    document.querySelectorAll(".password-section-toggle").forEach(function (toggle) {
        const panel = toggle.nextElementSibling;
        if (!panel || !panel.classList.contains("password-collapse-panel")) return;
        toggle.setAttribute("aria-expanded", "false");
        panel.hidden = true;
        toggle.addEventListener("click", function () {
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isOpen));
            panel.hidden = isOpen;
        });
    });

    function validatePassword(password) {
        return {
            length: password.length >= 8 && password.length <= 15,
            letter: /[A-Za-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@_?#]/.test(password)
        };
    }

    function addPasswordToggle(input) {
        const wrap = document.createElement("div");
        wrap.className = "password-input-wrap";
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "password-toggle";
        toggle.setAttribute("aria-label", "Show password");
        toggle.innerHTML = '<i class="fa-regular fa-eye"></i>';
        toggle.addEventListener("click", function () {
            const showing = input.type === "text";
            input.type = showing ? "password" : "text";
            toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
            toggle.innerHTML = showing ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
        });
        wrap.appendChild(toggle);
    }

    forms.forEach(function (form) {
        const current = form.querySelector('[name="currentPassword"]');
        const newPass = form.querySelector('[name="newPassword"]');
        const confirmPass = form.querySelector('[name="confirmPassword"]');
        const message = form.querySelector(".password-message");
        if (!current || !newPass || !confirmPass || !message) return;

        [current, newPass, confirmPass].forEach(addPasswordToggle);

        const strength = document.createElement("div");
        strength.className = "password-strength";
        strength.innerHTML = '<div class="strength-track"><span></span></div><small>Password strength: <b>Not entered</b></small>';
        newPass.closest(".form-group").appendChild(strength);

        const checklist = document.createElement("ul");
        checklist.className = "password-checklist";
        checklist.innerHTML = '<li data-rule="length">8–15 characters</li><li data-rule="letter">At least one letter</li><li data-rule="number">At least one number</li><li data-rule="special">At least one special character (! @ _ ? #)</li>';
        strength.appendChild(checklist);

        newPass.addEventListener("input", function () {
            const rules = validatePassword(newPass.value);
            const passed = Object.values(rules).filter(Boolean).length;
            const labels = ["Not entered", "Weak", "Fair", "Good", "Strong"];
            strength.querySelector(".strength-track span").style.width = (passed * 25) + "%";
            strength.querySelector("small b").textContent = newPass.value ? labels[passed] : labels[0];
            Object.keys(rules).forEach(function (key) {
                checklist.querySelector('[data-rule="' + key + '"]').classList.toggle("valid", rules[key]);
            });
        });

        function showMessage(type, text) {
            message.className = "password-message " + type;
            message.textContent = text;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const currentValue = current.value.trim();
            const newValue = newPass.value;
            const confirmValue = confirmPass.value;

            if (!currentValue) return showMessage("error", "Please enter your current password.");
            if (!newValue) return showMessage("error", "Please enter your new password.");
            const rules = validatePassword(newValue);
            if (!Object.values(rules).every(Boolean)) return showMessage("error", "Please meet all password requirements before continuing.");
            if (!confirmValue) return showMessage("error", "Please confirm your new password.");
            if (newValue !== confirmValue) return showMessage("error", "Your new passwords do not match.");
            if (currentValue === newValue) return showMessage("error", "Your new password must be different from your current password.");

            // Front-end prototype only: a secure backend/API is required to actually change the password.
            showMessage("success", "All checks passed. Connect this form to your account service to update the password.");
        });
    });

    document.querySelectorAll(".copy-text-btn").forEach(function (button) {
        button.addEventListener("click", async function () {
            const value = button.getAttribute("data-copy") || "";
            try {
                await navigator.clipboard.writeText(value);
                button.classList.add("copied");
                button.title = "Copied";
                window.setTimeout(function () {
                    button.classList.remove("copied");
                    button.title = "Copy username";
                }, 1400);
            } catch (error) {
                button.title = "Copy not available";
            }
        });
    });

    document.querySelectorAll(".nav-item").forEach(function (item) {
        item.addEventListener("click", function () {
            document.querySelectorAll(".nav-item").forEach(function (nav) { nav.classList.remove("active"); });
            item.classList.add("active");
        });
    });
});


// Contact edit prototype. Replace prompt with a verified account API in production.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-contact-edit]").forEach(function (button) {
    button.addEventListener("click", function () {
      const row = button.closest(".contact-info-row");
      const value = row && row.querySelector(".contact-info-copy strong");
      if (!value) return;
      const current = value.textContent.trim().replace(/\s+(Not provided|Masked)$/, "");
      const label = button.getAttribute("data-contact-edit") === "email" ? "email address" : "contact number";
      const updated = window.prompt("Enter your new " + label + ":", current === "--" ? "" : current);
      if (updated !== null && updated.trim()) { value.textContent = updated.trim(); }
    });
  });
});
