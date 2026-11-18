# Omnifood

A responsive food subscription landing page built with HTML, CSS and vanilla JavaScript. This repository is a marketing demo, without meal ordering, payments or customer accounts.

## Run locally

No dependency installation or build is required. From the repository directory, run:

```powershell
python -m http.server 8088 --bind 127.0.0.1
```

Open <http://127.0.0.1:8088>. Stop the server with Ctrl+C.

## Sign-up form

- Browser validation rejects empty fields, whitespace-only names and invalid email addresses.
- On localhost or when opened as a file, the form is a preview: it neither sends nor saves personal details. Its status message says this explicitly.
- The hosted form uses Netlify Forms: a POST request with URL-encoded data and a hidden `form-name` field. Submission feedback includes sending, success and retryable error states.
- Receiving real requests requires enabling form detection on Netlify and deploying the site. This is not provided by Python's static server or by arbitrary static hosting. See the [official Netlify Forms setup](https://docs.netlify.com/manage/forms/setup/).
- Hosting and live submission delivery have not been tested or changed during the local review.

## Interaction and layout checks

- Navigation uses native fragment links, including browser history, with an offset for the sticky header. Email and phone links retain their native behavior.
- The mobile menu supports Escape, keyboard focus containment, background scroll locking and resetting when switching to desktop.
- Zoom is permitted, a skip link is available, and reduced-motion preferences disable animations and smooth scrolling.
- Unimplemented account, app, social and recipe-directory links have been replaced with links to existing sections or contact actions.
- Images below the hero are lazy-loaded.

Manual browser checks covered 320px, 390px, 768px and 1440px viewports, menu keyboard behavior, mobile/desktop transitions, both pricing links and invalid/valid local form submissions. No horizontal content overflow was found at those widths.

Quick JavaScript syntax check:

```powershell
node --check script.js
```
