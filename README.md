# Global Trustfunds

A responsive property-investment website and interactive **portfolio demo**. Explore real-estate investing with fractional ownership, on-chain style flows, an investor dashboard, and a returns calculator.

> **Demo notice:** This is a front-end demonstration. It has **no real accounts, no financial transactions, and no real money** — auth and forms run entirely in `localStorage`, and "on-chain" transactions are simulated. All figures (portfolio balances, investors, returns, raised amounts) are illustrative and not real operating metrics.

## Pages
- `index.html` — Landing (hero, market ticker, stats, features, testimonials, calculator, FAQ, footer risk disclosure)
- `properties.html` — Filterable property catalog
- `about.html`, `why.html`, `how.html` — Company & how-it-works
- `testimonials.html` — Investor stories (local placeholder avatars)
- `calculator.html` — Returns calculator
- `faq.html` — FAQ accordion
- `contact.html` — Demo contact form (saves to `localStorage`)
- `signup.html` / `login.html` — Demo auth (`localStorage`, plaintext — not for production)
- `dashboard.html` — Investor dashboard (hardcoded illustrative data + simulated wallet)
- `risk.html` / `privacy.html` / `terms.html` — Legal pages
- `404.html` — Custom not-found page

## Tech
- Hand-written HTML, CSS, and vanilla JavaScript (no frameworks, no build step)
- All assets hosted locally under `/assets` (including `logo.png` branding and `assets/avatars/*` placeholder photos)
- Security headers + CSP configured via `vercel.json`
- Deploys automatically to Vercel on push to `main`

## Run locally
Serve the folder statically (do not open the HTML directly — assets are relative):

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Deploy
Commit to `main` and push — Vercel auto-deploys the static site:

```bash
git add -A && git commit -m "..." && git push origin main
```

## Production readiness
This is a **demo**, not a live financial product. Before treating it as production you would need a real backend (server-side hashed auth + sessions, custodial/regulated transaction handling, and KYC), plus real, attributable data replacing the current illustrative figures.
