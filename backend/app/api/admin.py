from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import hash_password, require_admin, get_current_user
from app.models.user import User
from app.models.share import Share
from app.schemas.user import UserCreate, UserOut, ShareCreate, ShareUpdate, ShareOut

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── User Management ──────────────────────────────────────────────────────────

@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(User).filter(User.phone == payload.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")
    user = User(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=List[UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(User).offset(skip).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}/toggle-active", response_model=UserOut)
def toggle_user_active(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user


# ─── Share / Credit Management ────────────────────────────────────────────────

@router.post("/shares", response_model=ShareOut)
def assign_shares(payload: ShareCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    share = db.query(Share).filter(Share.user_id == payload.user_id).first()
    total_credit = payload.num_shares * payload.amount_per_share * payload.multiplier

    if share:
        share.num_shares = payload.num_shares
        share.amount_per_share = payload.amount_per_share
        share.multiplier = payload.multiplier
        share.total_credit_limit = total_credit
    else:
        share = Share(
            user_id=payload.user_id,
            num_shares=payload.num_shares,
            amount_per_share=payload.amount_per_share,
            multiplier=payload.multiplier,
            total_credit_limit=total_credit,
        )
        db.add(share)

    db.commit()
    db.refresh(share)
    return share


@router.get("/shares/{user_id}", response_model=ShareOut)
def get_shares(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    share = db.query(Share).filter(Share.user_id == user_id).first()
    if not share:
        raise HTTPException(status_code=404, detail="No shares assigned")
    return share
