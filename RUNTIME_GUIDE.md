# 🚀 راهنمای اجرای پروژه MASER در محیط Emergent

## ✅ وضعیت فعلی

پروژه MASER با موفقیت در `/app` نصب و راه‌اندازی شده است.

---

## 📊 سرویس‌های در حال اجرا

### 1. Backend API
- **پورت:** 8001
- **URL:** http://localhost:8001
- **API Docs:** http://localhost:8001/api/docs
- **وضعیت:** ✅ RUNNING

### 2. Frontend (Web App)
- **پورت:** 3000
- **URL داخلی:** http://localhost:3000
- **URL عمومی:** https://route-registry-1.preview.emergentagent.com
- **وضعیت:** ✅ RUNNING

### 3. MongoDB
- **پورت:** 27017
- **URL:** mongodb://localhost:27017
- **دیتابیس:** masir_database
- **وضعیت:** ✅ RUNNING

### 4. Admin Panel
- **پورت:** 3001
- **دایرکتوری:** /app/admin-panel
- **وضعیت:** ⚠️ نصب شده اما نیاز به اجرای دستی دارد

---

## 🎯 دستورات مدیریت سرویس‌ها

### مشاهده وضعیت همه سرویس‌ها
```bash
sudo supervisorctl status
```

### ریستارت همه سرویس‌ها
```bash
sudo supervisorctl restart all
```

### ریستارت Backend
```bash
sudo supervisorctl restart backend
```

### ریستارت Frontend
```bash
sudo supervisorctl restart frontend
```

### مشاهده لاگ Backend
```bash
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log
```

### مشاهده لاگ Frontend
```bash
tail -f /var/log/supervisor/frontend.out.log
tail -f /var/log/supervisor/frontend.err.log
```

---

## 🔧 اجرای Admin Panel (دستی)

Admin Panel در supervisor پیکربندی نشده است. برای اجرا:

```bash
# ترمینال جدید باز کنید
cd /app/admin-panel
PORT=3001 yarn start
```

یا در background:
```bash
cd /app/admin-panel
nohup yarn start > /tmp/admin-panel.log 2>&1 &
```

---

## 🧪 تست API

### Health Check
```bash
curl http://localhost:8001/api/health
```

### ثبت کاربر جدید
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456","full_name":"نام کاربر"}'
```

### ورود
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"123456"}'
```

---

## 👤 حساب‌های کاربری تست

### کاربر عادی
```
Email: test@maser.com
Password: 123456
```

### مدیر سیستم
```
Email: admin@maser.com
Password: 123456
```

---

## 📁 ساختار پروژه

```
/app/
├── backend/              # FastAPI Backend (Port 8001)
│   ├── .env              # تنظیمات Backend
│   ├── server.py         # سرور اصلی
│   ├── models.py         # مدل‌های Pydantic
│   ├── database.py       # اتصال به MongoDB
│   ├── config.py         # تنظیمات
│   ├── middleware.py     # Middleware ها
│   └── requirements.txt  # وابستگی‌های Python
│
├── frontend/             # React Web App (Port 3000)
│   ├── .env              # تنظیمات Frontend
│   ├── src/
│   │   ├── pages/        # صفحات React
│   │   ├── components/   # کامپوننت‌های قابل استفاده مجدد
│   │   ├── context/      # React Context
│   │   ├── services/     # سرویس‌های API
│   │   └── shared/       # فایل‌های مشترک
│   └── package.json
│
├── admin-panel/          # Admin Panel (Port 3001)
│   ├── .env
│   ├── src/
│   └── package.json
│
├── shared/               # کتابخانه‌های مشترک
│   ├── constants/        # ثابت‌های API
│   └── utils/            # توابع کمکی
│
├── README.md             # مستندات اصلی
├── SETUP_GUIDE_FA.md     # راهنمای نصب فارسی
├── QUICK_START.md        # شروع سریع
└── RUNTIME_GUIDE.md      # این فایل
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="masir_database"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production-masir-2025"
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://route-registry-1.preview.emergentagent.com
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=true
ENABLE_HEALTH_CHECK=false
SKIP_PREFLIGHT_CHECK=true
```

### Admin Panel (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3001
```

---

## 🔥 عیب‌یابی

### Backend راه‌اندازی نمی‌شود
```bash
# چک کردن لاگ‌ها
tail -n 100 /var/log/supervisor/backend.err.log

# چک کردن MongoDB
sudo supervisorctl status mongodb

# نصب مجدد وابستگی‌ها
cd /app/backend
pip install -r requirements.txt
sudo supervisorctl restart backend
```

### Frontend راه‌اندازی نمی‌شود
```bash
# چک کردن لاگ‌ها
tail -n 100 /var/log/supervisor/frontend.err.log

# پاک کردن cache
cd /app/frontend
rm -rf node_modules/.cache
sudo supervisorctl restart frontend
```

### خطای "Module not found: shared"
```bash
# مطمئن شوید فایل‌های shared کپی شده‌اند
ls -la /app/frontend/src/shared/
ls -la /app/admin-panel/src/shared/

# اگر وجود ندارند، دوباره کپی کنید
mkdir -p /app/frontend/src/shared
cp -r /app/shared/* /app/frontend/src/shared/

mkdir -p /app/admin-panel/src/shared
cp -r /app/shared/* /app/admin-panel/src/shared/
```

### MongoDB اتصال ندارد
```bash
# چک کردن وضعیت MongoDB
sudo supervisorctl status mongodb

# ریستارت MongoDB
sudo supervisorctl restart mongodb

# چک کردن لاگ MongoDB
tail -f /var/log/mongodb.err.log
```

---

## 📊 آمار پروژه

- **زبان Backend:** Python 3.11
- **فریم‌ورک Backend:** FastAPI 0.110.1
- **زبان Frontend:** JavaScript (React 19)
- **دیتابیس:** MongoDB
- **احراز هویت:** JWT
- **استایل:** Tailwind CSS
- **نقشه:** Leaflet

---

## 🎉 ویژگی‌های پروژه

### برای کاربران
- ✅ ثبت‌نام و ورود با JWT
- ✅ ثبت مسیرهای جدید
- ✅ ثبت نقاط مهم (POI)
- ✅ سیستم سکه
- ✅ اعلان‌های لحظه‌ای
- ✅ مشاهده تاریخچه

### برای مدیران
- ✅ تایید/رد مسیرها
- ✅ تایید/رد POI ها
- ✅ ارسال اعلان عمومی
- ✅ مشاهده آمار سیستم

---

## 📚 مستندات بیشتر

- **API Documentation:** http://localhost:8001/api/docs
- **Mobile API:** [MOBILE_API_DOCS.md](/app/MOBILE_API_DOCS.md)
- **راهنمای نصب:** [SETUP_GUIDE_FA.md](/app/SETUP_GUIDE_FA.md)
- **شروع سریع:** [QUICK_START.md](/app/QUICK_START.md)

---

**ساخته شده با ❤️ برای افغانستان 🇦🇫**
