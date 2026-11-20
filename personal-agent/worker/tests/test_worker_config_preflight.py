import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts" / "ci"))

from preflight_worker_config import validate_config


class WorkerConfigPreflightTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.config_path = Path(self.temp_dir.name) / "wrangler.toml"
        (Path(self.temp_dir.name) / "migrations").mkdir()
        (Path(self.temp_dir.name) / "src").mkdir()
        (Path(self.temp_dir.name) / "src" / "index.ts").write_text("export default {};", encoding="utf-8")
        self.config = {
            "name": "personal-ai-agent-engine",
            "main": "src/index.ts",
            "compatibility_date": "2026-10-30",
            "d1_databases": [{
                "binding": "DB",
                "database_name": "personal-agent-db",
                "database_id": "REPLACE_WITH_D1_DATABASE_ID",
                "migrations_dir": "migrations",
            }],
            "queues": {
                "producers": [{
                    "binding": "TASK_QUEUE",
                    "queue": "personal-agent-tasks",
                }],
                "consumers": [{
                    "queue": "personal-agent-tasks",
                    "max_retries": 3,
                }],
            },
            "triggers": {"crons": ["*/5 * * * *"]},
            "vars": {
                "GITHUB_REPOSITORY": "zopair/Zubair_AI_Army",
            },
        }

    def test_template_mode_accepts_documented_d1_placeholder(self):
        self.assertEqual(
            validate_config(self.config, self.config_path, allow_placeholders=True),
            [],
        )

    def test_deployment_mode_rejects_d1_placeholder(self):
        errors = validate_config(self.config, self.config_path)
        self.assertTrue(any("database_id is still a placeholder" in error for error in errors))

    def test_deployment_config_passes_when_database_id_is_configured(self):
        self.config["d1_databases"][0]["database_id"] = "12345678-1234-1234-1234-123456789012"
        self.assertEqual(validate_config(self.config, self.config_path), [])

    def test_rejects_secrets_in_plaintext_vars(self):
        self.config["vars"]["API_TOKEN"] = "do-not-commit"
        errors = validate_config(self.config, self.config_path, allow_placeholders=True)
        self.assertTrue(any("must be configured as a Worker secret" in error for error in errors))

    def test_rejects_queue_producer_consumer_mismatch(self):
        self.config["queues"]["consumers"][0]["queue"] = "wrong-queue"
        errors = validate_config(self.config, self.config_path, allow_placeholders=True)
        self.assertTrue(any("TASK_QUEUE producer does not match" in error for error in errors))

    def test_rejects_missing_migrations_directory(self):
        self.config["d1_databases"][0]["migrations_dir"] = "missing"
        errors = validate_config(self.config, self.config_path, allow_placeholders=True)
        self.assertTrue(any("migrations directory does not exist" in error for error in errors))

    def test_rejects_missing_recovery_cron(self):
        self.config["triggers"]["crons"] = []
        errors = validate_config(self.config, self.config_path, allow_placeholders=True)
        self.assertTrue(any("Cron Trigger is required" in error for error in errors))

    def test_rejects_invalid_repository_reference(self):
        self.config["vars"]["GITHUB_REPOSITORY"] = "not-a-repository"
        errors = validate_config(self.config, self.config_path, allow_placeholders=True)
        self.assertTrue(any("GITHUB_REPOSITORY must use owner/repository format" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
