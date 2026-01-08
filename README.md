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
│   ├── server.js              # Express & Socket.io server
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── environment.js     # Environment variables
│   ├── models/
│   │   ├── User.js            # User schema with auth
│   │   ├── Chat.js            # Chat schema (direct & group)
│   │   └── Message.js         # Message schema with features
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── chat.js            # Chat REST APIs
│   │   └── health.js          # Health check routes
│   ├── controllers/
│   │   ├── userController.js  # Auth & user logic
│   │   └── chatController.js  # Chat operations
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── socketAuth.js      # WebSocket authentication
│   ├── socket/
│   │   └── chatEvents.js      # Real-time event handlers
│   └── utils/
│       └── logger.js          # Logging utility
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
├── README.md                  # Main documentation
├── API_DOCS_AUTH.md           # Authentication API docs
├── API_DOCS_CHAT.md           # Chat REST API docs
└── WEBSOCKET_GUIDE.md         # WebSocket events guide
```

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/logout` - User logout (protected)

### Chat Endpoints
- `POST /api/chats` - Create chat (direct or group)
- `GET /api/chats` - Get user's chat list (protected)
- `GET /api/chats/:chatId/messages` - Get chat history (protected)
- `POST /api/chats/:chatId/messages` - Send message (protected)
- `PUT /api/chats/messages/:messageId` - Edit message (protected)
- `DELETE /api/chats/messages/:messageId` - Delete message (protected)
- `POST /api/chats/:chatId/participants` - Add participant (protected)
- `DELETE /api/chats/:chatId/participants` - Remove participant (protected)

### Health Check
- `GET /api/health` - Server health status
- `GET /api/health/detailed` - Detailed server information

**Full API Documentation:**
- [Authentication API](API_DOCS_AUTH.md)
- [Chat REST API](API_DOCS_CHAT.md)

## 🔌 WebSocket Events

Real-time communication using Socket.IO:

### Chat Events
- `chat:join` - Join chat room
- `chat:leave` - Leave chat room
- `message:send` - Send message in real-time
- `message:edit` - Edit message live
- `message:delete` - Delete message live
- `message:markRead` - Mark message as read
- `message:reaction` - Add emoji reaction

### Presence Events
- `user:online` - User comes online
- `user:offline` - User goes offline
- `user:typing` - User is typing
- `user:stoppedTyping` - User stopped typing
- `user:joined` - User joined chat room
- `user:left` - User left chat room

**Full WebSocket Guide:** [WEBSOCKET_GUIDE.md](WEBSOCKET_GUIDE.md)

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

## 📅 Development Progress

### ✅ Completed
- **Day 1**: Project setup, core architecture, health check API
- **Day 2**: User authentication, JWT tokens, password hashing, auth middleware
- **Day 3**: Chat models (direct & group), message persistence, REST APIs
- **Day 4**: Real-time messaging with Socket.IO, WebSocket authentication, presence tracking

### 🔜 Upcoming
- **Day 5**: Notifications system, advanced features
- **Day 6**: Testing suite, performance optimization
- **Day 7**: Deployment, documentation finalization

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

**Last Updated**: January 8, 2026 | **Phase**: Day 4 - Real-Time Messaging
