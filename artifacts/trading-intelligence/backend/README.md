# AI Trading Intelligence API

This Python service powers the web app's demo workspace. Its market candles,
signals, account values, strategy results, and trade history are generated
examples. They are not live market data, investment advice, or real trades.

## Run locally

From this directory:

```sh
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Copy `.env.example` to `.env` only if you need to change local demo settings.
The API listens under `/api/trading`; interactive API documentation is at
`/api/trading/docs`.

## Project map

- `app/api/` — HTTP routes for dashboard, markets, agents, strategies, risk, and history
- `app/agents/` — agent roster and collaboration examples
- `app/connectors/` — integration boundaries; MetaTrader 5 is deliberately unavailable
- `app/core/` — environment-backed settings and safe defaults
- `app/domain/` — response models and replaceable provider/repository interfaces
- `app/services/` — demo data and the simulated backtest implementation

## Runtime boundaries

- Demo mode is required. Enabling order execution through an environment
  variable is rejected by settings validation.
- Risk settings are in-memory for this demo and reset when the service restarts.
- PostgreSQL, LangGraph, XGBoost, and PyTorch are optional future extensions;
  install the corresponding extras only when implementing those integrations.
- MetaTrader 5 is not imported or connected. Its connector fails closed until a
  separately reviewed integration is implemented.
- The API contains no order-placement endpoint.
