from __future__ import annotations

import json
import os
import platform
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Stage 2 is a deterministic, offline benchmark harness. It does not trade, mine,
# spend funds, sign wallets, or call paid APIs. It evaluates candidate frameworks
# using the same synthetic revenue task so later live tests can be compared fairly.
CANDIDATES = [
    {"name": "OpenHands", "repo": "OpenHands/OpenHands", "role": "software-agent"},
    {"name": "Agent Zero", "repo": "agent0ai/agent-zero", "role": "general-agent"},
    {"name": "CrewAI", "repo": "crewAIInc/crewAI", "role": "multi-agent-orchestration"},
]

TASKS = [
    "discover a legal digital service opportunity",
    "estimate inputs, operating cost, and expected revenue",
    "produce a reproducible execution plan",
    "identify failure modes and stop conditions",
]


def probe(command: list[str]) -> dict:
    started = time.perf_counter()
    try:
        p = subprocess.run(command, capture_output=True, text=True, timeout=20)
        return {"ok": p.returncode == 0, "seconds": round(time.perf_counter() - started, 3), "output": (p.stdout + p.stderr)[-1500:]}
    except Exception as exc:
        return {"ok": False, "seconds": round(time.perf_counter() - started, 3), "output": str(exc)}


def score_template(candidate: dict) -> dict:
    # No fabricated performance numbers: these are dimensions and weights only.
    dimensions = {
        "task_completion": 30,
        "cost_efficiency": 20,
        "reliability": 20,
        "automation_depth": 15,
        "scalability": 10,
        "observability": 5,
    }
    return {"candidate": candidate["name"], "repo": candidate["repo"], "role": candidate["role"], "task_count": len(TASKS), "dimensions": dimensions}


def main() -> None:
    report = {
        "lab": "Zopair Agent Lab v1",
        "stage": "2-controlled-benchmark-definition",
        "mode": "offline/deterministic harness",
        "safety": "No trading, mining, purchases, wallet signing, paid APIs, or external side effects",
        "host": platform.platform(),
        "python": platform.python_version(),
        "candidates": [score_template(c) for c in CANDIDATES],
        "tasks": TASKS,
        "runtime_probes": {"git": probe(["git", "--version"]), "python": probe(["python", "--version"])},
        "measurement_rule": "Only measured runtime/revenue results may be scored; no simulated revenue is reported as real.",
    }
    out = ROOT / "stage2_benchmark_definition.json"
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
