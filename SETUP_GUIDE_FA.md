# 📚 راهنمای کامل نصب و اجرای پروژه MASER در VS Code

## 🎯 پیش‌نیازها

قبل از شروع، مطمئن شوید این‌ها را نصب کرده‌اید:

### 1. نرم‌افزارهای مورد نیاز:
- ✅ **Node.js** (نسخه 18 یا بالاتر) - [دانلود](https://nodejs.org/)
- ✅ **Python** (نسخه 3.11 یا بالاتر) - [دانلود](https://www.python.org/)
- ✅ **MongoDB** (نسخه 5 یا بالاتر) - [دانلود](https://www.mongodb.com/try/download/community)
- ✅ **Git** - [دانلود](https://git-scm.com/)
- ✅ **VS Code** - [دانلود](https://code.visualstudio.com/)
- ✅ **Yarn** (package manager)

### 2. نصب Yarn:
```bash
npm install -g yarn
```

---

## 📥 مرحله 1: دانلود پروژه

### روش 1: از GitHub
```bash
# کلون کردن پروژه
git clone <YOUR_GITHUB_URL>
cd maser

# یا اگر از طریق ZIP دانلود کردید
unzip maser.zip
cd maser
```

### روش 2: از فایل ZIP
1. فایل `maser.zip` را در پوشه دلخواه extract کنید
2. پوشه را در VS Code باز کنید: `File > Open Folder > maser`

---

## 🔧 مرحله 2: نصب وابستگی‌ها

### A. Backend (Python/FastAPI)

```bash
# رفتن به پوشه backend
cd backend

# ساخت virtual environment (اختیاری اما توصیه می‌شود)
python -m venv venv

# فعال کردن virtual environment
# در Windows:
venv\Scripts\activate
# در macOS/Linux:
source venv/bin/activate

# نصب وابستگی‌ها
pip install -r requirements.txt
```

### B. Frontend (React)

```bash
# رفتن به پوشه frontend
cd ../frontend

# نصب وابستگی‌ها
yarn install

# اگر خطای shared files گرفتید، این دستورات را اجرا کنید:
mkdir -p src/shared/utils
mkdir -p src/shared/constants
```

### C. Admin Panel

```bash
# رفتن به پوشه admin-panel
cd ../admin-panel

# نصب وابستگی‌ها
yarn install
```

---

## ⚙️ مرحله 3: تنظیم Environment Variables

### A. Backend Environment (.env)

فایل `backend/.env` را ایجاد کنید:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=masir_database

# Security Configuration
JWT_SECRET=your-secret-key-change-in-production-masir-2025
CORS_ORIGINS=*

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

### B. Frontend Environment (.env)

فایل `frontend/.env` را ایجاد کنید:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3000
```

### C. Admin Panel Environment (.env)

فایل `admin-panel/.env` را ایجاد کنید:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3001
```

---

## 🔥 مرحله 4: حل مشکل Shared Files

این مهم‌ترین قسمت است! فایل‌های shared باید درون `src/` باشند:

### A. ایجاد فایل apiClient.js

فایل `frontend/src/shared/utils/apiClient.js` را بسازید:

```javascript
/**
 * Shared API Client
 */
import axios from 'axios';

export const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL: `${baseURL}/api`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export default createApiClient;
```

### B. ایجاد فایل api.js (constants)

فایل `frontend/src/shared/constants/api.js` را بسازید:

```javascript
/**
 * Shared API Constants
 */

// Road Types
export const ROAD_TYPES = [
  'خیابان اصلی',
  'خیابان فرعی',
  'کوچه',
  'بزرگراه',
];

// POI Categories
export const POI_CATEGORIES = ['عمومی', 'خصوصی'];

// Status Types
export const STATUS_TYPES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  
  // Roads
  ROADS: '/roads',
  ROADS_USER: '/roads/user',
  
  // POIs
  POIS: '/pois',
  
  // Locations
  PERSONAL_LOCATIONS: '/locations/personal',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_READ: (id) => `/notifications/${id}/read`,
  
  // Admin
  ADMIN_ROADS_APPROVE: (id) => `/admin/roads/${id}/approve`,
  ADMIN_ROADS_REJECT: (id) => `/admin/roads/${id}/reject`,
  ADMIN_POIS_APPROVE: (id) => `/admin/pois/${id}/approve`,
  ADMIN_POIS_REJECT: (id) => `/admin/pois/${id}/reject`,
  ADMIN_NOTIFICATIONS_BROADCAST: '/admin/notifications/broadcast',
  ADMIN_STATS: '/admin/stats',
  
  // Health
  HEALTH: '/health',
};

// Coins Configuration
export const COINS_CONFIG = {
  PER_APPROVED_ROAD: 1,
  PER_APPROVED_POI: 1,
};

export default {
  ROAD_TYPES,
  POI_CATEGORIES,
  STATUS_TYPES,
  API_ENDPOINTS,
  COINS_CONFIG,
};
```

### C. همین کار را برای Admin Panel هم انجام دهید

```bash
# در پوشه admin-panel
mkdir -p src/shared/utils
mkdir -p src/shared/constants

# فایل‌های بالا را کپی کنید به:
# admin-panel/src/shared/utils/apiClient.js
# admin-panel/src/shared/constants/api.js
```

---

## 🚀 مرحله 5: اجرای پروژه

### روش 1: اجرای Manual (توصیه می‌شود برای Development)

شما به **3 ترمینال** نیاز دارید:

#### ترمینال 1: MongoDB
```bash
# راه‌اندازی MongoDB
mongod
# یا در Windows با MongoDB Compass:
# فقط MongoDB Compass را باز کنید
```

#### ترمینال 2: Backend
```bash
cd backend

# فعال کردن virtual environment (اگر ساختید)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# اجرای backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### ترمینال 3: Frontend
```bash
cd frontend

# اجرای frontend
yarn start
```

#### ترمینال 4: Admin Panel (اختیاری)
```bash
cd admin-panel

# اجرای admin panel
yarn start
# یا اگر port 3000 اشغال بود:
PORT=3001 yarn start
```

### روش 2: استفاده از VS Code Tasks

فایل `.vscode/tasks.json` را در root پروژه بسازید:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      }
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "cd frontend && yarn start",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      }
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Backend", "Start Frontend"],
      "problemMatcher": []
    }
  ]
}
```

سپس: `Terminal > Run Task > Start All`

---

## 🧪 مرحله 6: تست

### 1. چک کردن Backend:
مرورگر را باز کنید:
```
http://localhost:8001/api/docs
```
باید صفحه Swagger API Docs را ببینید.

### 2. چک کردن Frontend:
```
http://localhost:3000
```
باید صفحه Login MASER را ببینید.

### 3. ساخت کاربر تست:
از Swagger UI یا:
```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@maser.com","password":"test123","full_name":"کاربر تست"}'
```

---

## 🐛 رفع مشکلات رایج

### ❌ خطا: "Module not found: shared"

**حل:**
```bash
cd frontend
rm -rf node_modules/.cache
rm -rf build
yarn start
```

### ❌ خطا: "MongoDB connection failed"

**حل:**
1. مطمئن شوید MongoDB در حال اجرا است:
```bash
mongod --version  # چک نسخه
```

2. آدرس MongoDB را در `backend/.env` چک کنید:
```env
MONGO_URL=mongodb://localhost:27017
```

### ❌ خطا: "Port 3000 is already in use"

**حل:**
```bash
# پورت را تغییر دهید
PORT=3002 yarn start
```

یا process را kill کنید:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### ❌ خطا: "Python not found"

**حل:**
در Windows، Python را از Microsoft Store نصب کنید یا:
```
python --version
py --version
```

### ❌ خطا: "yarn: command not found"

**حل:**
```bash
npm install -g yarn
```

---

## 📁 ساختار نهایی پروژه

```
maser/
├── backend/
│   ├── .env                  ✅ شما باید بسازید
│   ├── server.py
│   ├── models.py
│   ├── database.py
│   ├── config.py
│   ├── middleware.py
│   └── requirements.txt
│
├── frontend/
│   ├── .env                  ✅ شما باید بسازید
│   ├── src/
│   │   ├── shared/          ✅ شما باید بسازید
│   │   │   ├── utils/
│   │   │   │   └── apiClient.js
│   │   │   └── constants/
│   │   │       └── api.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── package.json
│
└── admin-panel/
    ├── .env                  ✅ شما باید بسازید
    ├── src/
    │   └── shared/          ✅ شما باید بسازید (مثل frontend)
    └── package.json
```

---

## 🎯 چک‌لیست نهایی

قبل از اجرا این‌ها را چک کنید:

- [ ] Node.js نصب شده (v18+)
- [ ] Python نصب شده (v3.11+)
- [ ] MongoDB نصب و در حال اجرا
- [ ] Yarn نصب شده
- [ ] فایل `backend/.env` ساخته شده
- [ ] فایل `frontend/.env` ساخته شده
- [ ] پوشه `frontend/src/shared` با فایل‌های لازم وجود دارد
- [ ] `pip install -r backend/requirements.txt` اجرا شده
- [ ] `yarn install` در frontend اجرا شده
- [ ] Backend روی port 8001 در حال اجرا
- [ ] Frontend روی port 3000 در حال اجرا

---

## 🎉 موفق شدید!

اگر همه مراحل را درست انجام دادید:

1. Backend API: http://localhost:8001/api/docs
2. Frontend: http://localhost:3000
3. Admin Panel: http://localhost:3001

**اکانت تست:**
- Email: `test@maser.com`
- Password: `test123`

---

## 💡 نکات مهم

1. **همیشه MongoDB را اول اجرا کنید**
2. **Backend را قبل از Frontend اجرا کنید**
3. **از hot-reload استفاده کنید** (--reload در backend، yarn start در frontend)
4. **فایل‌های .env را commit نکنید**
5. **برای production، JWT_SECRET را تغییر دهید**

---

## 📞 پشتیبانی

اگر مشکلی داشتید:
1. لاگ‌های console را چک کنید
2. MongoDB logs را ببینید
3. Browser console (F12) را چک کنید
4. فایل‌های .env را دوباره چک کنید

---

**موفق باشید! 🚀🇦🇫**
