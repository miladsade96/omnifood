"use strict";

document.querySelector(".year").textContent = new Date().getFullYear();

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

initNetlifyForm(document.querySelector(".cta-form"), document.querySelector("#form-status"), {
  successMessage: "Thanks! Your sign-up request has been sent.",
});

// Existing fallback for Safari versions without flexbox gap support.
function checkFlexGap() {
  const flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";
  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));
  document.body.appendChild(flex);
  if (flex.scrollHeight !== 1) document.body.classList.add("no-flexbox-gap");
  flex.remove();
}
checkFlexGap();
