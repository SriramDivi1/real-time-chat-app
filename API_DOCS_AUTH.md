# User Authentication API - Day 2 Documentation

## Overview
Complete user authentication system with JWT tokens, secure password hashing, and user session management.

## Features Implemented
✅ User registration with validation
✅ Secure login with password hashing (bcrypt)
✅ JWT token generation and validation
✅ Authentication middleware
✅ User profile management
✅ User logout with session tracking
✅ Input validation with express-validator

## API Endpoints

### 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://via.placeholder.com/150?text=User",
    "status": "offline",
    "createdAt": "2026-01-08T10:30:00Z",
    "updatedAt": "2026-01-08T10:30:00Z"
  }
}
```

**Validation Rules:**
- Username: Required, 3-30 chars, alphanumeric with `-` and `_`
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- Confirm Password: Must match password

---

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "status": "online",
    "lastSeen": "2026-01-08T10:45:00Z"
  }
}
```

---

### 3. Get Current User Profile
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://via.placeholder.com/150?text=User",
    "bio": "Software developer",
    "status": "online",
    "lastSeen": "2026-01-08T10:45:00Z"
  }
}
```

---

### 4. Update User Profile
**PUT** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "bio": "Senior software developer",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe Updated",
    "bio": "Senior software developer",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

---

### 5. User Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "param": "email",
      "msg": "Please provide a valid email address"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User already exists with this email or username"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Registration failed",
  "error": "Error details"
}
```

---

## Authentication

### Token Format
The JWT token is sent in the `Authorization` header:
```
Authorization: Bearer <token>
```

Or alternatively in custom header:
```
x-auth-token: <token>
```

### Token Expiration
- Default: 7 days
- Configurable via `JWT_EXPIRE` in `.env`

### Token Claims
```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1641600000,
  "exp": 1642204800
}
```

---

## User Model Schema

```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, lowercase),
  password: String (hashed, not returned),
  fullName: String (optional, max 50 chars),
  avatar: String (URL, default placeholder),
  bio: String (optional, max 200 chars),
  status: String (online|offline|away, default: offline),
  lastSeen: Date,
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date (auto-updated on save)
}
```

---

## Testing Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "fullName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get current user (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Update profile
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "bio": "My bio"
  }'
```

---

## Security Features
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens with expiration
- ✅ Input validation on all endpoints
- ✅ Email and username uniqueness constraints
- ✅ Password confirmation required on registration
- ✅ Sensitive data (password) excluded from responses
- ✅ Helmet security headers enabled
- ✅ CORS protection enabled
- ✅ Authorization middleware for protected routes

---

## Environment Variables Required
```
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/chat-app
NODE_ENV=development
```

---

**Status**: Day 2 Complete ✅
**Last Updated**: January 8, 2026
