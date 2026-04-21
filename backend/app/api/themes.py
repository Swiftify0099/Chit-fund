from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os, uuid, aiofiles
from app.core.database import get_db
from app.core.security import require_admin, get_current_user
from app.core.config import settings
from app.models.theme import Theme, Banner, BannerView
from app.schemas.misc import ThemeCreate, ThemeUpdate, ThemeOut, BannerOut, BannerViewCreate

router = APIRouter(prefix="/themes", tags=["Themes & Banners"])

# ─── Themes ───────────────────────────────────────────────────────────────────

DEFAULT_THEMES = [
    {"name": "Midnight Blue",  "bg_color": "#0F1629", "text_color": "#FFFFFF", "highlight_color": "#6C63FF"},
    {"name": "Deep Purple",    "bg_color": "#1A0A2E", "text_color": "#E8E8E8", "highlight_color": "#9B59B6"},
    {"name": "Forest Dark",   "bg_color": "#0D1F12", "text_color": "#FFFFFF", "highlight_color": "#27AE60"},
    {"name": "Royal Gold",    "bg_color": "#1C1507", "text_color": "#FFF8E1", "highlight_color": "#F39C12"},
    {"name": "Ocean Depth",   "bg_color": "#071A2C", "text_color": "#E8F4FD", "highlight_color": "#2E86AB"},
    {"name": "Rose Noir",     "bg_color": "#1C0A0A", "text_color": "#FFE4E4", "highlight_color": "#E74C3C"},
    {"name": "Arctic White",  "bg_color": "#F0F4F8", "text_color": "#1A202C", "highlight_color": "#4299E1"},
    {"name": "Slate Modern",  "bg_color": "#1E293B", "text_color": "#F1F5F9", "highlight_color": "#38BDF8"},
    {"name": "Amber Warm",    "bg_color": "#1C1300", "text_color": "#FEF3C7", "highlight_color": "#D97706"},
    {"name": "Cyber Teal",    "bg_color": "#001219", "text_color": "#E9F5F9", "highlight_color": "#0A9396"},
]


@router.post("/seed-defaults")
def seed_default_themes(db: Session = Depends(get_db), _=Depends(require_admin)):
    count = db.query(Theme).count()
    if count >= 10:
        return {"message": "Default themes already seeded"}
    for i, t in enumerate(DEFAULT_THEMES):
        theme = Theme(**t, is_active=(i == 0))
        db.add(theme)
    db.commit()
    return {"message": "10 default themes created"}


@router.get("/", response_model=List[ThemeOut])
def list_themes(db: Session = Depends(get_db)):
    return db.query(Theme).all()


@router.get("/active", response_model=ThemeOut)
def get_active_theme(db: Session = Depends(get_db)):
    theme = db.query(Theme).filter(Theme.is_active == True).first()
    if not theme:
        raise HTTPException(status_code=404, detail="No active theme")
    return theme


@router.post("/", response_model=ThemeOut)
def create_theme(payload: ThemeCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    theme = Theme(**payload.model_dump())
    db.add(theme)
    db.commit()
    db.refresh(theme)
    return theme


@router.patch("/{theme_id}", response_model=ThemeOut)
def update_theme(theme_id: int, payload: ThemeUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(theme, k, v)
    db.commit()
    db.refresh(theme)
    return theme


@router.patch("/{theme_id}/activate")
def activate_theme(theme_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    db.query(Theme).update({Theme.is_active: False})
    theme = db.query(Theme).filter(Theme.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    theme.is_active = True
    db.commit()
    return {"message": f"Theme '{theme.name}' activated"}


# ─── Banners ─────────────────────────────────────────────────────────────────

@router.post("/banners/upload", response_model=BannerOut)
async def upload_banner(
    title: str = Form(...),
    client_name: Optional[str] = Form(None),
    cost_per_view: float = Form(0.0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    # Validate file size (max 10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB allowed.")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "banners")
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    banner = Banner(
        title=title,
        image_url=f"/static/banners/{filename}",
        client_name=client_name,
        cost_per_view=cost_per_view,
        is_active=True,
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return BannerOut(**banner.__dict__, total_views=0, total_charge=0.0)


@router.get("/banners", response_model=List[BannerOut])
def list_banners(active_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(Banner)
    if active_only:
        q = q.filter(Banner.is_active == True)
    banners = q.all()
    result = []
    for b in banners:
        views = len(b.views)
        charge = views * b.cost_per_view
        result.append(BannerOut(**b.__dict__, total_views=views, total_charge=charge))
    return result


@router.patch("/banners/{banner_id}/toggle")
def toggle_banner(banner_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    banner.is_active = not banner.is_active
    db.commit()
    return {"is_active": banner.is_active}


@router.post("/banners/view")
def track_banner_view(payload: BannerViewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    view = BannerView(
        banner_id=payload.banner_id,
        user_id=current_user.id if current_user else None,
        session_id=payload.session_id,
        device_info=payload.device_info,
    )
    db.add(view)
    db.commit()
    banner = db.query(Banner).filter(Banner.id == payload.banner_id).first()
    if banner:
        total_views = len(banner.views)
        return {"total_views": total_views, "charge": total_views * banner.cost_per_view}
    return {"message": "View tracked"}
