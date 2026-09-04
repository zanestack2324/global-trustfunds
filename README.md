# Global Trustfunds

A modern, fully-responsive property investment website. Invest in premium real estate from just **$100** and earn target returns of **9–14% APY** in monthly passive income.

## Pages
- `index.html` — Landing page (hero, features, calculator, testimonials, FAQ)
- `properties.html` — Filterable property catalog
- `about.html` — Company story & values
- `contact.html` — Working contact form
- `signup.html` / `login.html` — Functional demo auth (localStorage)
- `dashboard.html` — Investor dashboard
- `risk.html` / `privacy.html` / `terms.html` — Legal pages
- `404.html` — Custom not-found page

## Tech
- Hand-written HTML, CSS, and vanilla JavaScript (no frameworks, no build step)
- Assets hosted locally under `/assets` for performance
- Custom brand logo (`assets/logo.svg`, `assets/favicon.svg`)

## Run locally
Open `index.html` in any modern browser, or serve statically:

```bash
npx serve .
```

## Deploy
The site is a static site and deploys to Vercel:

```bash
vercel --prod
```

> **Demo note:** Auth and forms use `localStorage` for demonstration purposes. Connect a real backend (e.g. a serverless API, Supabase, or Formspree) before production use. All investments shown are illustrative.
