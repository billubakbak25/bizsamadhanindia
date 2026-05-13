const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const contactForm = document.getElementById("contactForm");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (contactForm) {
  const fields = {
    name: {
      element: contactForm.querySelector("#name"),
      validate: (value) => value.trim().length >= 2,
      message: "Please enter your name.",
    },
    phone: {
      element: contactForm.querySelector("#phone"),
      validate: (value) => /^[0-9+\-\s]{10,15}$/.test(value.trim()),
      message: "Please enter a valid phone number.",
    },
    service: {
      element: contactForm.querySelector("#service"),
      validate: (value) => value.trim() !== "",
      message: "Please select a service.",
    },
    message: {
      element: contactForm.querySelector("#message"),
      validate: (value) => value.trim().length >= 10,
      message: "Please enter at least 10 characters.",
    },
  };

  const setError = (input, message = "") => {
    const row = input.closest(".form-row");
    const messageEl = row.querySelector(".error-message");
    row.classList.toggle("error", Boolean(message));
    messageEl.textContent = message;
  };

  const validateField = (key) => {
    const field = fields[key];
    const isValid = field.validate(field.element.value);
    setError(field.element, isValid ? "" : field.message);
    return isValid;
  };

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    ["input", "change", "blur"].forEach((eventName) => {
      field.element.addEventListener(eventName, () => validateField(key));
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isFormValid = Object.keys(fields).every((key) => validateField(key));
    const formStatus = document.getElementById("formStatus");

    if (!isFormValid) {
      formStatus.textContent = "Please correct the highlighted fields and try again.";
      formStatus.style.color = "#dc2626";
      return;
    }

    formStatus.textContent = "Thank you. Your request has been submitted successfully.";
    formStatus.style.color = "#0f766e";
    contactForm.reset();

    Object.keys(fields).forEach((key) => {
      setError(fields[key].element);
    });
  });
}

