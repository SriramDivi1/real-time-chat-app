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

## 🎯 Project Features

### Core Capabilities
- **Real-Time Messaging**: Instant message delivery via WebSocket (Socket.io)
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Chat Rooms**: Create and manage multiple chat rooms with member management
- **User Presence**: Real-time online/offline status and user activity tracking
- **Message History**: Persistent storage and retrieval of message conversations
- **Typing Indicators**: Live typing status for better user experience
- **Message Operations**: Edit, delete, and mark messages as read
- **File Sharing**: Support for sharing files within chat rooms

### Security Features
- **JWT Authentication**: Stateless token-based authentication
- **Password Encryption**: bcryptjs for secure password hashing
- **CORS Protection**: Cross-Origin Resource Sharing properly configured
- **Helmet**: HTTP security headers for protection against vulnerabilities
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

### Architecture Highlights
- **Microservice Ready**: Scalable design supporting horizontal scaling
- **Database Abstraction**: Mongoose ODM for MongoDB interaction
- **Separation of Concerns**: Models, Controllers, Services architecture
- **Middleware Pipeline**: Express middleware for logging, security, and parsing
- **Event-Driven**: Socket.io events for real-time communication
- **Stateless Design**: RESTful API endpoints with JWT authentication

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

## 🔧 API Endpoints

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

Following a semantic versioning approach:
- `feat:` - New features and capabilities
- `fix:` - Bug fixes and corrections
- `docs:` - Documentation updates
- `refactor:` - Code refactoring
- `test:` - Test additions and updates
- `chore:` - Build and dependency updates

**Current Status**: Project setup and core architecture

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
