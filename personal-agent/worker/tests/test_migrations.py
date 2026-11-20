import sqlite3
import unittest
from pathlib import Path


class WorkerMigrationTests(unittest.TestCase):
    def test_all_migrations_create_task_table_and_operation_column(self):
        migration_dir = Path(__file__).parents[1] / "migrations"
        migrations = sorted(migration_dir.glob("*.sql"))

        connection = sqlite3.connect(":memory:")
        try:
            for migration in migrations:
                connection.executescript(migration.read_text(encoding="utf-8"))

            columns = {
                row[1]
                for row in connection.execute("PRAGMA table_info(tasks)").fetchall()
            }
            self.assertTrue(
                {
                    "id", "task_text", "operation", "status",
                    "result", "error", "created_at", "updated_at"
                }.issubset(columns)
            )
            indexes = {
                row[1]
                for row in connection.execute("PRAGMA index_list(tasks)").fetchall()
            }
            self.assertIn("idx_tasks_status_created_at", indexes)
            self.assertIn("idx_tasks_operation_created_at", indexes)
        finally:
            connection.close()


if __name__ == "__main__":
    unittest.main()
