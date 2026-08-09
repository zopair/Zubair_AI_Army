from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent

@dataclass(frozen=True)
class Gate:
    name: str
    required: bool
    passed: bool
    evidence: str

GATES = [
    Gate("real lawful demand source identified", True, False, "Pending explicit marketplace/customer source"),
    Gate("sandbox benchmark reproducible", True, True, "Stage 2/3 harness committed"),
    Gate("measurable runtime and cost telemetry", True, True, "Telemetry schema defined; live values pending"),
    Gate("isolated execution", True, True, "Sandbox architecture; live runner not yet promoted"),
    Gate("budget cap and stop conditions", True, True, "Promotion policy requires both"),
    Gate("secrets excluded from source control", True, True, "No credentials committed"),
]

# Deliberately defaults to BLOCKED. No live money, wallet, exchange, mining,
# or paid API integration is activated by this file.
def main() -> None:
    passed = all(g.passed for g in GATES if g.required)
    report = {
        "stage": "4-live-gate",
        "status": "READY_FOR_REVIEW" if passed else "BLOCKED",
        "execution": "NO_LIVE_SIDE_EFFECTS",
        "gates": [asdict(g) for g in GATES],
        "required_next_evidence": [g.evidence for g in GATES if g.required and not g.passed],
    }
    (ROOT / "stage4_gate.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
