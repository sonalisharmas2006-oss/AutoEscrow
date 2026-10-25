"""Version 1 API routers."""

from fastapi import APIRouter, Depends
from app.demo_auth import enforce_demo_session

from app.api.v1 import agents, agreements, dashboard, disputes, escrows, execution, jobs, demo

router = APIRouter(prefix="/api/v1", dependencies=[Depends(enforce_demo_session)])
router.include_router(agents.router)
router.include_router(jobs.router)
router.include_router(agreements.router)
router.include_router(escrows.router)
router.include_router(execution.router)
router.include_router(disputes.router)
router.include_router(dashboard.router)
router.include_router(demo.router)

__all__ = ["router"]
