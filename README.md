# 🗺️ MASER - Crowd-Sourced Mapping Platform

**مسیر** - سیستم نقشه‌برداری جمعی برای افغانستان

## 📋 Overview

MASER is a comprehensive crowd-sourced mapping platform designed specifically for Afghanistan. It allows users to contribute to mapping infrastructure by submitting roads, points of interest (POIs), and personal locations that may not exist in traditional mapping services like Google Maps or OpenStreetMap.

### ✨ Key Features

- 🛣️ **Road Submission** - Submit new roads with GPS coordinates
- 📍 **Points of Interest** - Add important locations (parks, hospitals, etc.)
- 🏠 **Personal Locations** - Save home, work, and frequent destinations
- 🪙 **Coin System** - Earn coins when submissions are approved
- 👨‍💼 **Admin Panel** - Separate admin interface for reviewing submissions
- 🌐 **Multi-Language** - Full support for Persian/Dari
- 📱 **Mobile-Ready** - Complete REST API for mobile apps

---

## 🏗️ Project Structure

```
maser/
├── backend/              # FastAPI Backend (Port: 8001)
│   ├── server.py         # Main API server
│   ├── models.py         # Pydantic models
│   ├── database.py       # MongoDB connection
│   ├── config.py         # Configuration
│   ├── middleware.py     # Custom middleware
│   └── requirements.txt  # Python dependencies
│
├── frontend/             # Web App for Users (Port: 3000)
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context
│   │   └── services/     # API services
│   └── package.json
│
├── admin-panel/          # Admin Panel (Port: 3001)
│   ├── src/
│   │   ├── pages/        # Admin pages
│   │   └── services/     # Admin API
│   └── package.json
│
└── shared/               # Shared Libraries
    ├── constants/        # API constants
    └── utils/            # Utility functions
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn

### Installation

1. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your config
uvicorn server:app --host 0.0.0.0 --port 8001
```

2. **Frontend Setup**
```bash
cd frontend
yarn install
yarn start  # Runs on port 3000
```

3. **Admin Panel Setup**
```bash
cd admin-panel
yarn install
yarn start  # Runs on port 3001
```

### Using Supervisor (Production)
```bash
sudo supervisorctl restart all
sudo supervisorctl status
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=masir_database
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=*
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3000
```

### Admin Panel (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3001
```

---

## 📱 Mobile API

Complete REST API documentation available in [`MOBILE_API_DOCS.md`](./MOBILE_API_DOCS.md)

**Base URL:** `/api`

Key endpoints:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /roads` - Submit road
- `GET /roads` - Get roads (paginated)
- `POST /pois` - Create POI
- `GET /notifications` - Get notifications

---

## 🧪 Testing

### Test Accounts

**Regular User:**
```
Email: test@maser.com
Password: 123456
```

**Admin:**
```
Email: admin@maser.com
Password: 123456
```

### API Testing
```bash
# Register
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","full_name":"Test User"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Submit Road (with token)
curl -X POST http://localhost:8001/api/roads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "road_name": "خیابان تست",
    "road_type": "خیابان اصلی",
    "coordinates": [[35.7219, 51.3347], [35.7220, 51.3348]]
  }'
```

---

## 🎯 Features

### For Users
- ✅ Submit new roads with GPS tracking
- ✅ Mark points of interest
- ✅ Save personal locations
- ✅ Earn coins for approved submissions
- ✅ Real-time notifications
- ✅ View submission history
- ✅ Interactive map interface

### For Admins
- ✅ Review pending submissions
- ✅ Approve/reject roads and POIs
- ✅ Send broadcast notifications
- ✅ View system statistics
- ✅ Monitor user activity

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **PyJWT** - JWT authentication
- **Bcrypt** - Password hashing
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Leaflet** - Map library
- **Axios** - HTTP client
- **Sonner** - Toast notifications

---

## 📊 Database Schema

### Users Collection
```javascript
{
  id: "uuid",
  email: "user@example.com",
  password: "hashed",
  full_name: "نام کاربر",
  coins: 10,
  created_at: "ISO-date"
}
```

### Roads Collection
```javascript
{
  id: "uuid",
  user_id: "uuid",
  road_name: "خیابان اصلی",
  road_type: "خیابان اصلی",
  coordinates: [[lat, lng], ...],
  status: "pending|approved|rejected",
  coin_awarded: false,
  created_at: "ISO-date"
}
```

### POIs Collection
```javascript
{
  id: "uuid",
  user_id: "uuid",
  name: "پارک",
  category: "عمومی|خصوصی",
  poi_type: "پارک",
  location: [lat, lng],
  status: "pending",
  created_at: "ISO-date"
}
```

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (60/min, 1000/hour)
- ✅ Security headers (XSS, CSRF protection)
- ✅ Input validation with Pydantic
- ✅ CORS configuration
- ✅ Request logging

---

## 📈 Monitoring & Logging

All services log to:
- `/var/log/supervisor/backend.*.log`
- `/var/log/supervisor/frontend.*.log`
- `/var/log/supervisor/admin-panel.*.log`

Check logs:
```bash
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log
```

---

## 🚀 Deployment

### Using Supervisor
```bash
# Start all services
sudo supervisorctl start all

# Restart specific service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart admin-panel

# Check status
sudo supervisorctl status
```

### Production Checklist
- [ ] Change `JWT_SECRET` in backend/.env
- [ ] Set proper `CORS_ORIGINS`
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up backup system for database
- [ ] Configure monitoring/alerting

---

## 📚 API Documentation

Interactive API documentation available at:
- **Swagger UI:** http://localhost:8001/api/docs
- **ReDoc:** http://localhost:8001/api/redoc

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

This project is developed for crowd-sourced mapping in Afghanistan.

---

## 💬 Support

For issues or questions:
- Check API documentation
- Review test accounts
- Check server logs
- All error messages are in Persian/Dari

---

**Made with ❤️ for Afghanistan 🇦🇫**
