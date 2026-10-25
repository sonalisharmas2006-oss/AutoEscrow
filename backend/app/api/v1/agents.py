"""Agent API endpoints."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.demo_auth import get_demo_session
from app.schemas import AgentListResponse, AgentSummary
from app.services.agents import get_agent, list_agents

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=AgentListResponse, summary="List registered agents")
def list_registered_agents(
    request: Request,
    status: Literal["active", "inactive", "suspended"] | None = Query(default=None),
    availability: Literal["available", "busy", "unavailable"] | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
) -> AgentListResponse:
    session_id = get_demo_session(request)
    agents, total = list_agents(
        db,
        status=status,
        availability=availability,
        skip=skip,
        limit=limit,
        synthetic_only=session_id is not None,
    )
    return AgentListResponse(items=[_safe_summary(agent, bool(session_id)) for agent in agents], total=total)


@router.get("/{agent_id}", response_model=AgentSummary, summary="Get an agent")
def get_registered_agent(agent_id: int, request: Request, db: Session = Depends(get_db)) -> AgentSummary:
    session_id = get_demo_session(request)
    agent = get_agent(db, agent_id, synthetic_only=session_id is not None)
    if agent is None:
        raise HTTPException(status_code=404, detail="agent not found")
    return _safe_summary(agent, bool(session_id))


def _safe_summary(agent, scoped: bool):
    summary = AgentSummary.model_validate(agent)
    if scoped:
        summary.endpoint_url = None
        summary.metadata = {"synthetic": True}
    return summary
