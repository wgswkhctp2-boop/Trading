from typing import Protocol

from app.domain.schemas import MarketSnapshot, RiskSettings, RiskSettingsInput


class MarketDataProvider(Protocol):
    def get_snapshot(self, symbol: str, interval: str) -> MarketSnapshot: ...


class RiskSettingsRepository(Protocol):
    def get(self) -> RiskSettings: ...

    def save(self, settings: RiskSettingsInput) -> RiskSettings: ...


class StrategyRunner(Protocol):
    def run(self, strategy_id: str, symbol: str, interval: str, starting_capital: float): ...
