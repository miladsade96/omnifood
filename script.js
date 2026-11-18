"use strict";

// Make dynamic current year instead of hard coded one:
const yearElement = document.querySelector(".year");
yearElement.textContent = String(new Date().getFullYear());

const menuButton = document.querySelector(".btn-mobile-nav");
const header = document.querySelector(".header");
const navigation = document.querySelector(".main-nav");
const mobileLayout = window.matchMedia("(max-width: 59em)");
const backgroundContent = document.querySelectorAll("main, footer, .header > a");

function setMenuOpen(open, restoreFocus = false) {
  const isOpen = open && mobileLayout.matches;
  header.classList.toggle("nav-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  backgroundContent.forEach((element) => { element.inert = isOpen; });

  // Keep focus on the disclosure button; Tab enters the visible navigation.
  if (!isOpen && restoreFocus && mobileLayout.matches) menuButton.focus();
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

// Native links handle hashes, history, modifier keys, email and phone links.
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (menuButton.getAttribute("aria-expanded") !== "true") return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenuOpen(false, true);
  } else if (event.key === "Tab") {
    const firstLink = navigation.querySelector("a");
    if (event.shiftKey && document.activeElement === firstLink) {
      event.preventDefault();
      menuButton.focus();
    } else if (!event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault();
      firstLink.focus();
    }
  }
});

mobileLayout.addEventListener("change", () => {
  const focusWasInNavigation = navigation.contains(document.activeElement);
  const focusWasOnButton = document.activeElement === menuButton;
  setMenuOpen(false, focusWasInNavigation);
  if (!mobileLayout.matches && focusWasOnButton) navigation.querySelector("a").focus();
});

// A placeholder reserves header space so sticky navigation cannot shift the page.
const hero = document.querySelector(".section-hero");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle("sticky", !entry.isIntersecting);
  });
  observer.observe(hero);
}

const form = document.querySelector(".cta-form");
const formStatus = document.querySelector("#form-status");
const submitButton = form.querySelector('[type="submit"]');
const isLocalPreview = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
  || location.protocol === "file:";

if (isLocalPreview) {
  formStatus.textContent = "Local preview: no sign-up request will be sent or saved.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity() || submitButton.disabled) return;

  if (isLocalPreview) {
    formStatus.textContent = "Your details pass validation. This preview does not send or save a sign-up request.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  form.setAttribute("aria-busy", "true");
  formStatus.textContent = "Sending your request...";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!response.ok) throw new Error("Sign-up request failed");
    form.reset();
    formStatus.textContent = "Thanks! Your sign-up request has been sent.";
  } catch {
    formStatus.textContent = "Your request could not be sent. Please try again or email hello@omnifood.com.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Sign up now";
    form.removeAttribute("aria-busy");
  }
});

// Fixing flexbox gap property missing in some Safari versions
function checkFlexGap() {
  const flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";

  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));

  document.body.appendChild(flex);
  const isSupported = flex.scrollHeight === 1;
  flex.parentNode.removeChild(flex);

  if (!isSupported) document.body.classList.add("no-flexbox-gap");
}
checkFlexGap();
