# Digital Bishi / Chit Fund + Credit Management Platform

A production-ready mobile + backend system built with **React Native (Expo + NativeWind)** and **FastAPI + PostgreSQL**.

---

## 🏗️ Project Structure

```
Chit-Fund/
├── backend/          ← FastAPI + PostgreSQL
└── mobile/           ← React Native (Expo + NativeWind)
```

---

## 🚀 Backend Setup

### Prerequisites
- Python 3.11+
- PostgreSQL running locally

### 1. Create database
```sql
CREATE DATABASE chitfund_db;
```

### 2. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure environment
Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/chitfund_db
SECRET_KEY=your-super-secret-key-here
```

### 4. Run backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tables are auto-created on first run.

### 5. Seed default themes
```bash
# After starting server, call:
POST http://localhost:8000/themes/seed-defaults
# with Admin JWT in Authorization header
```

### 6. Create first Admin user
Use the Swagger UI at `http://localhost:8000/docs`
- POST `/auth/register` is not exposed (security)
- Directly insert via SQL or create via admin API after seeding first admin manually

### API Docs
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📱 Mobile Setup

### Prerequisites
- Node.js 20.19.4+
- Expo CLI: `npm install -g expo-cli`
- Android Studio / Xcode (for emulator) or Expo Go app

### 1. Install dependencies
```bash
cd mobile
npm install
```

### 2. Set your backend IP
Edit `services/api.ts`:
```ts
export const BASE_URL = "http://YOUR_LOCAL_IP:8000";
```
> Use your machine's local network IP (e.g. 192.168.1.x), not `localhost`

### 3. Run
```bash
npx expo start
```
Scan QR with Expo Go or press `a` for Android emulator.

---

## 🔥 Firebase Push Notifications

1. Create a Firebase project at https://console.firebase.google.com
2. Add Android/iOS app
3. Download `google-services.json` → place in `mobile/`
4. Download service account key → save as `backend/firebase-credentials.json`
5. Notifications will auto-send via FCM on loan approval/rejection

---

## 📋 API Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/auth/refresh` | Refresh token |
| GET | `/users/me` | Get current user |
| POST | `/admin/users` | Create user (admin) |
| POST | `/admin/shares` | Assign shares + credit limit |
| POST | `/loans/request` | Apply for loan (user) |
| GET | `/loans/dashboard` | User credit dashboard |
| GET | `/loans/admin/requests` | All loan requests (admin) |
| POST | `/loans/admin/requests/{id}/approve` | Approve + generate EMI |
| POST | `/loans/admin/requests/{id}/reject` | Reject loan |
| GET | `/loans/{id}/emi` | EMI schedule |
| POST | `/notifications/send` | Send push notification |
| GET | `/themes/active` | Get active theme |
| POST | `/themes/seed-defaults` | Seed 10 default themes |
| POST | `/themes/banners/upload` | Upload banner |
| GET | `/themes/banners` | List banners |
| POST | `/themes/banners/view` | Track banner view |

---

## 💡 Business Logic

- **Credit Limit** = `num_shares × amount_per_share × multiplier`
- **Available Credit** = `total_credit_limit - Σ(active loan remaining amounts)`
- **EMI** = `loan_amount / repayment_months` (equal installments)
- **Banner Charge** = `total_views × cost_per_view`
- **Revolving Credit**: User can take multiple independent loans until limit is reached

---

## 🎨 Default Themes

| # | Name | Background | Accent |
|---|------|-----------|--------|
| 1 | Midnight Blue | #0F1629 | #6C63FF |
| 2 | Deep Purple | #1A0A2E | #9B59B6 |
| 3 | Forest Dark | #0D1F12 | #27AE60 |
| 4 | Royal Gold | #1C1507 | #F39C12 |
| 5 | Ocean Depth | #071A2C | #2E86AB |
| 6 | Rose Noir | #1C0A0A | #E74C3C |
| 7 | Arctic White | #F0F4F8 | #4299E1 |
| 8 | Slate Modern | #1E293B | #38BDF8 |
| 9 | Amber Warm | #1C1300 | #D97706 |
| 10 | Cyber Teal | #001219 | #0A9396 |
