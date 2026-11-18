"use strict";

// Make dynamic current year instead of hard coded one:
const yearElement = document.querySelector(".year");
yearElement.textContent = String(new Date().getFullYear());

// Make mobile navigation functional:
const btnNavEl = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector(".header");
btnNavEl.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
})

// Native links retain their default behavior; selecting a section closes the menu.
document.querySelectorAll(".main-nav-link").forEach((link) => {
  link.addEventListener("click", () => headerEl.classList.remove("nav-open"));
});

// A placeholder reserves header space so sticky navigation cannot shift the page.
const hero = document.querySelector(".section-hero");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle("sticky", !entry.isIntersecting);
  });
  observer.observe(hero);
}

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
