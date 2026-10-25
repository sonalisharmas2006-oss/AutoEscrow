"""Deletion is allowed only for an explicit non-empty sandbox id."""
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from app.models import Agreement, AuditEvent, Dispute, Escrow, Job, LedgerEntry, MatchResult, Submission, Verification


def delete_demo_jobs(db: Session, session_id: str) -> None:
    if not session_id:
        raise ValueError("An explicit demo session id is required")
    job_ids = list(db.scalars(select(Job.id).where(Job.demo_session_id == session_id)))
    if not job_ids:
        return
    escrow_ids = select(Escrow.id).where(Escrow.job_id.in_(job_ids))
    submission_ids = select(Submission.id).where(Submission.job_id.in_(job_ids))
    db.execute(delete(Dispute).where(Dispute.job_id.in_(job_ids)))
    db.execute(delete(Verification).where(Verification.submission_id.in_(submission_ids)))
    db.execute(delete(LedgerEntry).where(LedgerEntry.escrow_id.in_(escrow_ids)))
    db.execute(delete(AuditEvent).where(AuditEvent.job_id.in_(job_ids)))
    db.execute(delete(MatchResult).where(MatchResult.job_id.in_(job_ids)))
    db.execute(delete(Submission).where(Submission.job_id.in_(job_ids)))
    db.execute(delete(Escrow).where(Escrow.job_id.in_(job_ids)))
    db.execute(delete(Agreement).where(Agreement.job_id.in_(job_ids)))
    db.execute(delete(Job).where(Job.id.in_(job_ids)))
