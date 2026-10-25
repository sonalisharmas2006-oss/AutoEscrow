"""Agent persistence queries."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Agent


def list_agents(
    db: Session,
    *,
    status: str | None = None,
    availability: str | None = None,
    skip: int = 0,
    limit: int = 100,
    synthetic_only: bool = False,
) -> tuple[list[Agent], int]:
    query = select(Agent)
    count_query = select(func.count()).select_from(Agent)
    if status:
        query = query.where(Agent.status == status)
        count_query = count_query.where(Agent.status == status)
    if availability:
        query = query.where(Agent.availability == availability)
        count_query = count_query.where(Agent.availability == availability)
    # JSON filtering differs between SQLite and PostgreSQL. The public registry
    # is small, so apply the safety filter in Python for identical behavior.
    agents = list(db.scalars(query.order_by(Agent.id)).all())
    if synthetic_only:
        agents = [agent for agent in agents if (agent.metadata_json or {}).get("synthetic") is True]
    total = len(agents)
    agents = agents[skip : skip + limit]
    return agents, total


def get_agent(db: Session, agent_id: int, *, synthetic_only: bool = False) -> Agent | None:
    agent = db.get(Agent, agent_id)
    if synthetic_only and agent is not None and (agent.metadata_json or {}).get("synthetic") is not True:
        return None
    return agent
