from fastapi import APIRouter, HTTPException, Query

from app.domain.schemas import (
    AgentMessage,
    BacktestInput,
    BacktestResult,
    DashboardSnapshot,
    HealthStatus,
    MarketSnapshot,
    RiskSettings,
    RiskSettingsInput,
    SystemStatus,
    TradeRecord,
    TradingAgent,
    TradingSignal,
    TradingStrategy,
)
from app.services.demo_trading import demo_trading_service

router = APIRouter()


@router.get("/healthz", response_model=HealthStatus, tags=["health"])
def healthcheck() -> HealthStatus:
    return HealthStatus()


@router.get("/dashboard", response_model=DashboardSnapshot)
def get_dashboard() -> DashboardSnapshot:
    return demo_trading_service.get_dashboard()


@router.get("/agents", response_model=list[TradingAgent])
def get_agents() -> list[TradingAgent]:
    return demo_trading_service.get_agents()


@router.get("/signals", response_model=list[TradingSignal])
def get_signals() -> list[TradingSignal]:
    return demo_trading_service.get_signals()


@router.get("/market", response_model=MarketSnapshot)
def get_market(
    symbol: str = Query(min_length=1, max_length=16),
    interval: str = Query(default="1D", pattern="^(1D|1W|1M)$"),
) -> MarketSnapshot:
    try:
        return demo_trading_service.get_market(symbol, interval)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Instrument is not available in demo mode") from error


@router.get("/strategies", response_model=list[TradingStrategy])
def get_strategies() -> list[TradingStrategy]:
    return demo_trading_service.get_strategies()


@router.post("/backtests", response_model=BacktestResult)
def run_backtest(request: BacktestInput) -> BacktestResult:
    try:
        return demo_trading_service.run_backtest(request)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Strategy is not available in demo mode") from error


@router.get("/collaboration", response_model=list[AgentMessage])
def get_collaboration() -> list[AgentMessage]:
    return demo_trading_service.get_collaboration()


@router.get("/trades", response_model=list[TradeRecord])
def get_trades() -> list[TradeRecord]:
    return demo_trading_service.get_trades()


@router.get("/risk", response_model=RiskSettings)
def get_risk_settings() -> RiskSettings:
    return demo_trading_service.get_risk_settings()


@router.put("/risk", response_model=RiskSettings)
def update_risk_settings(request: RiskSettingsInput) -> RiskSettings:
    return demo_trading_service.update_risk_settings(request)


@router.get("/system", response_model=SystemStatus)
def get_system_status() -> SystemStatus:
    return demo_trading_service.get_system_status()
