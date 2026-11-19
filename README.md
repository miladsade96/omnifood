# Omnifood

A responsive food subscription landing page built with HTML, CSS and vanilla JavaScript. This repository is a marketing demo, without meal ordering, payments or customer accounts.

## Run locally

No dependency installation or build is required. From the repository directory, run:

```powershell
python -m http.server 8088 --bind 127.0.0.1
```

Open <http://127.0.0.1:8088>. Stop the server with Ctrl+C.

## Netlify deployment and sign-up form

1. Merge this branch into the repository's production branch (`main` or `master`) and connect that branch to a Netlify project.
2. `netlify.toml` sets Node 22, build command `npm run build`, and publish directory `dist`. File-based settings override the corresponding Netlify UI settings.
3. In Netlify, open **Forms**, enable **form detection**, then deploy or redeploy.
4. Check that **sign-up** appears in Forms. Send one request from the deployed site and verify it in **Verified submissions** (or **Spam**).
5. Configure **Forms > Submission notifications** if you want email alerts; no notification address is stored in this code.

The form has a static HTML definition, a hidden `form-name` field and a `bot-field` honeypot. Hosted requests are URL-encoded POSTs. Pending requests disable editing and duplicate sends; failures keep input for retry. Browser validation rejects blank names and invalid emails.

Localhost, loopback and file previews never submit or save personal details. Receiving a request does not create a subscription or customer account. Live receipt must be verified after deployment.

See [Netlify Forms setup](https://docs.netlify.com/manage/forms/setup/) and [spam filtering](https://docs.netlify.com/manage/forms/spam-filters/).

```powershell
node --test tests/netlify-form.test.cjs
```

## Deployment build and Lighthouse

`npm run build` checks JavaScript syntax, runs the form tests, and copies only the site's HTML, JavaScript, manifest, CSS and images into `dist/`. Local source preview above still requires no package installation.

The build configuration enables `@netlify/plugin-lighthouse` and pins version `6.0.4` in `package.json` and `package-lock.json`. This replaces an older UI-installed major version for this checkout, while keeping Lighthouse audits enabled. Plugin v4 rejects Node 22; v6 supports it. See [Netlify's plugin version and configuration rules](https://docs.netlify.com/extend/install-and-use/build-plugins/).

```powershell
npm run build
python -m http.server 8088 --bind 127.0.0.1 --directory dist
```

For a local Lighthouse/Netlify build, install the locked development dependencies with `npm ci` first. Netlify installs them during deployment automatically.

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
