"""Exercise the actual CLI against a fresh temporary database, never the local DB."""
from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import subprocess
import sys

from sqlalchemy import MetaData, Table, inspect, select, text
from app.database import create_engine_for_url


def test_scoping_migrations_preserve_legacy_jobs_and_admin_cli_is_repeatable(tmp_path):
    url = "sqlite:///" + (tmp_path / "migration.sqlite3").as_posix()
    env = {**os.environ, "APP_ENV": "test", "DATABASE_URL": url, "TEST_DATABASE_URL": url}
    root = Path(__file__).resolve().parents[1]

    def command(*args):
        result = subprocess.run([sys.executable, "-m", *args], cwd=root, env=env,
                                capture_output=True, text=True, timeout=60)
        assert result.returncode == 0, result.stderr
        return result.stdout

    command("alembic", "upgrade", "0010_harden_ledger_idempotency")
    engine = create_engine_for_url(url)
    try:
        jobs = Table("jobs", MetaData(), autoload_with=engine)
        now = datetime.now(timezone.utc)
        with engine.begin() as connection:
            connection.execute(jobs.insert().values(
                public_id="legacy-preserved", title="Existing local record", description="Synthetic migration fixture",
                budget=25, currency="USD", deadline=now + timedelta(days=1), status="open",
                required_skills=[], task_category="general", expected_output="Synthetic result",
                acceptance_criteria=[], requirements={}, created_at=now, updated_at=now,
            ))
        command("alembic", "upgrade", "head")
        command("alembic", "upgrade", "head")
        with engine.connect() as connection:
            assert connection.scalar(text("SELECT version_num FROM alembic_version")) == "0012_demo_sessions"
            row = connection.execute(text("SELECT title, demo_session_id FROM jobs WHERE public_id='legacy-preserved'")).one()
            assert tuple(row) == ("Existing local record", None)
        assert "mutations" in {column["name"] for column in inspect(engine).get_columns("demo_sessions")}
        assert "6 records affected" in command("app.demo_admin", "seed-agents", "--confirm-synthetic-database")
        assert "0 records affected" in command("app.demo_admin", "seed-agents", "--confirm-synthetic-database")
        assert "0 records affected" in command("app.demo_admin", "cleanup-expired", "--confirm-synthetic-database")
    finally:
        engine.dispose()
