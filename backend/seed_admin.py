"""
Seed script — run ONCE to create the first admin user.
Usage:
    cd backend
    python seed_admin.py
"""
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
import app.models  # noqa — ensure all models registered

db = SessionLocal()

existing = db.query(User).filter(User.phone == "9999999999").first()
if existing:
    print(f"Admin already exists: {existing.name} (id={existing.id})")
else:
    admin = User(
        name="Super Admin",
        phone="9999999999",
        email="admin@chitfund.com",
        password_hash=hash_password("Admin@123"),
        role=UserRole.admin,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"✅ Admin created! id={admin.id}  phone=9999999999  password=Admin@123")

db.close()
