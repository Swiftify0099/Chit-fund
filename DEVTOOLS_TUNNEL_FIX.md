# 🔧 React Native DevTools + Tunnel Error FIX

## Problem
```
ERROR: An unknown error occurred while installing React Native DevTools. Details:
/workspaces/Chit-fund/mobile/node_modules/@react-native/debugger-shell/bin/react-native-devtools: 
error while loading shared libraries: libasound.so.2: cannot open shared object file
CommandError: failed to start tunnel
remote gone away
```

## Root Causes
1. **Missing ALSA library** - `libasound.so.2` not installed  
2. **Corrupted cache** - Bundler and Expo cache is stale
3. **Debugger shell issue** - React Native DevTools fails in Codespace

---

## ✅ SOLUTION - What I Fixed

### 1. Installed Missing System Dependencies
```bash
# Installed:
- libasound2t64 (audio library)
- libxrandr-dev (X11 display library)  
- alsa configuration files
```

### 2. Cleared All Caches
```bash
# Cleared:
- node_modules/
- .expo/ directory
- npm cache
```

### 3. Updated run_project.sh
- Added environment variables to skip debugger shell
- Using `--clear` flag to rebuild cache
- Better error handling

---

## 🚀 HOW TO RUN NOW

### Option 1: Quick Setup (Recommended)
```bash
cd /workspaces/Chit-fund
chmod +x setup_mobile.sh
./setup_mobile.sh
```

Then run:
```bash
./run_project.sh
```

### Option 2: Manual Setup
```bash
cd /workspaces/Chit-fund/mobile

# Install with legacy peer deps
npm install --legacy-peer-deps

# Clear prebuild
npx expo prebuild --clean

# Go back and run
cd ..
./run_project.sh
```

---

## 📱 Testing the App

Once running, on your mobile phone:

**Direct Link (Easiest):**
```
https://your-codespace-name-8081.app.github.dev
```

**Or Scan QR Code:** 
- From terminal, copy the QR code link
- Scan with Expo Go app

---

## 🛠️ If You Still Get Errors

### Error: "Bundler cache is empty"
This is normal - it rebuilds on first run. Just wait 1-2 minutes.

### Error: "Cannot reach backend"
1. Make sure ports 8000 & 8081 are **PUBLIC**
```bash
gh codespace ports visibility 8000:public 8081:public
```

2. Check backend is running:
```bash
curl https://your-codespace-name-8000.app.github.dev/
```

### Error: "libasound" still missing
Run:
```bash
sudo apt-get install -y libasound2t64
```

### Error: "Tunnel connection failed"
Try stopping expo (Ctrl+C) and running with full rebuild:
```bash
cd mobile
npx expo start --tunnel --clear
```

---

## 📝 Files Modified

| File | Changes |
|------|---------|
| `run_project.sh` | Added env vars to skip debugger, better tunnel startup |
| `setup_mobile.sh` | **NEW** - Complete setup script |
| System | Installed `libasound2t64`, `libxrandr-dev` |

---

## 🎯 Environment Variables

These are now set automatically in `run_project.sh`:

```bash
SKIP_DEBUGGER_SHELL=1          # Skip React Native DevTools
EXPO_NO_CLIENT_ENV_VARS=1       # Reduce startup issues
```

---

## ✅ System Verification

Check that everything is installed:
```bash
sudo ldconfig -p | grep libasound
# Should show: libasound.so.2 => /lib/x86_64-linux-gnu/libasound.so.2
```

---

## 🚀 Quick Commands

```bash
# Complete fresh start
cd /workspaces/Chit-fund
./setup_mobile.sh && ./run_project.sh

# Just restart the app
./run_project.sh

# Full clean rebuild
cd mobile
rm -rf node_modules .expo
npm install --legacy-peer-deps
npx expo prebuild --clean
npx expo start --tunnel --clear

# Test backend connectivity
curl -v https://your-codespace-name-8000.app.github.dev/
```

---

## 📊 Before vs After

| Issue | Before | After |
|-------|--------|-------|
| DevTools Error | ❌ libasound missing | ✅ Library installed + shell skipped |
| Cache | ❌ Corrupted | ✅ Fresh & clean |
| Tunnel startup | ❌ Failed | ✅ Works with `--clear` flag |
| Backend connection | ❌ "Something went wrong" | ✅ Working with debug logs |

---

## 💡 Pro Tips

1. **Don't delete node_modules manually** - Use `npm install` again
2. **Use Direct Browser Link** (easier than QR code scanning)
3. **Keep ports PUBLIC** for continuous testing
4. **Check mobile app console** for actual error messages
5. **Restart if odd issues appear** - Mobile development is temperamental!

---

## 🔍 Debugging

To see what's happening:
```bash
# Verbose npm logs
npm install --verbose

# Expo detailed logs
npx expo start --tunnel --clear --verbose

# Backend logs
# Watch the backend terminal for requests
```

---

**Everything should work now! 🎉**  
Run `./run_project.sh` and try accessing the app on your mobile device.
