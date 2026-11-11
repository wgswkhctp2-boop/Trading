from datetime import UTC, datetime, timedelta

from app.domain.schemas import AgentMessage, TradingAgent

_NOW = datetime.now(UTC)

AGENTS = [
    TradingAgent(
        id="master",
        name="Master Agent",
        specialty="Coordination and decision synthesis",
        status="ANALYZING",
        confidence=82,
        summary="Collects specialist notes and keeps the demo decision trail coherent.",
        lastRun=_NOW - timedelta(seconds=18),
    ),
    TradingAgent(
        id="market-analyst",
        name="Market Analyst",
        specialty="Market structure",
        status="MONITORING",
        confidence=76,
        summary="Reviews the sample price series and volatility context.",
        lastRun=_NOW - timedelta(minutes=2),
    ),
    TradingAgent(
        id="trend-hunter",
        name="Trend Hunter",
        specialty="Momentum and reversals",
        status="ANALYZING",
        confidence=71,
        summary="Tracks demo momentum conditions across the selected instruments.",
        lastRun=_NOW - timedelta(minutes=1),
    ),
    TradingAgent(
        id="pattern-hunter",
        name="Pattern Hunter",
        specialty="Technical patterns",
        status="MONITORING",
        confidence=68,
        summary="Checks example candles for illustrative patterns.",
        lastRun=_NOW - timedelta(minutes=4),
    ),
    TradingAgent(
        id="volatility-analyst",
        name="Volatility Analyst",
        specialty="Volatility regimes",
        status="MONITORING",
        confidence=79,
        summary="Summarizes simulated range and volatility changes.",
        lastRun=_NOW - timedelta(minutes=3),
    ),
    TradingAgent(
        id="strategy-researcher",
        name="Strategy Researcher",
        specialty="Strategy experiments",
        status="IDLE",
        confidence=64,
        summary="Maintains sample strategies for the demo backtest flow.",
        lastRun=_NOW - timedelta(minutes=8),
    ),
    TradingAgent(
        id="risk-manager",
        name="Risk Manager",
        specialty="Exposure and guardrails",
        status="MONITORING",
        confidence=96,
        summary="Checks demo limits; all real execution remains disabled.",
        lastRun=_NOW - timedelta(seconds=44),
    ),
    TradingAgent(
        id="critic",
        name="Critic Agent",
        specialty="Contradiction checks",
        status="ANALYZING",
        confidence=88,
        summary="Surfaces uncertainty and counterarguments in the sample discussion.",
        lastRun=_NOW - timedelta(seconds=31),
    ),
]

COLLABORATION = [
    AgentMessage(
        id="message-1",
        agentId="market-analyst",
        agentName="Market Analyst",
        message="The sample index series is holding above its short-term reference average.",
        sentiment="SUPPORT",
        createdAt=_NOW - timedelta(minutes=4),
    ),
    AgentMessage(
        id="message-2",
        agentId="volatility-analyst",
        agentName="Volatility Analyst",
        message="Range expansion in the demo candles raises uncertainty; reduce confidence.",
        sentiment="CAUTION",
        createdAt=_NOW - timedelta(minutes=3),
    ),
    AgentMessage(
        id="message-3",
        agentId="trend-hunter",
        agentName="Trend Hunter",
        message="Momentum remains positive in this simulated snapshot, but is not confirmation.",
        sentiment="SUPPORT",
        createdAt=_NOW - timedelta(minutes=2),
    ),
    AgentMessage(
        id="message-4",
        agentId="critic",
        agentName="Critic Agent",
        message="The sample series is too short to establish a reliable edge or forecast.",
        sentiment="CAUTION",
        createdAt=_NOW - timedelta(minutes=1),
    ),
    AgentMessage(
        id="message-5",
        agentId="risk-manager",
        agentName="Risk Manager",
        message="Guardrails are shown for research only; the demo cannot place or route orders.",
        sentiment="NEUTRAL",
        createdAt=_NOW - timedelta(seconds=40),
    ),
]
