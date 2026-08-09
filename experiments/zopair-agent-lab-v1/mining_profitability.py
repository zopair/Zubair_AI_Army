from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent

@dataclass(frozen=True)
class MiningScenario:
    name: str
    gross_per_day: float
    electricity_per_day: float
    hosting_per_day: float
    maintenance_per_day: float
    downtime_factor: float

SCENARIOS = [
    MiningScenario("efficient-asic", 12.0, 4.0, 1.0, 0.50, 0.97),
    MiningScenario("mid-asic", 8.0, 4.5, 1.0, 0.60, 0.95),
    MiningScenario("expensive-power", 8.0, 7.0, 1.0, 0.60, 0.95),
]

# Synthetic stress-test only. It deliberately does not query or purchase hashrate.
def evaluate(x: MiningScenario) -> dict:
    realized = x.gross_per_day * x.downtime_factor
    cost = x.electricity_per_day + x.hosting_per_day + x.maintenance_per_day
    net = realized - cost
    return {**asdict(x), "realized_gross": round(realized, 4), "daily_cost": round(cost, 4), "net_per_day": round(net, 4), "profitable": net > 0}

def main() -> None:
    rows = [evaluate(x) for x in SCENARIOS]
    report = {"stage": "mining-profitability-sandbox", "mode": "synthetic", "rows": rows, "rule": "Live mining is blocked until real-time profitability, fees, electricity and risk are independently verified."}
    (ROOT / "mining_profitability_results.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
