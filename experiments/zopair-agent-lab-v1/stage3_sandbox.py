from __future__ import annotations

import json
import math
import platform
import time
from dataclasses import dataclass, asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent

@dataclass(frozen=True)
class Offer:
    id: str
    task: str
    gross_revenue: float
    api_cost: float
    compute_cost: float
    platform_fee: float
    probability_of_success: float
    max_runtime_minutes: int

OFFERS = [
    Offer("O1", "QA test report", 18.0, 0.40, 0.30, 0.0, 0.92, 45),
    Offer("O2", "structured research brief", 35.0, 0.90, 1.10, 0.0, 0.78, 90),
    Offer("O3", "small code maintenance task", 60.0, 1.50, 2.00, 0.05, 0.70, 120),
    Offer("O4", "data cleanup", 24.0, 0.50, 0.60, 0.02, 0.88, 60),
]

# These are synthetic offers for sandbox decision-making. They are NOT real revenue.
def expected_net(offer: Offer) -> float:
    cost = offer.api_cost + offer.compute_cost + offer.platform_fee * offer.gross_revenue
    return offer.probability_of_success * (offer.gross_revenue - cost)


def score(offer: Offer) -> dict:
    net = expected_net(offer)
    cost = offer.api_cost + offer.compute_cost + offer.platform_fee * offer.gross_revenue
    roi = (net / cost) if cost else math.inf
    return {**asdict(offer), "expected_net": round(net, 4), "expected_roi": round(roi, 4), "cost": round(cost, 4)}


def main() -> None:
    ranked = sorted((score(o) for o in OFFERS), key=lambda x: (x["expected_net"], x["expected_roi"]), reverse=True)
    report = {
        "lab": "Zopair Agent Lab v1",
        "stage": "3-revenue-sandbox",
        "mode": "synthetic, deterministic, offline",
        "safety": "No live marketplace, trading, mining, purchases, wallet signing, or paid APIs",
        "host": platform.platform(),
        "python": platform.python_version(),
        "created_at_epoch": time.time(),
        "offers": ranked,
        "winner": ranked[0]["id"],
        "promotion_rule": "Sandbox ranking is not evidence of real revenue. A live test requires explicit sandbox-to-live promotion and budget limits.",
    }
    out = ROOT / "stage3_sandbox_results.json"
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
