"""Explicit operator maintenance. No automatic startup seeds or data deletion."""
import argparse
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Agent, DemoSessionRecord
from app.seed import DEMO_AGENTS
from app.services.demo_sessions import delete_demo_jobs


def seed_agents(db: Session) -> int:
    count = 0
    for values in DEMO_AGENTS:
        existing = db.scalar(select(Agent).where(Agent.external_id == values["external_id"]))
        if existing:
            if (existing.metadata_json or {}).get("synthetic") is not True:
                raise RuntimeError("A seed identifier belongs to a non-synthetic profile; refusing to overwrite")
            continue
        db.add(Agent(**values))
        count += 1
    db.commit()
    return count


def cleanup(db: Session) -> int:
    records = list(db.scalars(select(DemoSessionRecord).where(DemoSessionRecord.expires_at <= datetime.now(timezone.utc))))
    for record in records:
        delete_demo_jobs(db, record.id)
        db.delete(record)
    db.commit()
    return len(records)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["seed-agents", "cleanup-expired"])
    parser.add_argument("--confirm-synthetic-database", action="store_true", required=True)
    args = parser.parse_args()
    with SessionLocal() as db:
        count = seed_agents(db) if args.action == "seed-agents" else cleanup(db)
    print(f"{args.action}: {count} records affected")


if __name__ == "__main__":
    main()
