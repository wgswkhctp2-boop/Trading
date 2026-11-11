import hashlib
import math
import random
from datetime import UTC, datetime, timedelta

from app.agents.registry import AGENTS, COLLABORATION
from app.domain.schemas import (
    AccountSnapshot,
    AgentMessage,
    BacktestInput,
    BacktestResult,
    DashboardSnapshot,
    EquityPoint,
    IntegrationStatus,
    MarketCandle,
    MarketIndicator,
    MarketSnapshot,
    OpenPosition,
    RiskSettings,
    RiskSettingsInput,
    SystemStatus,
    TradeRecord,
    TradingAgent,
    TradingSignal,
    TradingStrategy,
)

_NOW = datetime.now(UTC)
_SYMBOLS = {
    "SPX": ("US 500 Index", 5_280.0),
    "SPY": ("SPDR S&P 500 ETF", 590.0),
    "QQQ": ("Invesco QQQ Trust", 510.0),
    "EURUSD": ("Euro / US Dollar", 1.084),
    "BTCUSD": ("Bitcoin / US Dollar", 67_500.0),
    "BTC-USD": ("Bitcoin / US Dollar", 67_500.0),
    "ETH-USD": ("Ethereum / US Dollar", 3_200.0),
    "NVDA": ("NVIDIA", 124.0),
    "AAPL": ("Apple", 223.0),
}

_SIGNALS = [
    TradingSignal(
        id="signal-spy",
        symbol="SPY",
        direction="LONG_BIAS",
        timeframe="1D",
        confidence=72,
        rationale="Generated demo candles show an illustrative trend condition; not a recommendation.",
        createdAt=_NOW - timedelta(minutes=1),
    ),
    TradingSignal(
        id="signal-1",
        symbol="SPX",
        direction="LONG_BIAS",
        timeframe="1D",
        confidence=76,
        rationale="Illustrative trend alignment in generated demo candles; not a recommendation.",
        createdAt=_NOW - timedelta(minutes=2),
    ),
    TradingSignal(
        id="signal-2",
        symbol="EURUSD",
        direction="NEUTRAL",
        timeframe="4H",
        confidence=58,
        rationale="The generated series is mixed; no actionable conclusion is implied.",
        createdAt=_NOW - timedelta(minutes=9),
    ),
    TradingSignal(
        id="signal-3",
        symbol="BTCUSD",
        direction="SHORT_BIAS",
        timeframe="1D",
        confidence=63,
        rationale="Example volatility pressure from simulated values; not a recommendation.",
        createdAt=_NOW - timedelta(minutes=17),
    ),
    TradingSignal(
        id="signal-4",
        symbol="NVDA",
        direction="LONG_BIAS",
        timeframe="1D",
        confidence=69,
        rationale="Sample momentum condition only; all prices are generated for demo mode.",
        createdAt=_NOW - timedelta(minutes=23),
    ),
]

_POSITIONS = [
    OpenPosition(
        id="position-demo-1",
        symbol="SPX",
        side="LONG",
        quantity=0.8,
        entryPrice=5238.4,
        markPrice=5271.8,
        pnl=26.72,
        openedAt=_NOW - timedelta(hours=3, minutes=20),
    ),
    OpenPosition(
        id="position-demo-2",
        symbol="EURUSD",
        side="SHORT",
        quantity=12000,
        entryPrice=1.0872,
        markPrice=1.0844,
        pnl=33.6,
        openedAt=_NOW - timedelta(hours=1, minutes=45),
    ),
]

_STRATEGIES = [
    TradingStrategy(
        id="trend-pullback",
        name="Trend Pullback",
        description="Illustrative pullback rules with a volatility filter.",
        status="PAPER",
        symbols=["SPX", "NVDA"],
        winRate=58.4,
        profitFactor=1.42,
        maxDrawdown=6.8,
        tradesCount=124,
    ),
    TradingStrategy(
        id="range-reversion",
        name="Range Reversion",
        description="Example mean-reversion rules for range-bound conditions.",
        status="RESEARCH",
        symbols=["EURUSD", "AAPL"],
        winRate=54.1,
        profitFactor=1.18,
        maxDrawdown=8.2,
        tradesCount=86,
    ),
    TradingStrategy(
        id="volatility-breakout",
        name="Volatility Breakout",
        description="A sample breakout hypothesis with a strict risk budget.",
        status="PAUSED",
        symbols=["BTCUSD", "SPX"],
        winRate=49.7,
        profitFactor=1.26,
        maxDrawdown=11.4,
        tradesCount=203,
    ),
]

_TRADES = [
    TradeRecord(
        id="demo-trade-001",
        symbol="SPX",
        side="LONG",
        quantity=0.5,
        entryPrice=5211.4,
        exitPrice=5230.2,
        pnl=9.4,
        openedAt=_NOW - timedelta(days=1, hours=3),
        closedAt=_NOW - timedelta(days=1, hours=1),
        result="WIN",
    ),
    TradeRecord(
        id="demo-trade-002",
        symbol="EURUSD",
        side="SHORT",
        quantity=8000,
        entryPrice=1.0901,
        exitPrice=1.0915,
        pnl=-11.2,
        openedAt=_NOW - timedelta(days=2, hours=5),
        closedAt=_NOW - timedelta(days=2, hours=2),
        result="LOSS",
    ),
    TradeRecord(
        id="demo-trade-003",
        symbol="NVDA",
        side="LONG",
        quantity=3,
        entryPrice=120.2,
        exitPrice=123.6,
        pnl=10.2,
        openedAt=_NOW - timedelta(days=3, hours=4),
        closedAt=_NOW - timedelta(days=3, hours=1),
        result="WIN",
    ),
    TradeRecord(
        id="demo-trade-004",
        symbol="BTCUSD",
        side="SHORT",
        quantity=0.02,
        entryPrice=68_200,
        exitPrice=67_940,
        pnl=5.2,
        openedAt=_NOW - timedelta(days=4, hours=6),
        closedAt=_NOW - timedelta(days=4, hours=4),
        result="WIN",
    ),
]


class DemoTradingService:
    """Deterministic demo responses; never accesses a broker or live data source."""

    def __init__(self) -> None:
        self._risk_settings = RiskSettings(
            riskPerTradePercent=0.5,
            dailyLossLimitPercent=2.0,
            maxDrawdownPercent=8.0,
            maxOpenPositions=4,
            executionEnabled=False,
        )

    def get_dashboard(self) -> DashboardSnapshot:
        balance = 100_000.0
        curve = [
            EquityPoint(
                timestamp=_NOW - timedelta(days=(29 - index)),
                value=balance + (index * 24.7) + (math.sin(index / 2.7) * 460),
            )
            for index in range(30)
        ]
        return DashboardSnapshot(
            updatedAt=_NOW,
            account=AccountSnapshot(
                currency="USD",
                balance=balance,
                equity=100_060.32,
                dayPnl=142.18,
                dayPnlPercent=0.14,
                openPositions=len(_POSITIONS),
                riskUsedPercent=31.5,
            ),
            equityCurve=curve,
            positions=_POSITIONS,
            signals=_SIGNALS,
        )

    def get_agents(self) -> list[TradingAgent]:
        return AGENTS

    def get_signals(self) -> list[TradingSignal]:
        return _SIGNALS

    def get_collaboration(self) -> list[AgentMessage]:
        return COLLABORATION

    def get_strategies(self) -> list[TradingStrategy]:
        return _STRATEGIES

    def get_trades(self) -> list[TradeRecord]:
        return _TRADES

    def get_market(self, symbol: str, interval: str) -> MarketSnapshot:
        instrument = _SYMBOLS.get(symbol.upper())
        if instrument is None:
            raise KeyError(symbol)

        name, base_price = instrument
        seed = f"{symbol.upper()}:{interval}".encode("utf-8")
        rng = random.Random(int(hashlib.sha256(seed).hexdigest()[:8], 16))
        step = {"1D": timedelta(hours=1), "1W": timedelta(hours=4), "1M": timedelta(days=1)}[
            interval
        ]
        current = base_price
        candles: list[MarketCandle] = []
        for index in range(48):
            drift = math.sin(index / 4.0) * base_price * 0.0012
            movement = rng.uniform(-0.0018, 0.0018) * base_price
            open_price = current
            close_price = max(base_price * 0.75, open_price + drift + movement)
            high_price = max(open_price, close_price) + rng.uniform(0.0002, 0.0012) * base_price
            low_price = min(open_price, close_price) - rng.uniform(0.0002, 0.0012) * base_price
            candles.append(
                MarketCandle(
                    timestamp=_NOW - step * (47 - index),
                    open=round(open_price, 5),
                    high=round(high_price, 5),
                    low=round(low_price, 5),
                    close=round(close_price, 5),
                )
            )
            current = close_price

        last_close = candles[-1].close
        return MarketSnapshot(
            symbol=symbol.upper(),
            name=name,
            interval=interval,
            candles=candles,
            indicators=[
                MarketIndicator(name="EMA 20", value=round(last_close * 0.997, 5), unit="price"),
                MarketIndicator(name="RSI 14", value=round(48 + rng.random() * 18, 1), unit="index"),
                MarketIndicator(
                    name="ATR 14",
                    value=round(base_price * 0.006, 5),
                    unit="price",
                ),
            ],
        )

    def run_backtest(self, request: BacktestInput) -> BacktestResult:
        if request.strategyId not in {strategy.id for strategy in _STRATEGIES}:
            raise KeyError(request.strategyId)
        if request.symbol.upper() not in _SYMBOLS:
            raise KeyError(request.symbol)

        key = f"{request.strategyId}:{request.symbol}:{request.interval}".encode("utf-8")
        digest = hashlib.sha256(key).digest()
        net_return = 2.0 + (digest[0] / 255) * 11.0
        win_rate = 43.0 + (digest[1] / 255) * 22.0
        max_drawdown = 2.0 + (digest[2] / 255) * 9.0
        curve = [
            EquityPoint(
                timestamp=_NOW - timedelta(days=(23 - index)),
                value=round(
                    request.startingCapital
                    * (1 + (net_return / 100) * index / 23)
                    * (1 + math.sin(index / 2.6) * 0.002),
                    2,
                ),
            )
            for index in range(24)
        ]
        return BacktestResult(
            strategyId=request.strategyId,
            symbol=request.symbol.upper(),
            netReturnPercent=round(net_return, 2),
            winRate=round(win_rate, 1),
            maxDrawdownPercent=round(max_drawdown, 2),
            tradesCount=34 + digest[3] % 90,
            equityCurve=curve,
        )

    def get_risk_settings(self) -> RiskSettings:
        return self._risk_settings

    def update_risk_settings(self, settings: RiskSettingsInput) -> RiskSettings:
        self._risk_settings = RiskSettings(
            **settings.model_dump(),
            executionEnabled=False,
        )
        return self._risk_settings

    def get_system_status(self) -> SystemStatus:
        return SystemStatus(
            integrations=[
                IntegrationStatus(
                    name="Python API",
                    status="READY",
                    note="Serving simulated demo responses.",
                ),
                IntegrationStatus(
                    name="PostgreSQL",
                    status="NOT_CONFIGURED",
                    note="A repository interface is scaffolded; demo records are in memory.",
                ),
                IntegrationStatus(
                    name="LangGraph",
                    status="PLANNED",
                    note="Optional agent orchestration package is not installed or active.",
                ),
                IntegrationStatus(
                    name="XGBoost",
                    status="PLANNED",
                    note="Optional research dependency; no trained model is included.",
                ),
                IntegrationStatus(
                    name="PyTorch",
                    status="PLANNED",
                    note="Optional research dependency; no trained model is included.",
                ),
                IntegrationStatus(
                    name="MetaTrader 5",
                    status="NOT_CONFIGURED",
                    note="No broker connection exists; order execution is disabled.",
                ),
            ],
        )


demo_trading_service = DemoTradingService()
