from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DemoMode = Literal["DEMO"]
DataLabel = Literal["SIMULATED"]
Interval = Literal["1D", "1W", "1M"]


class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class AccountSnapshot(ApiModel):
    currency: str
    balance: float
    equity: float
    dayPnl: float
    dayPnlPercent: float
    openPositions: int
    riskUsedPercent: float


class EquityPoint(ApiModel):
    timestamp: datetime
    value: float


class OpenPosition(ApiModel):
    id: str
    symbol: str
    side: Literal["LONG", "SHORT"]
    quantity: float
    entryPrice: float
    markPrice: float
    pnl: float
    openedAt: datetime


class TradingSignal(ApiModel):
    id: str
    symbol: str
    direction: Literal["LONG_BIAS", "SHORT_BIAS", "NEUTRAL"]
    timeframe: str
    confidence: float = Field(ge=0, le=100)
    rationale: str
    createdAt: datetime
    dataLabel: DataLabel = "SIMULATED"


class DashboardSnapshot(ApiModel):
    mode: DemoMode = "DEMO"
    dataLabel: DataLabel = "SIMULATED"
    updatedAt: datetime
    account: AccountSnapshot
    equityCurve: list[EquityPoint]
    positions: list[OpenPosition]
    signals: list[TradingSignal]


class TradingAgent(ApiModel):
    id: str
    name: str
    specialty: str
    status: Literal["ANALYZING", "MONITORING", "IDLE", "PAUSED"]
    confidence: float = Field(ge=0, le=100)
    summary: str
    lastRun: datetime


class MarketCandle(ApiModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float


class MarketIndicator(ApiModel):
    name: str
    value: float
    unit: str


class MarketSnapshot(ApiModel):
    symbol: str
    name: str
    interval: Interval
    dataLabel: DataLabel = "SIMULATED"
    candles: list[MarketCandle]
    indicators: list[MarketIndicator]


class TradingStrategy(ApiModel):
    id: str
    name: str
    description: str
    status: Literal["PAPER", "RESEARCH", "PAUSED"]
    symbols: list[str]
    winRate: float
    profitFactor: float
    maxDrawdown: float
    tradesCount: int


class BacktestInput(ApiModel):
    strategyId: str
    symbol: str
    interval: Interval
    startingCapital: float = Field(gt=0, le=1_000_000_000)


class BacktestResult(ApiModel):
    strategyId: str
    symbol: str
    dataLabel: DataLabel = "SIMULATED"
    netReturnPercent: float
    winRate: float
    maxDrawdownPercent: float
    tradesCount: int
    equityCurve: list[EquityPoint]


class AgentMessage(ApiModel):
    id: str
    agentId: str
    agentName: str
    message: str
    sentiment: Literal["SUPPORT", "CAUTION", "NEUTRAL"]
    createdAt: datetime


class TradeRecord(ApiModel):
    id: str
    symbol: str
    side: Literal["LONG", "SHORT"]
    quantity: float
    entryPrice: float
    exitPrice: float
    pnl: float
    openedAt: datetime
    closedAt: datetime
    result: Literal["WIN", "LOSS", "FLAT"]


class RiskSettingsInput(ApiModel):
    riskPerTradePercent: float = Field(gt=0, le=5)
    dailyLossLimitPercent: float = Field(gt=0, le=20)
    maxDrawdownPercent: float = Field(gt=0, le=50)
    maxOpenPositions: int = Field(ge=1, le=20)


class RiskSettings(RiskSettingsInput):
    executionEnabled: Literal[False] = False


class IntegrationStatus(ApiModel):
    name: str
    status: Literal["READY", "PLANNED", "NOT_CONFIGURED"]
    note: str


class SystemStatus(ApiModel):
    mode: DemoMode = "DEMO"
    dataLabel: DataLabel = "SIMULATED"
    tradingEnabled: Literal[False] = False
    integrations: list[IntegrationStatus]


class HealthStatus(ApiModel):
    status: Literal["ok"] = "ok"
    mode: DemoMode = "DEMO"
    dataLabel: DataLabel = "SIMULATED"
