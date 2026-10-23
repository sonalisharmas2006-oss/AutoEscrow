"""Deterministic, idempotent demo data loader.

Run after applying Alembic migrations with ``python -m app.seed``.  Add
``--with-jobs`` to include two consistent synthetic jobs.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.config import get_settings
from app.models import Agent, Job
from app.schemas import AgreementCreate, EscrowFundRequest, SubmissionCreate
from app.services.agreements import accept_agreement, create_agreement, get_job_agreement
from app.services.audit import record_event
from app.services.escrow import fund_escrow, get_job_escrow, release_escrow
from app.services.execution import start_execution
from app.services.submissions import create_submission
from app.services.verification import latest_verification, verify_latest_submission

DEMO_AGENTS = (
    {
        "external_id": "demo-agent-001",
        "name": "Synthetic Atlas",
        "description": "Synthetic research and planning agent for demos.",
        "skills": ["research", "planning"],
        "task_categories": ["research", "planning"],
        "supported_output_formats": ["json", "markdown"],
        "availability": "available",
        "estimated_completion_minutes": 45,
        "demo_performance_stats": {"completed_jobs": 18, "success_rate": 0.94},
        "capabilities": ["research", "planning"],
        "metadata_json": {"synthetic": True, "cohort": "phase-2"},
    },
    {
        "external_id": "demo-agent-002",
        "name": "Synthetic Beacon",
        "description": "Synthetic data analysis agent for demos.",
        "skills": ["analysis", "data-cleaning"],
        "task_categories": ["analysis", "verification"],
        "supported_output_formats": ["json", "csv"],
        "availability": "available",
        "estimated_completion_minutes": 60,
        "demo_performance_stats": {"completed_jobs": 22, "success_rate": 0.96},
        "capabilities": ["analysis", "data-cleaning"],
        "metadata_json": {"synthetic": True, "cohort": "phase-2"},
    },
    {
        "external_id": "demo-agent-003",
        "name": "Synthetic Cipher",
        "description": "Synthetic software delivery agent for demos.",
        "skills": ["python", "testing"],
        "task_categories": ["software", "automation"],
        "supported_output_formats": ["json", "markdown"],
        "availability": "busy",
        "estimated_completion_minutes": 90,
        "demo_performance_stats": {"completed_jobs": 31, "success_rate": 0.98},
        "capabilities": ["python", "testing"],
        "metadata_json": {"synthetic": True, "cohort": "phase-2"},
    },
    {
        "external_id": "demo-agent-004",
        "name": "Synthetic Delta",
        "description": "Synthetic document review agent for demos.",
        "skills": ["review", "summarization"],
        "task_categories": ["review", "documentation"],
        "supported_output_formats": ["markdown", "json"],
        "availability": "available",
        "estimated_completion_minutes": 30,
        "demo_performance_stats": {"completed_jobs": 14, "success_rate": 0.91},
        "capabilities": ["review", "summarization"],
        "metadata_json": {"synthetic": True, "cohort": "phase-2"},
    },
    {
        "external_id": "demo-agent-005",
        "name": "Synthetic Echo",
        "description": "Synthetic verification agent for demos.",
        "skills": ["verification", "quality-control"],
        "task_categories": ["verification", "testing"],
        "supported_output_formats": ["json"],
        "availability": "available",
        "estimated_completion_minutes": 40,
        "demo_performance_stats": {"completed_jobs": 27, "success_rate": 0.97},
        "capabilities": ["verification", "quality-control"],
        "metadata_json": {"synthetic": True, "cohort": "phase-2"},
    },
    {
        "external_id": "demo-agent-006",
        "name": "Synthetic Forge",
        "description": "Synthetic automation agent for demos.",
        "skills": ["automation", "integration"],
        "task_categories": ["automation", "integration"],
        "supported_output_formats": ["json", "text"],
        "availability": "unavailable",
        "estimated_completion_minutes": 75,
        "demo_performance_stats": {"completed_jobs": 11, "success_rate": 0.89},
        "capabilities": ["automation", "integration"],
        "metadata_json": {"synthetic": True, "cohort": "phase-2"},
    },
)

DEMO_JOBS = (
    {
        "public_id": "demo-job-001",
        "requester": "demo-agent-001",
        "executor": "demo-agent-003",
        "title": "Synthetic API contract review",
        "description": "Review a synthetic API contract and return structured findings.",
        "budget": Decimal("125.00"),
        "currency": "USD",
        "deadline": datetime(2030, 6, 1, 12, 0, tzinfo=timezone.utc),
        "requirements": {"format": "json", "priority": "normal", "synthetic": True},
        "required_skills": ["python", "testing"],
        "task_category": "software",
        "expected_output": "A structured API contract review in JSON.",
        "acceptance_criteria": ["Valid JSON output", "Minimum length: 20"],
        "additional_instructions": "Use only synthetic examples.",
    },
    {
        "public_id": "demo-job-002",
        "requester": "demo-agent-002",
        "executor": "demo-agent-005",
        "title": "Synthetic data quality verification",
        "description": "Verify a synthetic data sample and summarize quality issues.",
        "budget": Decimal("240.00"),
        "currency": "USD",
        "deadline": datetime(2030, 7, 15, 12, 0, tzinfo=timezone.utc),
        "requirements": {"format": "markdown", "priority": "high", "synthetic": True},
        "required_skills": ["verification", "quality-control"],
        "task_category": "verification",
        "expected_output": "A concise quality report in Markdown.",
        "acceptance_criteria": ["Valid JSON output", "Minimum length: 20"],
        "additional_instructions": "Flag uncertain findings explicitly.",
    },
)


def _seed_job_workflow(db: Session, job: Job, *, complete: bool) -> None:
    agreement = get_job_agreement(db, job.id)
    if agreement is None:
        agreement = create_agreement(
            db,
            job.id,
            AgreementCreate(rationale="Synthetic demo agreement created by the seed command."),
        )
    if agreement.status != "accepted":
        agreement = accept_agreement(db, agreement.id)

    escrow = get_job_escrow(db, job.id)
    if escrow is None or escrow.status == "pending":
        escrow = fund_escrow(
            db,
            job.id,
            EscrowFundRequest(
                idempotency_key=f"seed-funding-{job.public_id}",
                reference=f"synthetic-seed-{job.public_id}",
            ),
        )

    if job.status == "assigned":
        start_execution(db, job.id)

    if not complete:
        if job.status != "in_progress":
            raise RuntimeError(
                f"synthetic active job {job.public_id} is in unexpected state {job.status!r}"
            )
        return

    if job.status == "in_progress":
        create_submission(
            db,
            job.id,
            SubmissionCreate(
                submitted_output=json.dumps(
                    {
                        "result": "synthetic demo verification complete",
                        "findings": ["all required checks passed"],
                    }
                ),
                evidence={"synthetic": True, "seeded": True},
            ),
        )
    if job.status in {"submitted", "under_review"} and latest_verification(db, job.id) is None:
        verify_latest_submission(db, job.id)

    verification = latest_verification(db, job.id)
    if job.status != "completed" or verification is None or verification.overall_result != "passed":
        raise RuntimeError(f"synthetic completed job {job.public_id} did not pass verification")

    escrow = get_job_escrow(db, job.id)
    if escrow is None:
        raise RuntimeError(f"synthetic completed job {job.public_id} has no escrow")
    if escrow.status in {"funded", "held"}:
        release_escrow(db, escrow.id)


def seed_demo_data(*, with_jobs: bool = False) -> dict[str, int]:
    """Insert demo rows if their deterministic keys are not present."""

    if get_settings().app_env.lower() not in {"development", "test"}:
        raise RuntimeError("demo seed data is disabled outside development and test environments")

    db = SessionLocal()
    created_agents = 0
    created_jobs = 0
    try:
        agents_by_key: dict[str, Agent] = {}
        jobs_by_key: dict[str, Job] = {}
        for values in DEMO_AGENTS:
            agent = db.scalar(select(Agent).where(Agent.external_id == values["external_id"]))
            if agent is None:
                agent = Agent(**values)
                db.add(agent)
                created_agents += 1
                db.flush()
            else:
                # Existing deterministic rows are upgraded with the explicit
                # contract fields without creating duplicates.
                for field in (
                    "skills",
                    "task_categories",
                    "supported_output_formats",
                    "availability",
                    "estimated_completion_minutes",
                    "demo_performance_stats",
                    "capabilities",
                ):
                    setattr(agent, field, values[field])
            agents_by_key[values["external_id"]] = agent

        if with_jobs:
            for values in DEMO_JOBS:
                job = db.scalar(select(Job).where(Job.public_id == values["public_id"]))
                if job is not None:
                    job.required_skills = values["required_skills"]
                    job.task_category = values["task_category"]
                    job.expected_output = values["expected_output"]
                    job.acceptance_criteria = values["acceptance_criteria"]
                    job.additional_instructions = values["additional_instructions"]
                    job.selected_agent_id = agents_by_key[values["executor"]].id
                    jobs_by_key[values["public_id"]] = job
                    continue
                job = Job(
                    public_id=values["public_id"],
                    requester_agent_id=agents_by_key[values["requester"]].id,
                    executor_agent_id=agents_by_key[values["executor"]].id,
                    title=values["title"],
                    description=values["description"],
                    budget=values["budget"],
                    currency=values["currency"],
                    deadline=values["deadline"],
                    required_skills=values["required_skills"],
                    task_category=values["task_category"],
                    expected_output=values["expected_output"],
                    acceptance_criteria=values["acceptance_criteria"],
                    additional_instructions=values["additional_instructions"],
                    requirements=values["requirements"],
                    selected_agent_id=agents_by_key[values["executor"]].id,
                )
                db.add(job)
                db.flush()
                jobs_by_key[values["public_id"]] = job
                record_event(
                    db,
                    "job.seeded",
                    job_id=job.id,
                    actor_agent_id=job.requester_agent_id,
                    data={"public_id": job.public_id, "synthetic": True},
                )
                created_jobs += 1
            _seed_job_workflow(db, jobs_by_key["demo-job-001"], complete=False)
            _seed_job_workflow(db, jobs_by_key["demo-job-002"], complete=True)
        db.commit()
        return {"agents_created": created_agents, "jobs_created": created_jobs}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed deterministic synthetic Auto Escrow data")
    parser.add_argument("--with-jobs", action="store_true", help="also create two synthetic jobs")
    args = parser.parse_args()
    print(json.dumps(seed_demo_data(with_jobs=args.with_jobs), sort_keys=True))


if __name__ == "__main__":
    main()
