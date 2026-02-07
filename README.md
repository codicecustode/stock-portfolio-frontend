# Portfolio Dashboard

A lightweight stock portfolio dashboard built with the Next.js App Router. It renders a holdings table, sector summary, and derived metrics from local data so you can iterate quickly without a backend.

Live demo: https://stock-portfolio-dash.netlify.app/

## Features

- Holdings table with per-position metrics and totals.
- Sector summary with aggregated exposure.
- Type-safe data model and helpers.
- Simple, local data source for rapid prototyping.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- CSS (global styles)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

- `npm run dev` - Start the dev server.
- `npm run build` - Build for production.
- `npm run start` - Run the production build.
- `npm run lint` - Lint the project.

## Project Structure

- [src/app/page.tsx](src/app/page.tsx) - Page composition.
- [src/components/PortfolioTable.tsx](src/components/PortfolioTable.tsx) - Holdings table UI.
- [src/components/SectorSummary.tsx](src/components/SectorSummary.tsx) - Sector breakdown UI.
- [src/stocks/stockData.ts](src/stocks/stockData.ts) - Local data source.
- [src/types/stock.ts](src/types/stock.ts) - Shared types.
- [src/app/globals.css](src/app/globals.css) - Global styles.

## Data Editing

Update the portfolio data in [src/stocks/stockData.ts](src/stocks/stockData.ts). The UI recalculates totals and sector exposure on reload.

## Deployment

Build and deploy like any standard Next.js app. For example:

```bash
npm run build
npm run dev
```
