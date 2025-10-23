# 📱 MASER Mobile API Documentation

## Overview
MASER API is fully mobile-ready with RESTful endpoints for iOS/Android applications.

**Base URL:** `https://route-registry-1.preview.emergentagent.com/api`

---

## 🔐 Authentication

All authenticated endpoints require `Authorization` header:
```
Authorization: Bearer {access_token}
```

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456",
  "full_name": "احمد محمدی"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "احمد محمدی",
    "coins": 0,
    "created_at": "2025-10-20T..."
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

---

## 🛣️ Roads API

### Submit New Road
```http
POST /roads
Authorization: Bearer {token}
Content-Type: application/json

{
  "road_name": "خیابان ولیعصر",
  "road_type": "خیابان اصلی",
  "coordinates": [
    [35.7219, 51.3347],
    [35.7220, 51.3348],
    [35.7221, 51.3349]
  ]
}
```

**Road Types:**
- `خیابان اصلی` (Main Street)
- `خیابان فرعی` (Secondary Street)
- `کوچه` (Alley)
- `بزرگراه` (Highway)

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "road_name": "خیابان ولیعصر",
  "road_type": "خیابان اصلی",
  "coordinates": [[35.7219, 51.3347], ...],
  "status": "pending",
  "coin_awarded": false,
  "created_at": "2025-10-20T..."
}
```

### Get All Roads (with pagination)
```http
GET /roads?status=approved&page=1&page_size=20
```

**Query Parameters:**
- `status` (optional): `pending`, `approved`, `rejected`
- `page` (default: 1): Page number
- `page_size` (default: 20, max: 100): Items per page

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

### Get User's Roads
```http
GET /roads/user
Authorization: Bearer {token}
```

---

## 📍 Points of Interest (POI)

### Create POI
```http
POST /pois
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "پارک لاله",
  "category": "عمومی",
  "poi_type": "پارک",
  "location": [35.7219, 51.3347]
}
```

**Categories:**
- `عمومی` (Public)
- `خصوصی` (Private)

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "پارک لاله",
  "category": "عمومی",
  "poi_type": "پارک",
  "location": [35.7219, 51.3347],
  "status": "pending",
  "created_at": "2025-10-20T..."
}
```

### Get All POIs
```http
GET /pois?status=approved&category=عمومی&page=1&page_size=20
```

---

## 🏠 Personal Locations

### Add Personal Location
```http
POST /locations/personal
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "منزل",
  "location": [35.7219, 51.3347]
}
```

### Get Personal Locations
```http
GET /locations/personal
Authorization: Bearer {token}
```

---

## 🔔 Notifications

### Get Notifications
```http
GET /notifications
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "سکه دریافت شد!",
    "message": "مسیر شما تایید شد و 1 سکه به شما اضافه شد.",
    "read": false,
    "created_at": "2025-10-20T..."
  }
]
```

### Mark Notification as Read
```http
PUT /notifications/{notification_id}/read
Authorization: Bearer {token}
```

---

## 🏥 Health Check

### API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "healthy",
  "version": "2.0"
}
```

---

## 🎯 Mobile App Implementation Tips

### 1. **Token Management**
```javascript
// Store token securely
AsyncStorage.setItem('access_token', token);

// Add to all requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. **Map Integration**
```javascript
// For React Native with react-native-maps
import MapView, { Polyline, Marker } from 'react-native-maps';

// Draw road
<Polyline
  coordinates={road.coordinates.map(coord => ({
    latitude: coord[0],
    longitude: coord[1]
  }))}
  strokeColor="#0EA5E9"
  strokeWidth={3}
/>
```

### 3. **Location Tracking**
```javascript
// Get user location
import Geolocation from '@react-native-community/geolocation';

Geolocation.getCurrentPosition(
  position => {
    const { latitude, longitude } = position.coords;
    // Send to API
  }
);
```

### 4. **Offline Support**
- Cache approved roads locally
- Queue submissions when offline
- Sync when connection restored

### 5. **Real-time Updates**
Consider implementing WebSocket for:
- Notification alerts
- Road approval updates
- Coin balance changes

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Server Error |

---

## 🚀 Rate Limits

- **Per Minute:** 60 requests
- **Per Hour:** 1000 requests

Rate limit headers included in response:
```
X-RateLimit-Limit-Minute: 60
X-RateLimit-Remaining-Minute: 45
X-RateLimit-Limit-Hour: 1000
X-RateLimit-Remaining-Hour: 850
```

---

## 🔒 Security

1. **HTTPS Only** - All requests must use HTTPS
2. **Token Expiration** - Tokens expire after 72 hours
3. **Input Validation** - All inputs are validated server-side
4. **Rate Limiting** - Protection against abuse

---

## 🌍 Coordinate System

- **Format:** `[latitude, longitude]`
- **Latitude Range:** -90 to 90
- **Longitude Range:** -180 to 180
- **Example for Afghanistan:** `[34.5553, 69.2075]` (Kabul)

---

## 📝 Example Mobile App Flow

1. **Launch App** → Check stored token
2. **If no token** → Show Login/Register
3. **After login** → Store token, fetch user data
4. **Main Screen** → Load approved roads on map
5. **Add Road** → Track coordinates, submit when done
6. **Notifications** → Poll `/notifications` or use push
7. **Profile** → Show coins, submitted roads

---

## 🛠️ React Native Starter Code

```javascript
import axios from 'axios';

const API_BASE_URL = 'https://route-registry-1.preview.emergentagent.com/api';

// API Client
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (email, password, fullName) =>
    api.post('/auth/register', { email, password, full_name: fullName }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Roads
export const roadsAPI = {
  submit: (roadName, roadType, coordinates) =>
    api.post('/roads', { road_name: roadName, road_type: roadType, coordinates }),
  
  getAll: (status, page = 1, pageSize = 20) =>
    api.get('/roads', { params: { status, page, page_size: pageSize } }),
  
  getUserRoads: () =>
    api.get('/roads/user'),
};

// POIs
export const poisAPI = {
  create: (name, category, poiType, location) =>
    api.post('/pois', { name, category, poi_type: poiType, location }),
  
  getAll: (status, category, page = 1) =>
    api.get('/pois', { params: { status, category, page } }),
};

// Notifications
export const notificationsAPI = {
  getAll: () =>
    api.get('/notifications'),
  
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
};
```

---

## 📞 Support

For API issues or questions:
- Check logs for detailed error messages
- All errors include Persian/Dari messages
- Response format is always JSON

**موفق باشید! 🎉**
