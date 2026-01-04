# Real-Time Chat Application

A scalable, feature-rich real-time chat application built with Node.js, Express, Socket.io, and MongoDB. This project demonstrates modern web development practices including WebSocket communication, authentication, database management, and real-time data synchronization.

## 📋 Project Overview

### Tech Stack
- **Backend**: Node.js, Express.js
- **Real-Time Communication**: Socket.io
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Morgan
- **Validation**: Express-validator

### Architecture
- RESTful API for user management
- WebSocket for real-time messaging
- MongoDB for persistent storage
- Scalable room-based chat system

## 🎯 7-Day Development Schedule

### ✅ [Day 1] Project Setup & Core Architecture
- Initialize GitHub repository
- Create folder structure
- Setup Node.js backend with Express
- Configure MongoDB connection
- Add health check API
- Basic server running

### 📅 [Day 2] User Authentication & Authorization
- User registration endpoint
- User login with JWT
- Password encryption with bcryptjs
- Authentication middleware
- User profile management

### 📅 [Day 3] Database Models & Socket.io Setup
- User model (MongoDB)
- Room model
- Message model
- Socket.io initialization
- Event handlers setup

### 📅 [Day 4] Core Chat Features
- Create/join chat rooms
- Send and receive messages
- User online/offline status
- Real-time notifications
- Message history retrieval

### 📅 [Day 5] Advanced Features
- Typing indicators
- User presence
- Message editing/deletion
- File sharing support
- Read receipts

### 📅 [Day 6] Frontend Integration
- React client setup
- Real-time UI updates
- User interface components
- Message display and input
- Room management UI

### 📅 [Day 7] Testing, Deployment & Optimization
- Unit tests
- Integration tests
- Error handling
- Performance optimization
- Docker containerization
- Deployment guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd real-time-chat-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chat-app
MONGODB_TEST_URI=mongodb://localhost:27017/chat-app-test

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Socket.io
SOCKET_IO_PORT=5001
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## 📁 Project Structure

```
real-time-chat-app/
├── src/
│   ├── server.js              # Express server setup
│   ├── socket.js              # Socket.io configuration
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── environment.js     # Environment variables
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Room.js            # Room schema
│   │   └── Message.js         # Message schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User routes
│   │   └── health.js          # Health check routes
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   └── userController.js  # User logic
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Error handling
│   ├── services/
│   │   └── messageService.js  # Business logic
│   └── utils/
│       ├── logger.js          # Logging utility
│       └── validators.js      # Input validation
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
└── README.md                  # Documentation
```

## 🔧 API Endpoints (Day 1)

### Health Check
- `GET /api/health` - Server health status

### Response
```json
{
  "status": "ok",
  "timestamp": "2026-01-04T10:30:00Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 🔌 Socket.io Events (Upcoming)

Will be implemented in Days 3-5:
- `connect` - User connects
- `disconnect` - User disconnects
- `message` - Send message
- `typing` - User typing indicator
- `join_room` - Join chat room
- `leave_room` - Leave chat room

## 📊 Database Models (Upcoming)

### User
```javascript
{
  _id, email, username, password, profile, createdAt, updatedAt
}
```

### Room
```javascript
{
  _id, name, description, members, createdAt, updatedAt
}
```

### Message
```javascript
{
  _id, room, user, content, timestamp, status, edited
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 🐛 Development

```bash
# Start development server with auto-reload
npm run dev

# Run linter
npm run lint

# Build project
npm run build
```

## 📝 Git Commit Strategy

Following a feature-driven approach with daily commits:
- Day 1: `feat: project setup and core architecture`
- Day 2: `feat: user authentication and authorization`
- Day 3: `feat: database models and socket.io setup`
- Day 4: `feat: core chat features`
- Day 5: `feat: advanced messaging features`
- Day 6: `feat: frontend integration`
- Day 7: `feat: testing, deployment, and optimization`

## 🤝 Contributing

1. Create feature branches: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m "feat: description"`
3. Push to branch: `git push origin feature/feature-name`
4. Create Pull Request

## 📜 License

MIT License

## 📞 Support

For issues and questions, please create an issue on GitHub.

---

**Last Updated**: January 4, 2026 | **Phase**: Day 1 - Project Setup
