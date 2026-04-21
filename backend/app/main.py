from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from app.core.database import Base, engine
from app.core.config import settings

# Import all models so Alembic / SQLAlchemy sees them
import app.models  # noqa: F401

# Import routers
from app.api import auth, admin, loans, themes, notifications, users

# Create upload directory
os.makedirs(os.path.join(settings.UPLOAD_DIR, "banners"), exist_ok=True)

# Create all tables (dev convenience — use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Digital Bishi / Chit Fund API",
    description="Production-ready Chit Fund + Credit Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded banners
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

# Register routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(loans.router)
app.include_router(themes.router)
app.include_router(notifications.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "Chit Fund API v1.0"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
