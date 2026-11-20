import sqlite3
import unittest
from pathlib import Path


class WorkerMigrationTests(unittest.TestCase):
    def test_initial_migration_creates_task_table_and_status_index(self):
        migration = Path(__file__).parents[1] / "migrations" / "0001_init.sql"
        sql = migration.read_text(encoding="utf-8")

        connection = sqlite3.connect(":memory:")
        try:
            connection.executescript(sql)
            columns = {
                row[1]
                for row in connection.execute("PRAGMA table_info(tasks)").fetchall()
            }
            self.assertTrue(
                {"id", "task_text", "status", "result", "error", "created_at", "updated_at"}
                .issubset(columns)
            )
            indexes = {
                row[1]
                for row in connection.execute("PRAGMA index_list(tasks)").fetchall()
            }
            self.assertIn("idx_tasks_status_created_at", indexes)
        finally:
            connection.close()


if __name__ == "__main__":
    unittest.main()
