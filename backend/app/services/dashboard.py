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


def get_risk_score(db: Session) -> Decimal:
    """Calculate a global 0-100 risk score; higher scores indicate higher risk."""

    dispute_points = (
        RISK_DISPUTE_POINTS
        if _count(db, Dispute, Dispute.status.in_(("open", "under_review")))
        else Decimal("0")
    )

    active_escrows = db.execute(
        select(Escrow.funded_amount, Escrow.currency).where(Escrow.status.in_(("funded", "held")))
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
    performance_rows = db.scalars(
        select(Agent.demo_performance_stats).where(Agent.status == "active")
    ).all()
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

    verification_counts = db.execute(
        select(Verification.status, func.count())
        .where(Verification.status.in_(("passed", "failed")))
        .group_by(Verification.status)
    ).all()
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


def get_metrics(db: Session) -> dict[str, int | Decimal]:
    # "Funded" is cumulative simulated money that has left the pending state;
    # "settled" is money released or refunded back out of escrow.
    funded_statuses = ("funded", "held", "released", "refunded", "disputed")
    settled_statuses = ("released", "refunded")
    return {
        "total_jobs": _count(db, Job),
        "jobs_in_progress": _count(db, Job, Job.status == "in_progress"),
        "completed_jobs": _count(db, Job, Job.status == "completed"),
        "open_disputes": _count(db, Dispute, Dispute.status.in_(("open", "under_review"))),
        "total_simulated_escrow_funded": _sum(
            db, Escrow.funded_amount, Escrow.status.in_(funded_statuses)
        ),
        "total_simulated_escrow_settled": _sum(
            db, Escrow.funded_amount, Escrow.status.in_(settled_statuses)
        ),
        "risk_score": get_risk_score(db),
    }


def get_execution_metrics(db: Session) -> dict[str, object]:
    """Return workflow counts and recent persisted execution records."""

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
        )
        .distinct()
        .subquery()
    )
    recent_submissions = list(
        db.scalars(
            select(Submission)
            .order_by(Submission.submitted_at.desc(), Submission.id.desc())
            .limit(5)
        ).all()
    )
    recent_verifications = list(
        db.scalars(
            select(Verification)
            .join(Submission, Verification.submission_id == Submission.id)
            .order_by(Verification.evaluated_at.desc(), Verification.id.desc())
            .limit(5)
        ).all()
    )
    return {
        "jobs_running": _count(db, Job, Job.status == "in_progress"),
        "jobs_awaiting_submission": _count(db, Job, Job.status == "in_progress"),
        "jobs_awaiting_verification": _count(db, Job, Job.status.in_(("submitted", "under_review"))),
        "jobs_eligible_for_settlement": int(db.scalar(select(func.count()).select_from(eligible_settlement)) or 0),
        "recent_submissions": recent_submissions,
        "recent_verifications": recent_verifications,
    }
