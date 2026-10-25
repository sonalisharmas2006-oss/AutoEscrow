"""FastAPI application entry point for Auto Escrow."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.v1 import router as v1_router
from app.config import get_frontend_origins, get_settings
from app.demo_limits import DemoLimits

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", description="AI-agent agreements and simulated escrow. Synthetic prototype only.")
app.include_router(health_router, prefix="/api")
app.include_router(v1_router)
app.add_middleware(DemoLimits)

# CORS must wrap admission errors too, so the frontend can explain 413/429.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://autoescrowfrontend.vercel.app",  # Your production Vercel frontend URL
        "http://localhost:3000",                  # Local development
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-Demo-Session", "X-Demo-Operator", "Authorization"],
)


@app.get("/", tags=["meta"])
def root():
    return {"name": settings.app_name, "docs": "/docs", "health": "/api/health", "readiness": "/api/ready"}