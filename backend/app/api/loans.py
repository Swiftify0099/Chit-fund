from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.loan import LoanRequest, Loan, LoanRequestStatus, LoanStatus
from app.models.share import Share
from app.models.emi import EMISchedule, EMIStatus, Payment
from app.schemas.loan import (
    LoanRequestCreate, LoanRequestApprove, LoanRequestReject,
    LoanRequestOut, LoanOut, PaymentCreate, PaymentOut, UserDashboardOut
)

router = APIRouter(prefix="/loans", tags=["Loans"])


def _compute_used_credit(db: Session, user_id: int) -> float:
    active_loans = db.query(Loan).filter(
        Loan.user_id == user_id,
        Loan.status == LoanStatus.active
    ).all()
    return sum(l.remaining_amount for l in active_loans)


# ─── User: Apply for Loan ─────────────────────────────────────────────────────

@router.post("/request", response_model=LoanRequestOut)
def apply_for_loan(
    payload: LoanRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    share = db.query(Share).filter(Share.user_id == current_user.id).first()
    if not share:
        raise HTTPException(status_code=400, detail="No shares assigned. Cannot apply for loan.")

    used = _compute_used_credit(db, current_user.id)
    available = share.total_credit_limit - used
    if payload.amount_requested > available:
        raise HTTPException(
            status_code=400,
            detail=f"Amount exceeds available credit. Available: ₹{available:.2f}"
        )

    loan_req = LoanRequest(
        user_id=current_user.id,
        amount_requested=payload.amount_requested,
        note=payload.note,
        status=LoanRequestStatus.pending,
    )
    db.add(loan_req)
    db.commit()
    db.refresh(loan_req)
    return loan_req


@router.get("/my-requests", response_model=List[LoanRequestOut])
def my_loan_requests(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(LoanRequest).filter(LoanRequest.user_id == current_user.id).all()


@router.get("/my-loans", response_model=List[LoanOut])
def my_loans(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Loan).filter(Loan.user_id == current_user.id).all()


@router.get("/dashboard", response_model=UserDashboardOut)
def user_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    share = db.query(Share).filter(Share.user_id == current_user.id).first()
    if not share:
        return UserDashboardOut(
            user_id=current_user.id, name=current_user.name,
            num_shares=0, amount_per_share=0, multiplier=0,
            total_credit_limit=0, used_credit=0, available_credit=0, active_loans=[]
        )
    used = _compute_used_credit(db, current_user.id)
    active_loans = db.query(Loan).filter(
        Loan.user_id == current_user.id, Loan.status == LoanStatus.active
    ).all()
    return UserDashboardOut(
        user_id=current_user.id,
        name=current_user.name,
        num_shares=share.num_shares,
        amount_per_share=share.amount_per_share,
        multiplier=share.multiplier,
        total_credit_limit=share.total_credit_limit,
        used_credit=used,
        available_credit=share.total_credit_limit - used,
        active_loans=active_loans,
    )


# ─── Admin: Manage Loan Requests ─────────────────────────────────────────────

@router.get("/admin/requests", response_model=List[LoanRequestOut])
def all_loan_requests(
    status_filter: str = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    q = db.query(LoanRequest)
    if status_filter:
        q = q.filter(LoanRequest.status == status_filter)
    return q.order_by(LoanRequest.created_at.desc()).all()


@router.post("/admin/requests/{request_id}/approve", response_model=LoanOut)
def approve_loan(
    request_id: int,
    payload: LoanRequestApprove,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    loan_req = db.query(LoanRequest).filter(LoanRequest.id == request_id).first()
    if not loan_req:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if loan_req.status != LoanRequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request is not pending")

    loan_req.status = LoanRequestStatus.approved
    loan_req.admin_id = admin.id
    loan_req.repayment_months = payload.repayment_months

    # Create Loan record
    loan = Loan(
        loan_request_id=loan_req.id,
        user_id=loan_req.user_id,
        principal=loan_req.amount_requested,
        remaining_amount=loan_req.amount_requested,
        status=LoanStatus.active,
    )
    db.add(loan)
    db.flush()

    # Generate EMI schedule
    emi_amount = round(loan_req.amount_requested / payload.repayment_months, 2)
    for i in range(1, payload.repayment_months + 1):
        due_date = datetime.utcnow() + timedelta(days=30 * i)
        emi = EMISchedule(
            loan_id=loan.id,
            due_date=due_date,
            amount=emi_amount,
            status=EMIStatus.pending,
        )
        db.add(emi)

    db.commit()
    db.refresh(loan)
    return loan


@router.post("/admin/requests/{request_id}/reject")
def reject_loan(
    request_id: int,
    payload: LoanRequestReject,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    loan_req = db.query(LoanRequest).filter(LoanRequest.id == request_id).first()
    if not loan_req:
        raise HTTPException(status_code=404, detail="Loan request not found")
    if loan_req.status != LoanRequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request is not pending")
    loan_req.status = LoanRequestStatus.rejected
    loan_req.admin_id = admin.id
    loan_req.rejection_reason = payload.rejection_reason
    db.commit()
    return {"message": "Loan request rejected"}


# ─── EMI & Payments ───────────────────────────────────────────────────────────

@router.get("/{loan_id}/emi", response_model=List)
def get_emi_schedule(loan_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if loan.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    emis = db.query(EMISchedule).filter(EMISchedule.loan_id == loan_id).order_by(EMISchedule.due_date).all()
    return [{"id": e.id, "due_date": str(e.due_date), "amount": e.amount,
             "status": e.status, "paid_at": str(e.paid_at) if e.paid_at else None,
             "penalty_amount": e.penalty_amount} for e in emis]


@router.post("/admin/payments/confirm/{payment_id}", response_model=PaymentOut)
def confirm_payment(payment_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.confirmed_by_admin = True
    payment.confirmed_at = datetime.utcnow()

    # Update EMI status
    if payment.emi_id:
        emi = db.query(EMISchedule).filter(EMISchedule.id == payment.emi_id).first()
        if emi:
            emi.status = EMIStatus.paid
            emi.paid_at = datetime.utcnow()

    # Reduce loan remaining_amount
    loan = db.query(Loan).filter(Loan.id == payment.loan_id).first()
    if loan:
        loan.remaining_amount = max(0, loan.remaining_amount - payment.amount_paid)
        if loan.remaining_amount == 0:
            loan.status = LoanStatus.completed

    db.commit()
    db.refresh(payment)
    return payment
