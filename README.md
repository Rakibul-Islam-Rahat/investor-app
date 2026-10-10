# AgroFund — Agritech Investor Management Platform (Frontend)

React 18 + Vite + Tailwind + shadcn/ui. Implements the SRS-AGRO-2026-v1.0 frontend (investor, field, finance and admin portals).

## Run
    cp .env.example .env
    npm install
    npm run dev

Mock mode (`VITE_USE_MOCK=true`, default) runs everything without a backend. Demo accounts are shown on the login page.
Set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL` to switch to a real API.
