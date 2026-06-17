# Risk & Position Size Calculator

A small trading tool: enter your account balance, how much of it you're willing to
risk, and where your entry/stop/target sit — it tells you exactly how many units to
buy or sell, what that costs in capital, and your risk:reward ratio. Built because
sizing a position by hand (or in a half-remembered spreadsheet) before every trade
gets old fast, and getting it wrong is the easiest way to blow up an account.

Live demo: _add your Vercel URL here after deploying_

Built by **VIKAS HANAMANT TALAWAR** — talawarh316@gmail.com

## What it does

- Long or short position support
- Account balance, risk %, entry price, stop-loss price, and an optional target price
- Calculates: position size (units), amount at risk, capital deployed, % of account
  used, and risk:reward ratio
- A risk gauge that flags when you're in conservative / moderate / aggressive
  territory for that trade
- Clear validation — e.g. it tells you directly if your stop-loss is on the wrong
  side of your entry for the direction you picked, instead of just showing a wrong
  number
- INR / USD / EUR / GBP display, all client-side, no backend and no API calls

## Tech stack

Next.js 14 (App Router), React 18, plain CSS Modules. No external libraries beyond
Next/React itself, so there's nothing extra to configure on Vercel.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

(Built and the math logic unit-tested in an environment without internet access,
so before you deploy it's worth running this locally once yourself and trying a
few numbers — see "A note on testing" below.)

## Deploying (GitHub + Vercel, both free)

1. Create a new **public** repo on GitHub (e.g. `risk-position-calculator`).
2. From this project folder:
   ```bash
   git init
   git add .
   git commit -m "Risk and position size calculator"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import** your
   GitHub repo.
4. Vercel auto-detects Next.js — leave all settings on default (no env vars, no
   build command changes needed) → **Deploy**.
5. Once it finishes, Vercel gives you a live `.vercel.app` URL. That's your live
   tool link.

## A note on testing

The position-size and risk:reward formulas were written as a plain JS function and
verified against hand-calculated test cases (long/short, with/without a target,
decimal prices, division-by-zero and wrong-side-of-entry edge cases) before being
wired into the React UI — see the math in `lib/risk.js`. I didn't have a way to run
a full `next build` in the environment I built this in, so please do a quick local
`npm run dev` check (or just watch the Vercel build/deploy logs) before calling it
done.

## Project structure

```
app/
  layout.js            root layout, fonts, metadata
  page.js               page shell + intro copy
  page.module.css
  globals.css            design tokens (colors, fonts)
components/
  RiskCalculator.js       the calculator itself
  RiskCalculator.module.css
lib/
  risk.js                 pure calculation functions
```
