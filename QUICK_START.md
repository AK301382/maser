# ⚡ شروع سریع - MASER Project

## 🚀 3 دستور برای اجرا

### 1️⃣ نصب وابستگی‌ها (یکبار):

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd ../frontend
yarn install
```

### 2️⃣ ساخت فایل‌های .env:

**backend/.env:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=masir_database
JWT_SECRET=your-secret-key
CORS_ORIGINS=*
```

**frontend/.env:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3000
```

### 3️⃣ اجرا (3 ترمینال):

```bash
# ترمینال 1: MongoDB
mongod

# ترمینال 2: Backend
cd backend
uvicorn server:app --reload --port 8001

# ترمینال 3: Frontend
cd frontend
yarn start
```

## ✅ تست

- Backend: http://localhost:8001/api/docs
- Frontend: http://localhost:3000

## 🔥 حل مشکل "Module not found: shared"

اگر این خطا را گرفتید:

```bash
# 1. ساخت پوشه‌ها
cd frontend/src
mkdir -p shared/utils
mkdir -p shared/constants

# 2. کپی فایل‌ها از /app/shared به frontend/src/shared
# یا از روت پروژه:
cp -r shared/utils/apiClient.js frontend/src/shared/utils/
cp -r shared/constants/api.js frontend/src/shared/constants/

# 3. پاک کردن cache
cd frontend
rm -rf node_modules/.cache
yarn start
```

## 📝 اکانت تست

```
Email: test@maser.com
Password: test123
```

---

**نکته مهم:** فایل‌های shared باید داخل `frontend/src/shared/` باشند، نه در روت پروژه!
