from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent

@dataclass(frozen=True)
class ComputeOption:
    name: str
    hourly_cost: float
    expected_task_value_per_hour: float
    reliability: float

OPTIONS = [
    ComputeOption("CPU-local", 0.05, 0.40, 0.98),
    ComputeOption("GPU-cloud-A", 0.40, 2.50, 0.97),
    ComputeOption("GPU-cloud-B", 0.25, 1.40, 0.93),
]

# Synthetic economics only. No provider is booked and no cloud spend occurs.
def score(x: ComputeOption) -> dict:
    expected_value = x.expected_task_value_per_hour * x.reliability
    net = expected_value - x.hourly_cost
    roi = net / x.hourly_cost if x.hourly_cost else 0.0
    return {**asdict(x), "expected_value": round(expected_value, 4), "net_per_hour": round(net, 4), "roi": round(roi, 4)}

def main() -> None:
    ranked = sorted((score(x) for x in OPTIONS), key=lambda r: (r["net_per_hour"], r["roi"]), reverse=True)
    report = {"stage": "compute-arbitrage-sandbox", "mode": "synthetic", "options": ranked, "winner": ranked[0]["name"]}
    (ROOT / "compute_arbitrage_results.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
