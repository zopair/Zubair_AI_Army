from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# A scorecard, not a fabricated benchmark result. Live scores remain null until
# each candidate actually executes the same task under measured conditions.
CANDIDATES = ["OpenHands", "Agent Zero", "CrewAI"]
DIMENSIONS = {
    "task_completion": 0.30,
    "cost_efficiency": 0.20,
    "reliability": 0.20,
    "automation_depth": 0.15,
    "scalability": 0.10,
    "observability": 0.05,
}

report = {
    "stage": "agent-scorecard",
    "status": "AWAITING_MEASURED_RUNS",
    "weights": DIMENSIONS,
    "candidates": [
        {"name": name, "scores": {k: None for k in DIMENSIONS}, "weighted_total": None}
        for name in CANDIDATES
    ],
    "rule": "Never substitute popularity, stars, or synthetic revenue for measured task performance.",
}
(ROOT / "agent_scorecard.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))
