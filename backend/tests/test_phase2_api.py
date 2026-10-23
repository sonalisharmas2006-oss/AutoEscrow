from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy import inspect

from app.config import Settings, get_database_url
from app.models import Agent, Agreement, AuditEvent, Dispute, Escrow, Job, Submission, Verification
from app.seed import seed_demo_data


def _agent(external_id: str, name: str) -> Agent:
    return Agent(
        external_id=external_id,
        name=name,
        description=f"{name} synthetic test agent",
        skills=["testing"],
        task_categories=["verification"],
        supported_output_formats=["json"],
        availability="available",
        estimated_completion_minutes=30,
        demo_performance_stats={"completed_jobs": 1, "success_rate": 1.0},
        capabilities=["testing"],
        metadata_json={"synthetic": True},
    )


def _job(requester_id: int, executor_id: int | None = None) -> Job:
    return Job(
        requester_agent_id=requester_id,
        executor_agent_id=executor_id,
        title="Persisted test job",
        description="A job used to verify persisted metrics.",
        budget=Decimal("75.00"),
        currency="USD",
        deadline=datetime.now(timezone.utc) + timedelta(days=5),
        required_skills=["testing"],
        task_category="verification",
        expected_output="A verification report.",
        acceptance_criteria=["Report is structured"],
        additional_instructions="Use synthetic data.",
        requirements={"format": "json"},
    )


def test_database_initialization_has_all_domain_tables(session_factory) -> None:
    table_names = set(inspect(session_factory.kw["bind"]).get_table_names())
    assert {
        "agents",
        "jobs",
        "agreements",
        "escrows",
        "ledger_entries",
        "submissions",
        "verifications",
        "disputes",
        "audit_events",
        "match_results",
    } <= table_names


def test_test_database_override_is_selected_without_changing_default() -> None:
    test_settings = Settings(
        app_env="test",
        database_url="sqlite:///./development.sqlite3",
        test_database_url="sqlite:///./isolated.sqlite3",
    )
    assert get_database_url(test_settings) == "sqlite:///./isolated.sqlite3"


def test_agent_list_and_detail_use_persisted_rows(client, db_session) -> None:
    db_session.add_all([_agent("test-agent-1", "Test One"), _agent("test-agent-2", "Test Two")])
    db_session.commit()

    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    assert response.json()["total"] == 2
    assert [item["external_id"] for item in response.json()["items"]] == ["test-agent-1", "test-agent-2"]
    assert response.json()["items"][0]["skills"] == ["testing"]
    assert response.json()["items"][0]["availability"] == "available"

    detail = client.get("/api/v1/agents/1")
    assert detail.status_code == 200
    assert detail.json()["name"] == "Test One"


def test_job_create_invalid_and_retrieve_with_audit_event(client, db_session) -> None:
    deadline = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    payload = {
        "title": "Create a persisted job",
        "description": "Return a structured result.",
        "required_skills": ["testing"],
        "task_category": "verification",
        "expected_output": "A JSON verification report.",
        "acceptance_criteria": ["Every check has a result"],
        "budget": "125.00",
        "currency": "USD",
        "deadline": deadline,
        "additional_instructions": "Do not require an agent requester.",
        "requirements": {"format": "json", "priority": "normal"},
    }
    created = client.post("/api/v1/jobs", json=payload)
    assert created.status_code == 201
    job_id = created.json()["id"]
    assert created.json()["budget"] == "125.00"
    assert created.json()["requester_agent_id"] is None
    assert created.json()["task_category"] == "verification"

    invalid = {**payload, "budget": 0}
    assert client.post("/api/v1/jobs", json=invalid).status_code == 422
    invalid_currency = {**payload, "currency": "ZZZ"}
    assert client.post("/api/v1/jobs", json=invalid_currency).status_code == 422
    invalid_deadline = {**payload, "deadline": "2020-01-01T00:00:00+00:00"}
    assert client.post("/api/v1/jobs", json=invalid_deadline).status_code == 422

    retrieved = client.get(f"/api/v1/jobs/{job_id}")
    assert retrieved.status_code == 200
    assert retrieved.json()["public_id"].startswith("job-")
    events = client.get(f"/api/v1/jobs/{job_id}/events")
    assert events.status_code == 200
    assert events.json()[0]["event_type"] == "job.created"
    assert events.json()[0]["description"] == "job.created"
    assert events.json()[0]["actor_agent_id"] is None


def test_dashboard_metrics_are_calculated_from_persisted_rows(client, db_session) -> None:
    requester = _agent("metrics-requester", "Metrics Requester")
    executor = _agent("metrics-executor", "Metrics Executor")
    db_session.add_all([requester, executor])
    db_session.flush()
    job = _job(requester.id, executor.id)
    job.status = "in_progress"
    db_session.add(job)
    db_session.flush()
    agreement = Agreement(
        job_id=job.id,
        requester_agent_id=requester.id,
        executor_agent_id=executor.id,
        amount=Decimal("75.00"),
        proposed_budget=Decimal("75.00"),
        proposed_deadline=job.deadline,
        currency="USD",
        terms={"deliverable": "json"},
        proposal_history=[{"amount": "75.00", "status": "proposed"}],
    )
    db_session.add(agreement)
    db_session.flush()
    db_session.add(
        Escrow(
            job_id=job.id,
            agreement_id=agreement.id,
            amount=Decimal("75.00"),
            funded_amount=Decimal("75.00"),
            currency="USD",
            status="funded",
        )
    )
    db_session.flush()
    db_session.add(
        Dispute(
            job_id=job.id,
            raised_by_agent_id=requester.id,
            status="open",
            reason="Synthetic test dispute",
            evidence={"source": "test"},
        )
    )
    failed_job = _job(requester.id, executor.id)
    failed_job.status = "under_review"
    db_session.add(failed_job)
    db_session.flush()
    failed_submission = Submission(
        job_id=failed_job.id,
        agent_id=executor.id,
        version=1,
        artifact_url="local://submission/failed-demo/1",
        submitted_output="Synthetic failed verification result.",
        status="rejected",
    )
    db_session.add(failed_submission)
    db_session.flush()
    db_session.add(
        Verification(
            submission_id=failed_submission.id,
            status="failed",
            overall_result="failed",
            evaluator_type="automated",
        )
    )
    db_session.commit()

    agreement_response = client.get(f"/api/v1/jobs/{job.id}/agreement")
    assert agreement_response.status_code == 200
    assert agreement_response.json()["proposed_budget"] == "75.00"
    escrow_response = client.get(f"/api/v1/jobs/{job.id}/escrow")
    assert escrow_response.status_code == 200
    assert escrow_response.json()["funded_amount"] == "75.00"

    response = client.get("/api/v1/dashboard/metrics")
    assert response.status_code == 200
    assert response.json() == {
        "total_jobs": 2,
        "jobs_in_progress": 1,
        "completed_jobs": 0,
        "open_disputes": 1,
        "total_simulated_escrow_funded": "75.00",
        "total_simulated_escrow_settled": "0.00",
        "risk_score": "65.00",
    }


def test_seed_is_repeatable_and_creates_complete_demo_workflows(monkeypatch, session_factory, client) -> None:
    import app.seed as seed_module

    monkeypatch.setattr(seed_module, "SessionLocal", session_factory)
    first = seed_demo_data(with_jobs=True)
    second = seed_demo_data(with_jobs=True)
    assert first == {"agents_created": 6, "jobs_created": 2}
    assert second == {"agents_created": 0, "jobs_created": 0}

    db = session_factory()
    try:
        assert db.query(Agent).count() == 6
        assert db.query(Job).count() == 2
        assert db.query(Agent).filter(Agent.skills.is_not(None)).count() == 6
        assert db.query(Job).filter(Job.required_skills.is_not(None)).count() == 2
        assert db.query(Agreement).count() == 2
        assert db.query(Agreement).filter(Agreement.status == "accepted").count() == 2
        assert db.query(Escrow).count() == 2
        assert db.query(Escrow).filter(Escrow.status == "funded").count() == 1
        assert db.query(Escrow).filter(Escrow.status == "released").count() == 1
        assert db.query(Submission).count() == 1
        assert db.query(Verification).filter(Verification.overall_result == "passed").count() == 1
        assert db.query(Job).filter(Job.status == "in_progress").count() == 1
        assert db.query(Job).filter(Job.status == "completed").count() == 1
        assert {
            "execution.started",
            "verification.passed",
            "escrow.funded",
            "escrow.settled",
        } <= {event.event_type for event in db.query(AuditEvent).all()}
    finally:
        db.close()

    jobs_response = client.get("/api/v1/jobs")
    assert jobs_response.status_code == 200
    jobs = jobs_response.json()["items"]
    assert len(jobs) == 2

    execution_states = {
        client.get(f"/api/v1/jobs/{job['id']}/execution").json()["job_status"]
        for job in jobs
    }
    assert execution_states == {"in_progress", "completed"}

    escrow_states = {
        client.get(f"/api/v1/jobs/{job['id']}/escrow").json()["status"]
        for job in jobs
    }
    assert escrow_states == {"funded", "released"}

    dashboard = client.get("/api/v1/dashboard/metrics")
    assert dashboard.status_code == 200
    assert dashboard.json()["completed_jobs"] == 1
    assert dashboard.json()["jobs_in_progress"] == 1
    assert dashboard.json()["total_simulated_escrow_funded"] == "365.00"
    assert dashboard.json()["total_simulated_escrow_settled"] == "240.00"
    assert Decimal(dashboard.json()["risk_score"]) == Decimal("0.72")

    execution_dashboard = client.get("/api/v1/dashboard/execution")
    assert execution_dashboard.status_code == 200
    assert execution_dashboard.json()["jobs_running"] == 1
    assert len(execution_dashboard.json()["recent_submissions"]) == 1
    assert len(execution_dashboard.json()["recent_verifications"]) == 1


def test_seed_is_disabled_outside_demo_environments(monkeypatch, session_factory) -> None:
    import app.seed as seed_module

    monkeypatch.setattr(seed_module, "SessionLocal", session_factory)
    monkeypatch.setattr(seed_module, "get_settings", lambda: type("Settings", (), {"app_env": "production"})())
    with pytest.raises(RuntimeError, match="disabled outside development and test"):
        seed_demo_data()


def test_missing_records_and_missing_related_rows_have_explicit_responses(client, db_session) -> None:
    assert client.get("/api/v1/agents/9999").status_code == 404
    assert client.get("/api/v1/agreements/9999").status_code == 404
    assert client.get("/api/v1/escrows/9999").status_code == 404

    requester = _agent("missing-related-requester", "Requester")
    db_session.add(requester)
    db_session.flush()
    job = _job(requester.id)
    db_session.add(job)
    db_session.commit()

    assert client.get(f"/api/v1/jobs/{job.id}/agreement").status_code == 204
    assert client.get(f"/api/v1/jobs/{job.id}/escrow").status_code == 204
    assert client.get("/api/v1/jobs/9999/agreement").status_code == 404
