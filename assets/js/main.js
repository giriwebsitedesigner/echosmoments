const header = document.querySelector("[data-header]");

document.querySelectorAll("[data-header]").forEach((siteHeader) => {
  const nav = siteHeader.querySelector(".nav");
  const cta = siteHeader.querySelector(".header-cta");
  if (!nav || siteHeader.querySelector(".menu-toggle")) return;

  const toggle = document.createElement("button");
  toggle.className = "menu-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open navigation menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = "<span></span><span></span><span></span>";
  siteHeader.insertBefore(toggle, cta || nav.nextSibling);

  toggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteHeader.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    });
  });
});

window.addEventListener("click", (event) => {
  document.querySelectorAll("[data-header].menu-open").forEach((siteHeader) => {
    if (siteHeader.contains(event.target)) return;
    siteHeader.classList.remove("menu-open");
    const toggle = siteHeader.querySelector(".menu-toggle");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open navigation menu");
  });
});

window.addEventListener("scroll", () => {
  if (!header) return;
  header.style.transform =
    window.scrollY > 24 ? "translateX(-50%) translateY(-3px)" : "translateX(-50%)";
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const filters = document.querySelectorAll("[data-filter]");
const galleryItems = document.querySelectorAll("[data-gallery] figure");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    galleryItems.forEach((item) => {
      item.classList.toggle(
        "is-hidden",
        selected !== "all" && item.dataset.category !== selected
      );
    });
  });
});

const inquiryModal = document.querySelector("[data-inquiry-modal]");
const openInquiryButtons = document.querySelectorAll("[data-open-inquiry]");
const closeInquiryButtons = document.querySelectorAll("[data-close-inquiry]");
const inquiryForms = document.querySelectorAll("[data-inquiry-form]");
const whatsappNumber = "917305980846";

const fieldLabels = {
  name: "name",
  phone: "phone or WhatsApp number",
  project: "project type",
  timeline: "date or timeline",
  location: "location",
  message: "message",
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const openInquiryModal = () => {
  if (!inquiryModal) return;
  inquiryModal.hidden = false;
  document.body.classList.add("modal-open");
  const firstField = inquiryModal.querySelector("input, select, textarea");
  window.setTimeout(() => firstField?.focus(), 80);
};

const closeInquiryModal = () => {
  if (!inquiryModal) return;
  inquiryModal.hidden = true;
  document.body.classList.remove("modal-open");
};

openInquiryButtons.forEach((button) => button.addEventListener("click", openInquiryModal));
closeInquiryButtons.forEach((button) => button.addEventListener("click", closeInquiryModal));

window.setTimeout(openInquiryModal, 3000);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeInquiryModal();
});

const getFieldError = (field) => {
  const value = field.value.trim();
  if (!value) return `Please enter your ${fieldLabels[field.name]}.`;
  if (field.name === "phone" && value.replace(/\D/g, "").length < 10) {
    return "Please enter a valid phone or WhatsApp number.";
  }
  if (field.name === "message" && value.length < 12) {
    return "Please add a little more detail about the requirement.";
  }
  return "";
};

const setupInquiryForm = (form) => {
  const submitButton = form.querySelector("[data-submit-inquiry]");
  const status = form.querySelector("[data-form-status]");
  const requiredFields = Array.from(form.querySelectorAll("[required]"));

  const setFieldError = (field, message) => {
    const error = form.querySelector(`[data-error-for="${field.name}"]`);
    if (error) error.textContent = message;
  };

  const validateForm = (showErrors = false) => {
    const errors = requiredFields
      .map((field) => [field, getFieldError(field)])
      .filter(([, error]) => error);

    requiredFields.forEach((field) => {
      const error = getFieldError(field);
      if (showErrors || !error) setFieldError(field, showErrors ? error : "");
    });

    const isReady = errors.length === 0;
    submitButton.disabled = !isReady;
    status.classList.toggle("success", isReady);
    status.classList.toggle("error", showErrors && !isReady);
    status.textContent = isReady
      ? "Thank you. Your inquiry is ready to send on WhatsApp."
      : "Complete all details to send a warm inquiry directly on WhatsApp.";

    return isReady;
  };

  const buildMessage = () => {
    const data = new FormData(form);
    return [
      `${getGreeting()} ECHOS MOMENTS team,`,
      "",
      "I would like to send a new project inquiry.",
      "",
      `Name: ${data.get("name").trim()}`,
      `Phone / WhatsApp: ${data.get("phone").trim()}`,
      `Project Type: ${data.get("project").trim()}`,
      `Date / Timeline: ${data.get("timeline").trim()}`,
      `Location: ${data.get("location").trim()}`,
      `Message: ${data.get("message").trim()}`,
      "",
      "Please get back to me with the next steps. Thank you.",
    ].join("\n");
  };

  requiredFields.forEach((field) => {
    field.addEventListener("input", () => validateForm(false));
    field.addEventListener("change", () => validateForm(false));
    field.addEventListener("blur", () => setFieldError(field, getFieldError(field)));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm(true)) {
      status.textContent = "Please fill every required detail correctly before sending.";
      return;
    }

    status.textContent = "Opening WhatsApp with your complete inquiry. Thank you.";
    status.classList.add("success");
    const message = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener");
  });

  validateForm(false);
};

inquiryForms.forEach(setupInquiryForm);
