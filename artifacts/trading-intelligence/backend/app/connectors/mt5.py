class MetaTrader5Connector:
    """Fail-closed placeholder for a future, separately reviewed MT5 adapter."""

    @property
    def configured(self) -> bool:
        return False

    def connect(self) -> None:
        raise RuntimeError(
            "MetaTrader 5 is not configured. Demo mode does not support broker connections."
        )

    def submit_order(self, *_args: object, **_kwargs: object) -> None:
        raise RuntimeError(
            "Order execution is disabled. No orders can be submitted from this application."
        )
