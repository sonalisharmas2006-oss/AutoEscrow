"""Disposable, migrated synthetic backend for browser QA. Never opens the local DB."""
import os
from pathlib import Path
import secrets
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def main():
    import uvicorn
    from alembic.config import Config
    from alembic import command
    with tempfile.TemporaryDirectory(prefix="autoescrow-e2e-") as temporary:
        os.environ["APP_ENV"] = "test"
        url = "sqlite:///" + str(Path(temporary) / "demo.sqlite3").replace("\\", "/")
        os.environ["DATABASE_URL"] = url
        os.environ["TEST_DATABASE_URL"] = url
        os.environ["FRONTEND_ORIGIN"] = "http://localhost:3011,http://127.0.0.1:3011"
        os.environ["DEMO_SESSION_SECRET"] = secrets.token_urlsafe(48)
        os.environ["DEMO_PUBLIC_ACCESS"] = "true"
        os.environ["DEMO_RATE_LIMIT_PER_MINUTE"] = "3000"
        command.upgrade(Config("alembic.ini"), "head")
        from app.seed import seed_demo_data
        seed_demo_data(with_jobs=True)
        os.environ["APP_ENV"] = "production"
        from app.config import get_settings
        get_settings.cache_clear()
        from app.main import app
        uvicorn.run(app, host="127.0.0.1", port=8011, access_log=False)


if __name__ == "__main__":
    main()
