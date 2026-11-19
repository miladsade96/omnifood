"use strict";

function initNetlifyForm(form, status, options = {}) {
  const submitButton = form.querySelector('[type="submit"]');
  const submitLabel = submitButton.textContent;
  const { hostname, protocol } = window.location;
  const localPreview = protocol === "file:" || hostname === "localhost"
    || hostname.endsWith(".localhost") || hostname === "[::1]"
    || /^127(?:\.\d{1,3}){3}$/.test(hostname);
  let pending = false;

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }

  function resetFeedback() {
    setStatus(localPreview ? "Local preview: no request will be sent or saved." : "", localPreview ? "preview" : "idle");
  }

  resetFeedback();

  form.addEventListener("input", () => {
    if (!pending) resetFeedback();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;

    if (localPreview) {
      setStatus("Your details pass validation. This local preview does not send or save a request.", "preview");
      return;
    }

    // Capture all fields, including form-name and the honeypot, before disabling.
    const body = new URLSearchParams(new FormData(form)).toString();
    const enabledControls = [...form.querySelectorAll("input, select, textarea, button")]
      .filter((control) => !control.disabled);
    pending = true;
    enabledControls.forEach((control) => { control.disabled = true; });
    form.setAttribute("aria-busy", "true");
    submitButton.textContent = "Sending...";
    setStatus("Sending your request...", "sending");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok) throw new Error("Form submission failed");
      form.reset();
      setStatus(options.successMessage || "Thanks! Your request has been sent.", "success");
    } catch {
      setStatus("Your request could not be sent. Please try again. Your details have been kept in this form.", "error");
    } finally {
      pending = false;
      enabledControls.forEach((control) => { control.disabled = false; });
      submitButton.textContent = submitLabel;
      form.removeAttribute("aria-busy");
    }
  });

  return { resetFeedback };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initNetlifyForm };
}
