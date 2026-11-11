from fastapi import FastAPI

from app.api.router import router
from app.core.settings import settings
from app.domain.schemas import HealthStatus


# AI MULTI-AGENT TRADING SYSTEM
# Version 0.1
class Agent:
    def __init__(self, name: str, role: str) -> None:
        self.name = name
        self.role = role

    def analyze(self) -> str:
        return f"{self.name}: {self.role}"


agents = [
    Agent("MarketAgent", "Market analysis"),
    Agent("TrendAgent", "Trend detection"),
    Agent("RiskAgent", "Risk management"),
    Agent("CriticAgent", "Signal verification"),
]


def print_agent_initialization() -> None:
    print("AI MULTI-AGENT TRADING SYSTEM")
    print("--------------------------------")
    for agent in agents:
        print(agent.analyze())
    print("--------------------------------")
    print("System initialized successfully.")

app = FastAPI(
    title="AI Trading Intelligence Demo API",
    description=(
        "Demo-only API. Market data and trade records are simulated; "
        "this service cannot execute trades."
    ),
    version="0.1.0",
    docs_url="/api/trading/docs",
    openapi_url="/api/trading/openapi.json",
)
app.include_router(router, prefix="/api/trading")


@app.get("/", response_model=HealthStatus, include_in_schema=False)
def service_root() -> HealthStatus:
    return HealthStatus()


@app.on_event("startup")
def enforce_demo_boundary() -> None:
    if not settings.demo_mode or settings.trading_execution_enabled:
        raise RuntimeError(
            "This build requires DEMO_MODE=true and TRADING_EXECUTION_ENABLED=false."
        )
    print_agent_initialization()
