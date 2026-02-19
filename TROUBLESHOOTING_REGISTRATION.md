# 🔧 Troubleshooting Guide: Registration Failed / OTP Error

## ✅ Backend Status
The backend API is **working perfectly**. All tests pass:
- ✅ OTP sending works
- ✅ OTP verification works
- ✅ Account creation works
- ✅ Login works
- ✅ Dashboard access works

**See: `test-full-signup.js` output above**

---

## ❌ Frontend Issue: "Registration Failed" / "Failed to send OTP"

If you're seeing these errors on the website, it means the **frontend is not properly calling the backend API**.

### Possible Causes:

#### 1. **Frontend Dev Server Not Running**
The React dev server on port 5173 is not running.

**Solution:**
```bash
npm run dev
```
or
```bash
node node_modules\vite\bin\vite.js
```

**Verify it's running:**
- Open http://localhost:5173 in your browser
- Check if the signup page loads

---

#### 2. **Stale/Cached Code**
The frontend was built with old code that doesn't call the API correctly.

**Solution:**
```bash
# Delete cache and rebuild
rm -rf dist
npm run build
```

or simply ensure the dev server is running with latest code:
```bash
npm run dev
```

---

#### 3. **API Endpoint URL Mismatch**
The frontend might be pointing to a different API endpoint.

**Check in Signup.tsx (lines 140, 159):**
```tsx
// Should be:
fetch('http://localhost:4000/api/auth/send-otp', ...)
fetch('http://localhost:4000/api/auth/verify-otp', ...)
```

---

#### 4. **CORS Issue**
The backend might not be allowing requests from the frontend.

**Check in server/index.js (line 20):**
```javascript
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 
                        process.env.VITE_FRONTEND_ORIGIN || 
                        'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
```

**Solution:** Ensure backend is running with proper CORS config.

---

#### 5. **Backend Server Not Running**
The backend API on port 4000 is not running.

**Solution:**
```bash
node server/index.js
```

**Verify it's running:**
```bash
netstat -an | findstr :4000
# or
Get-NetTcpConnection -LocalPort 4000 -ErrorAction SilentlyContinue
```

---

## ✅ Quick Fix Checklist

Run these commands in order:

```bash
# 1. Make sure you're in the right directory
cd c:\Users\PC\Desktop\vertexprime-capital

# 2. Start the backend server (in one terminal)
node server/index.js
# Should see: ✅ Connected to MongoDB
#            🚀 API listening on 4000

# 3. Start the frontend dev server (in another terminal)
npm run dev
# Should see: ✨ Vite dev server listening on http://localhost:5173

# 4. Open the browser
# Go to: http://localhost:5173
# Try signup - it should now work!
```

---

## 🧪 Manual Testing Without Frontend

If you want to test the API without the frontend:

```bash
node test-full-signup.js
```

This simulates the entire signup flow and shows you exactly what the API expects.

---

## 📊 Recent Changes Made

1. **Updated Signup.tsx** to properly handle API responses
2. **Added error messages** from API to frontend
3. **Auto-fill OTP in dev mode** for testing
4. **Improved error handling** in both handleSubmit and handleVerifyOtp
5. **Fixed authController.js** OTP generation and email sending

---

## 🚀 Next Steps

Once the frontend is working:

1. ✅ Test signup flow in browser
2. ✅ Test login redirect to dashboard
3. ✅ Test OTP auto-fill in dev mode
4. ✅ Verify dual database (MongoDB + db.json) sync

---

## 📞 Still Having Issues?

Check these logs:

**Frontend Errors:**
- Open DevTools (F12) → Console tab
- Look for network errors or JavaScript errors

**Backend Errors:**
- Check the terminal where `node server/index.js` is running
- Look for error messages

---

**Last Updated:** February 19, 2026
**Status:** All backend tests passing ✅
