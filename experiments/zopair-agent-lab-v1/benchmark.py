from __future__ import annotations

import json
import os
import platform
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent

CANDIDATES = {
    "openhands": "https://github.com/All-Hands-AI/OpenHands.git",
    "agent-zero": "https://github.com/agent0ai/agent-zero.git",
    "crewai": "https://github.com/crewAIInc/crewAI.git",
    "autogen": "https://github.com/microsoft/autogen.git",
    "langchain": "https://github.com/langchain-ai/langchain.git",
    "n8n": "https://github.com/n8n-io/n8n.git",
    "ccxt": "https://github.com/ccxt/ccxt.git",
    "hummingbot": "https://github.com/hummingbot/hummingbot.git",
}


def run(cmd: list[str], timeout: int = 90) -> tuple[int, float, str]:
    started = time.perf_counter()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, time.perf_counter() - started, (p.stdout + p.stderr)[-4000:]
    except subprocess.TimeoutExpired as exc:
        return 124, time.perf_counter() - started, f"TIMEOUT: {exc}"


def git_probe(name: str, url: str) -> dict:
    code, seconds, output = run(["git", "ls-remote", "--heads", url], timeout=45)
    return {
        "candidate": name,
        "git_probe_ok": code == 0,
        "probe_seconds": round(seconds, 3),
        "output_tail": output,
    }


def main() -> None:
    results = [git_probe(name, url) for name, url in CANDIDATES.items()]
    report = {
        "lab": "Zopair Agent Lab v1",
        "mode": "network/repository smoke probe",
        "host": platform.platform(),
        "python": platform.python_version(),
        "results": results,
    }
    out = ROOT / "results.json"
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
