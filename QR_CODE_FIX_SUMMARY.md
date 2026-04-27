# 🚀 QR Code Scanning - "Something Went Wrong" FIX

## Problem
When scanning the QR code to run your app via Expo tunnel on your mobile device in GitHub Codespace, you get: **"something went wrong"** error.

## Root Cause
The mobile app **cannot connect to the backend API** because:
- Port 8000 (backend) is **PRIVATE** instead of PUBLIC
- The tunnel connection exists but API calls timeout
- The frontend can't reach the backend to authenticate

---

## ✅ IMMEDIATE FIX (Do This First)

### Step 1: Make Ports Public
```bash
# Run this in terminal:
gh codespace ports visibility 8000:public 8081:public
```

**OR manually:**
1. Click the **Ports** tab (next to Terminal tab)
2. Right-click **Port 8000** → "Port Visibility" → **"Public"**
3. Right-click **Port 8081** → "Port Visibility" → **"Public"**

### Step 2: Run the App
```bash
cd /workspaces/Chit-fund
./run_project.sh
```

### Step 3: Access on Mobile
**Option A (Recommended - More Reliable):**
1. Open phone browser (Safari/Chrome)
2. Visit: `https://YOUR_CODESPACE_NAME-8081.app.github.dev`
3. Tap "Open in Expo Go" button
4. Login with credentials

**Option B (Scan QR Code):**
1. Get the QR code from terminal
2. Scan with Expo Go app on your phone
3. This should now work since ports are public

---

## 📝 What I Fixed in Your Code

### 1. **mobile/services/api.ts**
- ✅ Added dynamic backend URL configuration
- ✅ Added debug logging to see actual API calls
- ✅ Better error detection for connection issues
- ✅ Environment variable support for tunnel URL

```typescript
// Before: Hardcoded URL
export const BASE_URL = "https://glorious-xylophone-69v5vx7xjqgrcxq6w-8000.app.github.dev";

// After: Dynamic + Debug Logs
export const BASE_URL = getBackendURL();
// Logs all API calls and errors with details
```

### 2. **mobile/app/(auth)/login.tsx**
- ✅ Better error messages with actionable fixes
- ✅ Detects port visibility issues automatically
- ✅ Shows backend URL being used
- ✅ Helpful troubleshooting tips in error alerts

```
Before: "Login Failed"
After: "❌ Port Blocked: GitHub Codespaces access denied.
        ✅ Fix: Go to Ports tab..."
```

### 3. **run_project.sh**
- ✅ Automatically sets environment variables
- ✅ Better instructions for tunnel setup
- ✅ Shows clear steps for mobile access
- ✅ Added port visibility reminders

### 4. **New Helper Scripts**
- ✅ `quick_fix.sh` - One-click port visibility fix
- ✅ `troubleshoot_tunnel.sh` - Diagnose connection issues
- ✅ `TUNNEL_FIX_GUIDE.md` - Comprehensive guide

---

## 🔍 Debug Information

When you get an error now, the app will:
1. Log detailed error info (check console in Expo Go)
2. Show which backend URL it's trying to connect to
3. Tell you the exact HTTP status code
4. Suggest how to fix it

Check terminal logs with:
```bash
# While app is running, check network requests:
npx expo start --tunnel  # Look for "📤 API Request" and "✅ API Response"
```

---

## 🛠️ Troubleshooting

### Still getting "something went wrong"?

**Check 1: Port Visibility**
```bash
# Verify ports are public
gh codespace ports list
# Should show: Port 8000 FORWARDED PUBLIC and Port 8081 FORWARDED PUBLIC
```

**Check 2: Backend is Running**
```bash
# In codespace terminal
curl https://$CODESPACE_NAME-8000.app.github.dev/
# Should return: {"status":"ok","service":"Chit Fund API v1.0"}
```

**Check 3: Frontend Accessible**
```bash
# Visit in phone browser
https://$CODESPACE_NAME-8081.app.github.dev
# Should show Expo Go app interface
```

**Check 4: Backend Logs**
```bash
# Watch backend logs while logging in
# Look for requests coming through on port 8000
```

---

## 📱 How to Use

### First Time Setup:
```bash
# 1. Terminal 1: Fix ports
./quick_fix.sh

# 2. Terminal 2: Run project
./run_project.sh

# 3. On phone:
# Visit: https://YOUR_CODESPACE_NAME-8081.app.github.dev
# Tap "Open in Expo Go"
# Login with credentials
```

### After Every Restart:
Just make sure ports are still public, then:
```bash
./run_project.sh
```

---

## 🎯 Summary

| Issue | Solution |
|-------|----------|
| "Something went wrong" on mobile | Make ports PUBLIC |
| Can't reach backend | Check Port 8000 is public |
| Can't see Expo Go web page | Check Port 8081 is public |
| Network error when logging in | Verify ports are PUBLIC |
| QR code won't work | Make ports public first, then try again |

---

## ✨ New Files Created

1. **TUNNEL_FIX_GUIDE.md** - Complete troubleshooting guide
2. **quick_fix.sh** - One-command port fixer
3. **troubleshoot_tunnel.sh** - Diagnostic tool

## 📝 Files Modified

1. **mobile/services/api.ts** - Dynamic URL + debug logging
2. **mobile/app/(auth)/login.tsx** - Better error messages
3. **run_project.sh** - Improved instructions and setup

---

## 🚀 Next Steps

1. **Make ports public** (most important!)
2. Run `./run_project.sh`
3. Open mobile app via browser link
4. Try scanning QR code
5. If still issues, share console logs from Expo Go

**The fix is now in place - ports being public is the key! 🔑**
