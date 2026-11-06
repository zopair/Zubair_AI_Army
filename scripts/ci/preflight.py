#!/usr/bin/env python3
"""Dependency-free repository preflight checks for GitHub Actions."""
from __future__ import annotations

import compileall
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXCLUDED = {".git", ".venv", "venv", "node_modules", "__pycache__", ".next", "dist", "build"}

def files_with_suffix(suffix: str):
    for path in ROOT.rglob(f"*{suffix}"):
        if any(part in EXCLUDED for part in path.parts):
            continue
        yield path

def main() -> int:
    errors: list[str] = []
    json_files = list(files_with_suffix(".json"))
    for path in json_files:
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            errors.append(f"Invalid JSON: {path.relative_to(ROOT)} ({exc})")

    python_files = list(files_with_suffix(".py"))
    if python_files and not compileall.compile_dir(
        str(ROOT), quiet=1, force=True,
        rx=re.compile(r"/(" + "|".join(map(re.escape, EXCLUDED)) + r")(/|$)"),
    ):
        errors.append("Python byte-compilation failed.")

    manifests = list(files_with_suffix("package.json"))
    print(f"JSON files validated: {len(json_files)}")
    print(f"Python files discovered: {len(python_files)}")
    print(f"JavaScript/TypeScript package manifests discovered: {len(manifests)}")
    if not manifests:
        print("NOTICE: No package.json found; JS/TS typecheck, tests, and build are not claimed by this baseline.")
    if not python_files:
        print("NOTICE: No Python source files found; Python compilation was skipped.")

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("Repository preflight passed.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
