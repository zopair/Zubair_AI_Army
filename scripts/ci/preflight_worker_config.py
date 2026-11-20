#!/usr/bin/env python3
"""Validate the Personal Agent Worker's Wrangler configuration before deployment."""
from __future__ import annotations

import argparse
import re
import sys
import tomllib
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = ROOT / "personal-agent" / "worker" / "wrangler.toml"
SECRET_NAMES = {"API_TOKEN", "GITHUB_TOKEN"}
REPOSITORY_PATTERN = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


def validate_config(
    config: dict[str, Any],
    config_path: Path,
    *,
    allow_placeholders: bool = False,
) -> list[str]:
    errors: list[str] = []

    if not isinstance(config.get("name"), str) or not config["name"].strip():
        errors.append("Worker name is missing.")
    main_file = config.get("main")
    if not isinstance(main_file, str) or not main_file.strip():
        errors.append("Worker entrypoint (main) is missing.")
    elif not (config_path.parent / main_file).is_file():
        errors.append(f"Worker entrypoint does not exist: {main_file}")

    databases = config.get("d1_databases")
    if not isinstance(databases, list):
        databases = []
    db_bindings = [item for item in databases if isinstance(item, dict) and item.get("binding") == "DB"]
    if len(db_bindings) != 1:
        errors.append("Exactly one D1 database binding named DB is required.")
    else:
        database = db_bindings[0]
        database_id = database.get("database_id")
        if not isinstance(database_id, str) or not database_id.strip():
            errors.append("D1 database_id is missing.")
        elif "REPLACE_WITH" in database_id or "PLACEHOLDER" in database_id.upper():
            if not allow_placeholders:
                errors.append("D1 database_id is still a placeholder; configure the real database ID before deployment.")
        else:
            try:
                import uuid
                uuid.UUID(database_id)
            except (ValueError, AttributeError):
                errors.append("D1 database_id must be a valid UUID.")
        migrations_dir = database.get("migrations_dir", "migrations")
        if not isinstance(migrations_dir, str) or not (config_path.parent / migrations_dir).is_dir():
            errors.append(f"D1 migrations directory does not exist: {migrations_dir}")

    queues = config.get("queues")
    if not isinstance(queues, dict):
        queues = {}
    producers = queues.get("producers")
    consumers = queues.get("consumers")
    producers = producers if isinstance(producers, list) else []
    consumers = consumers if isinstance(consumers, list) else []
    task_producers = [
        item for item in producers
        if isinstance(item, dict) and item.get("binding") == "TASK_QUEUE"
    ]
    if len(task_producers) != 1 or not isinstance(task_producers[0].get("queue"), str):
        errors.append("Exactly one TASK_QUEUE producer with a queue name is required.")
    elif not any(
        isinstance(item, dict) and item.get("queue") == task_producers[0]["queue"]
        for item in consumers
    ):
        errors.append("TASK_QUEUE producer does not match a configured Queue consumer.")

    variables = config.get("vars")
    variables = variables if isinstance(variables, dict) else {}
    for secret_name in sorted(SECRET_NAMES.intersection(variables)):
        errors.append(f"{secret_name} must be configured as a Worker secret, not under [vars].")

    repository = variables.get("GITHUB_REPOSITORY")
    if not isinstance(repository, str) or not REPOSITORY_PATTERN.fullmatch(repository):
        errors.append("GITHUB_REPOSITORY must use owner/repository format.")

    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument(
        "--allow-placeholders",
        action="store_true",
        help="Validate the checked-in template without claiming it is deployable.",
    )
    args = parser.parse_args(argv)

    try:
        with args.config.open("rb") as handle:
            config = tomllib.load(handle)
    except (OSError, tomllib.TOMLDecodeError) as exc:
        print(f"ERROR: Unable to read Wrangler config: {exc}", file=sys.stderr)
        return 1

    errors = validate_config(config, args.config.resolve(), allow_placeholders=args.allow_placeholders)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(f"Worker configuration structure is valid: {args.config}")
    print("Required runtime secrets: API_TOKEN and GITHUB_TOKEN (configure using wrangler secret put).")
    if args.allow_placeholders:
        print("Template mode only: this result does not authorize deployment.")
    else:
        print("Deployment preflight passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
