"""Dashboard aggregates calculated from persisted rows."""

from decimal import Decimal

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session

from app.models import Agent, Dispute, Escrow, Job, Submission, Verification
from app.schemas import MAX_JOB_BUDGET

MONEY_ZERO = Decimal("0.00")
RISK_DISPUTE_POINTS = Decimal("50")
RISK_EXPOSURE_POINTS = Decimal("20")
RISK_AGENT_HISTORY_POINTS = Decimal("15")
RISK_VERIFICATION_POINTS = Decimal("15")


def _count(db: Session, model, *conditions) -> int:
    return int(db.scalar(select(func.count()).select_from(model).where(*conditions)) or 0)


def _sum(db: Session, column, *conditions) -> Decimal:
    value = db.scalar(select(func.coalesce(func.sum(column), 0)).where(*conditions))
    decimal_value = value if isinstance(value, Decimal) else Decimal(str(value or 0))
    return decimal_value.quantize(MONEY_ZERO)


def get_risk_score(db: Session, *, demo_session_id: str | None = None) -> Decimal:
    """Calculate a global 0-100 risk score; higher scores indicate higher risk."""

    dispute_points = (
        RISK_DISPUTE_POINTS
        if _count(
            db,
            Dispute,
            Dispute.status.in_(("open", "under_review")),
            *( [Dispute.job_id.in_(select(Job.id).where(Job.demo_session_id == demo_session_id))] if demo_session_id is not None else []),
        )
        else Decimal("0")
    )

    active_escrows = db.execute(
        select(Escrow.funded_amount, Escrow.currency)
        .join(Job, Job.id == Escrow.job_id)
        .where(
            Escrow.status.in_(("funded", "held")),
            *([Job.demo_session_id == demo_session_id] if demo_session_id is not None else []),
        )
    ).all()
    exposure_ratio = max(
        (
            min(Decimal(str(amount or 0)) / MAX_JOB_BUDGET, Decimal("1"))
            for amount, _currency in active_escrows
            if amount is not None
        ),
        default=Decimal("0"),
    )
    exposure_points = exposure_ratio * RISK_EXPOSURE_POINTS

    weighted_success = Decimal("0")
    success_weight = Decimal("0")
    if demo_session_id:
        from app.services.agents import list_agents
        performance_rows = [agent.demo_performance_stats for agent in list_agents(db, status="active", synthetic_only=True)[0]]
    else:
        performance_rows = db.scalars(select(Agent.demo_performance_stats).where(Agent.status == "active")).all()
    for stats in performance_rows:
        if not isinstance(stats, dict):
            continue
        raw_rate = stats.get("success_rate")
        raw_completed = stats.get("completed_jobs")
        if (
            isinstance(raw_rate, bool)
            or not isinstance(raw_rate, (int, float))
            or isinstance(raw_completed, bool)
            or not isinstance(raw_completed, (int, float))
            or raw_completed <= 0
            or not 0 <= raw_rate <= 1
        ):
            continue
        rate = Decimal(str(raw_rate))
        weight = Decimal(str(raw_completed))
        weighted_success += rate * weight
        success_weight += weight
    agent_history_points = (
        (Decimal("1") - weighted_success / success_weight) * RISK_AGENT_HISTORY_POINTS
        if success_weight
        else Decimal("0")
    )

    verification_query = select(Verification.status, func.count()).where(
        Verification.status.in_(("passed", "failed"))
    )
    if demo_session_id is not None:
        verification_query = (
            verification_query.join(Submission, Verification.submission_id == Submission.id)
            .join(Job, Job.id == Submission.job_id)
            .where(Job.demo_session_id == demo_session_id)
        )
    verification_counts = db.execute(verification_query.group_by(Verification.status)).all()
    counts = {status: count for status, count in verification_counts}
    verification_total = counts.get("passed", 0) + counts.get("failed", 0)
    verification_points = (
        Decimal(counts.get("failed", 0))
        / Decimal(verification_total)
        * RISK_VERIFICATION_POINTS
        if verification_total
        else Decimal("0")
    )

    score = dispute_points + exposure_points + agent_history_points + verification_points
    return min(score, Decimal("100")).quantize(Decimal("0.01"))


def get_metrics(db: Session, *, demo_session_id: str | None = None) -> dict[str, int | Decimal]:
    # "Funded" is cumulative simulated money that has left the pending state;
    # "settled" is money released or refunded back out of escrow.
    funded_statuses = ("funded", "held", "released", "refunded", "disputed")
    settled_statuses = ("released", "refunded")
    job_scope = Job.demo_session_id == demo_session_id if demo_session_id is not None else None
    job_ids = select(Job.id).where(job_scope) if job_scope is not None else select(Job.id)
    escrow_scope = Escrow.job_id.in_(job_ids)
    dispute_scope = Dispute.job_id.in_(job_ids)
    job_conditions = [job_scope] if job_scope is not None else []
    return {
        "total_jobs": _count(db, Job, *job_conditions),
        "jobs_in_progress": _count(db, Job, Job.status == "in_progress", *job_conditions),
        "completed_jobs": _count(db, Job, Job.status == "completed", *job_conditions),
        "open_disputes": _count(db, Dispute, Dispute.status.in_(("open", "under_review")), dispute_scope),
        "total_simulated_escrow_funded": _sum(
            db, Escrow.funded_amount, Escrow.status.in_(funded_statuses), escrow_scope
        ),
        "total_simulated_escrow_settled": _sum(
            db, Escrow.funded_amount, Escrow.status.in_(settled_statuses), escrow_scope
        ),
        "risk_score": get_risk_score(db, demo_session_id=demo_session_id),
    }


def get_execution_metrics(db: Session, *, demo_session_id: str | None = None) -> dict[str, object]:
    """Return workflow counts and recent persisted execution records."""

    job_scope = Job.demo_session_id == demo_session_id if demo_session_id is not None else None
    unresolved_dispute = exists(
        select(Dispute.id).where(
            Dispute.job_id == Job.id,
            Dispute.status.in_(("open", "under_review")),
        )
    )
    eligible_settlement = (
        select(Job.id)
        .join(Escrow, Escrow.job_id == Job.id)
        .join(Submission, Submission.job_id == Job.id)
        .join(Verification, Verification.submission_id == Submission.id)
        .where(
            Job.status == "completed",
            Escrow.status.in_(("funded", "held")),
            Verification.status == "passed",
            Verification.overall_result == "passed",
            ~unresolved_dispute,
            *([job_scope] if job_scope is not None else []),
        )
        .distinct()
        .subquery()
    )
    recent_submissions = list(
        db.scalars(
            select(Submission)
            .join(Job, Job.id == Submission.job_id)
            .where(*([Job.demo_session_id == demo_session_id] if demo_session_id is not None else []))
            .order_by(Submission.submitted_at.desc(), Submission.id.desc())
            .limit(5)
        ).all()
    )
    recent_verifications = list(
        db.scalars(
            select(Verification)
            .join(Submission, Verification.submission_id == Submission.id)
            .join(Job, Job.id == Submission.job_id)
            .where(*([Job.demo_session_id == demo_session_id] if demo_session_id is not None else []))
            .order_by(Verification.evaluated_at.desc(), Verification.id.desc())
            .limit(5)
        ).all()
    )
    return {
        "jobs_running": _count(db, Job, Job.status == "in_progress", *([job_scope] if job_scope is not None else [])),
        "jobs_awaiting_submission": _count(db, Job, Job.status == "in_progress", *([job_scope] if job_scope is not None else [])),
        "jobs_awaiting_verification": _count(db, Job, Job.status.in_(("submitted", "under_review")), *([job_scope] if job_scope is not None else [])),
        "jobs_eligible_for_settlement": int(db.scalar(select(func.count()).select_from(eligible_settlement)) or 0),
        "recent_submissions": recent_submissions,
        "recent_verifications": recent_verifications,
    }
