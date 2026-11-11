# AI Trading Intelligence

Demo-only multi-agent market research workspace with a React interface and modular FastAPI backend. All prices, account values, signals, backtests, and trade records are simulated. The app cannot place real trades.

## Run & Operate

- `artifacts/trading-intelligence: web` — run the web app workflow
- `artifacts/trading-intelligence: python-api` — run the Python API workflow
- `pnpm --filter @workspace/trading-intelligence run typecheck` — check the web app
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and schemas after OpenAPI changes
- For standalone Python development, see `artifacts/trading-intelligence/backend/README.md`
- Demo settings are in `artifacts/trading-intelligence/backend/.env.example`; execution must remain disabled

## Stack

- pnpm workspace, Node.js 24, TypeScript 5.9
- Web app: React, Vite, TanStack Query, Recharts
- Product API: Python 3.11, FastAPI, Pydantic Settings, Uvicorn
- API client and validation types are generated from OpenAPI with Orval
- PostgreSQL, LangGraph, XGBoost, and PyTorch are optional future integrations, not active in demo mode

## Where things live

- `artifacts/trading-intelligence/src/` — dashboard and research workspace
- `artifacts/trading-intelligence/backend/app/` — Python API, demo data, agents, and integration boundaries
- `lib/api-spec/openapi.yaml` — source of truth for the frontend/backend API contract

## Architecture decisions

- API and UI data is explicitly simulated; demo agents are illustrative metadata and messages, not live model runs.
- The API has no order-placement route. Trading execution is fixed off, and the MetaTrader connector fails closed.
- Risk settings live in process memory for the demo and reset when the Python service restarts.
- `/api/trading` is routed to FastAPI; other `/api` routes remain on the shared API service.

## Product

Dashboard, agent roster, market research, strategy backtests, agent collaboration, risk controls, simulated trade history, and integration readiness.

## User preferences

Premium quantitative-terminal direction: dark theme, elegant typography, interactive charts, clear status indicators, and clean information-dense layouts.

## Gotchas

- Demo risk changes are not persisted and are not connected to execution.
- Restart the Python API workflow after backend or environment changes.
- Regenerate the typed client after changing the OpenAPI contract.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
