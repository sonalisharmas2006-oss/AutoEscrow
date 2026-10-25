from datetime import datetime, timedelta, timezone

from app.demo_auth import issue_demo_session, verify_demo_session
import pytest
from app.config import get_settings
from app.models import Agent, DemoSessionRecord
from app.main import app
from app.demo_admin import cleanup, seed_agents
from app.models import Agreement, AuditEvent, Dispute, Escrow, Job, LedgerEntry, MatchResult, Submission, Verification
from sqlalchemy import select


def _job_payload(title: str) -> dict[str, object]:
    return {
        "title": title,
        "description": "Synthetic demo task for session isolation.",
        "required_skills": [],
        "task_category": "general",
        "expected_output": "A synthetic result.",
        "acceptance_criteria": ["The result is returned."],
        "budget": "25.00",
        "currency": "USD",
        "deadline": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
    }


def test_demo_credentials_are_signed_and_tamper_evident() -> None:
    session = issue_demo_session()
    verified = verify_demo_session(session.token)
    assert verified.session_id == session.session_id
    payload, signature = session.token.split(".", 1)
    tampered = f"{payload}.{'A' if signature[0] != 'A' else 'B'}{signature[1:]}"
    try:
        verify_demo_session(tampered)
    except ValueError:
        pass
    else:
        raise AssertionError("tampered demo credentials must be rejected")


def test_demo_jobs_are_isolated_and_reset_is_scoped(client) -> None:
    first = client.post("/api/v1/demo/session")
    second = client.post("/api/v1/demo/session")
    assert first.status_code == 200
    assert second.status_code == 200
    first_headers = {"X-Demo-Session": first.json()["token"]}
    second_headers = {"X-Demo-Session": second.json()["token"]}

    first_job = client.post("/api/v1/jobs", headers=first_headers, json=_job_payload("First sandbox job"))
    second_job = client.post("/api/v1/jobs", headers=second_headers, json=_job_payload("Second sandbox job"))
    assert first_job.status_code == 201
    assert second_job.status_code == 201
    first_id = first_job.json()["id"]
    second_id = second_job.json()["id"]
    assert datetime.fromisoformat(first_job.json()["deadline"]).tzinfo is not None

    assert client.get("/api/v1/jobs", headers=first_headers).json()["total"] == 1
    assert client.get("/api/v1/jobs", headers=first_headers).headers["cache-control"] == "no-store"
    assert client.get(f"/api/v1/jobs/{second_id}", headers=first_headers).status_code == 404
    assert client.get(f"/api/v1/jobs/{first_id}", headers=second_headers).status_code == 404

    reset = client.post("/api/v1/demo/session/reset", headers=first_headers)
    assert reset.status_code == 200
    new_headers = {"X-Demo-Session": reset.json()["token"]}
    assert client.get("/api/v1/jobs", headers=new_headers).json()["total"] == 0
    assert client.get("/api/v1/jobs", headers=second_headers).json()["total"] == 1


@pytest.fixture
def hosted(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "app_env", "production")
    monkeypatch.setattr(settings, "demo_session_secret", "test-only-signing-secret-not-for-deployment-12345")
    monkeypatch.setattr(settings, "demo_public_access", True)
    # Each test gets fresh admission buckets, not an unlimited bypass.
    app.middleware_stack = None
    yield settings
    app.middleware_stack = None


def _session(client):
    response = client.post("/api/v1/demo/session")
    assert response.status_code == 200, response.text
    return {"X-Demo-Session": response.json()["token"]}


def _workflow(client, db, headers, passing=True):
    agent = Agent(external_id=f"sandbox-agent-{passing}", name="Synthetic analyst", description="Synthetic only",
                  skills=["analysis"], task_categories=["analysis"], supported_output_formats=["json"],
                  metadata_json={"synthetic": True}, availability="available", status="active")
    db.add(agent); db.commit()
    job = client.post("/api/v1/jobs", headers=headers, json={**_job_payload("Scoped workflow"), "acceptance_criteria": ["Valid JSON output"]}).json()
    jid = job["id"]
    matches = client.post(f"/api/v1/jobs/{jid}/matches", headers=headers)
    assert matches.status_code == 201, matches.text
    assert client.post(f"/api/v1/jobs/{jid}/matches/{agent.id}/select", headers=headers, json={"run_id": matches.json()["run_id"]}).status_code == 200
    proposal = client.post(f"/api/v1/jobs/{jid}/agreement", headers=headers, json={}).json()
    aid = proposal["id"]
    assert client.post(f"/api/v1/agreements/{aid}/accept", headers=headers).status_code == 200
    assert client.post(f"/api/v1/agreements/{aid}/revise", headers=headers, json={"action": "submit_revision", "proposed_budget": "20.00"}).status_code == 409
    funding = client.post(f"/api/v1/jobs/{jid}/escrow/fund", headers=headers, json={"idempotency_key": "same"})
    assert funding.status_code == 201, funding.text
    eid = funding.json()["id"]
    assert client.post(f"/api/v1/jobs/{jid}/escrow/fund", headers=headers, json={"idempotency_key": "same"}).json()["id"] == eid
    assert client.post(f"/api/v1/escrows/{eid}/release", headers=headers).status_code == 409
    assert client.post(f"/api/v1/jobs/{jid}/start", headers=headers).status_code == 200
    output = '{"summary":"Synthetic result"}' if passing else "invalid"
    assert client.post(f"/api/v1/jobs/{jid}/submit", headers=headers, json={"submitted_output": output}).status_code == 201
    assert client.post(f"/api/v1/jobs/{jid}/submit", headers=headers, json={"submitted_output": output}).status_code == 409
    verification = client.post(f"/api/v1/jobs/{jid}/verify", headers=headers)
    assert verification.status_code == 200
    assert verification.json()["overall_result"] == ("passed" if passing else "failed")
    assert client.post(f"/api/v1/jobs/{jid}/verify", headers=headers).json()["id"] == verification.json()["id"]
    return jid, aid, eid, agent.id


def test_hosted_happy_failed_refund_and_full_isolation(client, db_session, hosted):
    first, second = _session(client), _session(client)
    jid, aid, eid, agent_id = _workflow(client, db_session, first, False)
    for suffix in ["", "/matches", "/agreement", "/escrow", "/execution", "/submissions", "/verification", "/disputes", "/events"]:
        assert client.get(f"/api/v1/jobs/{jid}{suffix}", headers=second).status_code == 404
    for route in [f"agreements/{aid}", f"agreements/{aid}/history", f"escrows/{eid}", f"escrows/{eid}/ledger"]:
        assert client.get(f"/api/v1/{route}", headers=second).status_code == 404
    for route, body in [(f"jobs/{jid}/matches", {}), (f"jobs/{jid}/agreement", {}), (f"agreements/{aid}/accept", {}),
                        (f"jobs/{jid}/escrow/fund", {}), (f"escrows/{eid}/release", {}), (f"escrows/{eid}/refund", {}),
                        (f"jobs/{jid}/start", {}), (f"jobs/{jid}/submit", {"submitted_output": "fake"}), (f"jobs/{jid}/verify", {})]:
        assert client.post(f"/api/v1/{route}", headers=second, json=body).status_code == 404
    assert client.get("/api/v1/dashboard/metrics", headers=second).json()["total_jobs"] == 0
    assert client.get("/api/v1/dashboard/execution", headers=second).json()["recent_submissions"] == []
    dispute = client.post(f"/api/v1/jobs/{jid}/disputes", headers=first, json={"escrow_id": eid, "category": "failed_verification", "reason": "Synthetic failure", "description": "JSON check failed", "raised_by_agent_id": agent_id}).json()
    did = dispute["id"]
    for suffix in ["", "/events"]:
        assert client.get(f"/api/v1/disputes/{did}{suffix}", headers=second).status_code == 404
    assert client.get("/api/v1/disputes", headers=second).json() == []
    assert client.post(f"/api/v1/disputes/{did}/review", headers=second, json={}).status_code == 404
    assert client.post(f"/api/v1/disputes/{did}/review", headers=first, json={}).status_code == 200
    assert client.post(f"/api/v1/disputes/{did}/resolve", headers=first, json={"resolution": "release", "rationale": "Attempted failed verification bypass"}).status_code == 409
    assert client.post(f"/api/v1/disputes/{did}/resolve", headers=first, json={"resolution": "refund", "rationale": "Refund because the synthetic JSON check failed"}).status_code == 200
    assert [entry["entry_type"] for entry in client.get(f"/api/v1/escrows/{eid}/ledger", headers=first).json()] == ["funding", "refund"]
    jid2, _, eid2, _ = _workflow(client, db_session, second)
    assert client.post(f"/api/v1/escrows/{eid2}/release", headers=second).status_code == 200
    assert client.post(f"/api/v1/escrows/{eid2}/release", headers=second).status_code == 409
    assert len(client.get(f"/api/v1/jobs/{jid2}/events", headers=second).json()) > 5
    assert client.post("/api/v1/demo/session/reset", headers=first).status_code == 200
    assert client.get("/api/v1/jobs", headers=first).status_code == 401  # revoked, not merely hidden
    assert client.get(f"/api/v1/jobs/{jid2}", headers=second).status_code == 200


def test_expiration_admission_gate_and_resource_caps(client, db_session, hosted, monkeypatch):
    assert client.get("/api/v1/jobs").status_code == 401
    monkeypatch.setattr(hosted, "demo_public_access", False)
    monkeypatch.setattr(hosted, "demo_access_code", "test-only-access-code-123")
    assert client.post("/api/v1/demo/session").status_code == 403
    response = client.post("/api/v1/demo/session", json={"access_code": "test-only-access-code-123"})
    assert response.status_code == 200
    headers = {"X-Demo-Session": response.json()["token"]}
    for i in range(3):
        assert client.post("/api/v1/jobs", headers=headers, json=_job_payload(f"Job {i}")).status_code == 201
    assert client.post("/api/v1/jobs", headers=headers, json=_job_payload("over limit")).status_code == 429
    assert client.post("/api/v1/jobs", headers=headers, json={**_job_payload("over budget"), "budget": "501.00"}).status_code == 422
    record = db_session.get(DemoSessionRecord, verify_demo_session(headers["X-Demo-Session"]).session_id)
    record.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    db_session.commit()
    assert client.get("/api/v1/jobs", headers=headers).status_code == 401


def test_synthetic_registry_and_matches_hide_other_data(client, db_session, hosted):
    db_session.add(Agent(external_id="private", name="Private production profile", description="not public", metadata_json={}))
    db_session.commit()
    headers = _session(client)
    assert client.get("/api/v1/agents", headers=headers).json()["total"] == 0
    assert client.get("/api/v1/agents/1", headers=headers).status_code == 404
    job = client.post("/api/v1/jobs", headers=headers, json=_job_payload("Safe matching")).json()
    response = client.post(f"/api/v1/jobs/{job['id']}/matches", headers=headers).json()
    assert response["candidates"] == response["excluded_agents"] == []
    assert client.post(f"/api/v1/jobs/{job['id']}/matches/1/select", headers=headers).status_code == 404


def test_request_bytes_chunked_and_untrusted_headers_do_not_bypass_rate_limit(client, hosted, monkeypatch):
    monkeypatch.setattr(hosted, "demo_max_request_bytes", 64)
    assert client.post("/api/v1/demo/session", content=b"x" * 65).status_code == 413
    assert client.post("/api/v1/demo/session", content=iter([b"x" * 40, b"y" * 40])).status_code == 413
    monkeypatch.setattr(hosted, "demo_rate_limit_per_minute", 3)
    response = client.get("/api/v1/jobs", headers={"X-Demo-Session": "new-forged-value", "X-Forwarded-For": "1.2.3.4"})
    assert response.status_code == 401
    response = client.get("/api/v1/jobs", headers={"X-Demo-Session": "another-value", "X-Forwarded-For": "2.3.4.5", "Origin": "http://localhost:3000"})
    assert response.status_code == 429
    assert response.headers["retry-after"] == "60"
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_expired_cleanup_removes_children_but_preserves_live_and_unscoped_jobs(client, db_session, hosted):
    first, second = _session(client), _session(client)
    jid, aid, eid, agent_id = _workflow(client, db_session, first, False)
    dispute = client.post(f"/api/v1/jobs/{jid}/disputes", headers=first, json={
        "escrow_id": eid, "category": "failed_verification", "reason": "Synthetic failure",
        "description": "JSON check failed", "raised_by_agent_id": agent_id,
    })
    assert dispute.status_code == 201
    live_id = client.post("/api/v1/jobs", headers=second, json=_job_payload("Live sandbox")).json()["id"]
    legacy = Job(title="Local unscoped job", description="Not owned by a demo session", budget=25,
                 currency="USD", deadline=datetime.now(timezone.utc) + timedelta(days=1))
    db_session.add(legacy)
    sid = verify_demo_session(first["X-Demo-Session"]).session_id
    expired = db_session.get(DemoSessionRecord, sid)
    expired.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    db_session.commit()
    legacy_id = legacy.id
    submission_ids = list(db_session.scalars(select(Submission.id).where(Submission.job_id == jid)))
    assert submission_ids
    assert cleanup(db_session) == 1
    db_session.expire_all()
    assert db_session.get(Job, jid) is None
    assert db_session.get(Agreement, aid) is None
    assert db_session.get(Escrow, eid) is None
    for model in (AuditEvent, Dispute, MatchResult, Submission, LedgerEntry):
        assert db_session.scalars(select(model).where(model.job_id == jid)).all() == []
    assert db_session.scalars(select(Verification).where(Verification.submission_id.in_(submission_ids))).all() == []
    assert db_session.get(Job, legacy_id) is not None
    assert client.get(f"/api/v1/jobs/{live_id}", headers=second).status_code == 200
    assert client.get("/api/v1/jobs", headers=first).status_code == 401
    assert cleanup(db_session) == 0


def test_admin_agent_seed_is_repeatable_and_refuses_private_collision(db_session):
    assert seed_agents(db_session) == 6
    assert seed_agents(db_session) == 0
    first = db_session.scalar(select(Agent).where(Agent.external_id == "demo-agent-001"))
    first.metadata_json = {}
    first.name = "Private profile - never overwrite"
    db_session.commit()
    with pytest.raises(RuntimeError, match="refusing to overwrite"):
        seed_agents(db_session)
    db_session.rollback()
    assert first.name == "Private profile - never overwrite"


def test_capacity_is_reclaimed_only_by_explicit_cleanup(client, db_session, hosted, monkeypatch):
    monkeypatch.setattr(hosted, "demo_max_sessions", 1)
    headers = _session(client)
    assert client.post("/api/v1/demo/session").status_code == 503
    record = db_session.get(DemoSessionRecord, verify_demo_session(headers["X-Demo-Session"]).session_id)
    record.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    db_session.commit()
    assert client.post("/api/v1/demo/session").status_code == 503
    assert cleanup(db_session) == 1
    assert client.post("/api/v1/demo/session").status_code == 200


def test_retry_exhaustion_is_reported_as_blocked(client, db_session, hosted, monkeypatch):
    monkeypatch.setattr(hosted, "max_submission_retries", 0)
    headers = _session(client)
    jid, _, _, _ = _workflow(client, db_session, headers, False)
    state = client.get(f"/api/v1/jobs/{jid}/execution", headers=headers).json()
    assert state["can_submit"] is False
    assert state["execution_status"] == "blocked"
    assert "retry limit" in state["submit_reason"]
    assert client.post(f"/api/v1/jobs/{jid}/submit", headers=headers, json={"submitted_output": "{}"}).status_code == 409


@pytest.mark.parametrize("token", ["", "unsigned", "payload.é", "é.signature", "a.b.c", "x" * 513])
def test_malformed_credentials_are_rejected(token):
    with pytest.raises(ValueError):
        verify_demo_session(token)
