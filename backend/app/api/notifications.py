from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
from app.core.database import get_db
from app.core.security import require_admin, get_current_user
from app.models.notification import Notification, NotificationTarget
from app.models.user import User
from app.schemas.misc import NotificationSend, NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Try to import Firebase Admin — optional (warn if not configured)
_FCM_ENABLED = False
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    _CRED_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
    if os.path.exists(_CRED_PATH) and not firebase_admin._apps:
        cred = credentials.Certificate(_CRED_PATH)
        firebase_admin.initialize_app(cred)
    _FCM_ENABLED = bool(firebase_admin._apps)
except Exception:
    pass


def _send_fcm(token: str, title: str, body: str):
    if not _FCM_ENABLED or not token:
        return
    try:
        from firebase_admin import messaging
        msg = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=token,
        )
        messaging.send(msg)
    except Exception as e:
        print(f"FCM error: {e}")


def _send_fcm_multicast(tokens: List[str], title: str, body: str):
    if not _FCM_ENABLED or not tokens:
        return
    try:
        from firebase_admin import messaging
        msg = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            tokens=tokens,
        )
        messaging.send_each_for_multicast(msg)
    except Exception as e:
        print(f"FCM multicast error: {e}")


@router.post("/send", response_model=NotificationOut)
def send_notification(
    payload: NotificationSend,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    notif = Notification(
        title=payload.title,
        body=payload.body,
        target=payload.target,
        user_id=payload.user_id if payload.target == NotificationTarget.user else None,
        type=payload.type,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    if payload.target == NotificationTarget.user:
        if not payload.user_id:
            raise HTTPException(status_code=400, detail="user_id required for single-user notification")
        user = db.query(User).filter(User.id == payload.user_id).first()
        if user and user.fcm_token:
            _send_fcm(user.fcm_token, payload.title, payload.body)
    else:
        tokens = [u.fcm_token for u in db.query(User).filter(User.fcm_token.isnot(None)).all()]
        _send_fcm_multicast(tokens, payload.title, payload.body)

    return notif


@router.get("/", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(Notification).order_by(Notification.sent_at.desc()).limit(100).all()


@router.get("/my", response_model=List[NotificationOut])
def list_my_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Notification).filter(
        (Notification.target == NotificationTarget.all) | 
        ((Notification.target == NotificationTarget.user) & (Notification.user_id == current_user.id))
    ).order_by(Notification.sent_at.desc()).limit(50).all()


@router.patch("/fcm-token")
def update_fcm_token(
    token: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    current_user.fcm_token = token
    db.commit()
    return {"message": "FCM token updated"}
