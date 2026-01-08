# Real-Time Chat Application - 7-Day Development Schedule

**Start Date**: January 5, 2026  
**Daily Commit Time**: 10:00 AM  
**Commit Strategy**: Feature-driven semantic commits

---

## 🔹 DAY 2 — User Authentication (JWT)

**Date**: January 5, 2026 | **Commit Time**: 10:00 AM

### 🎯 Goal
Enable secure user login system with JWT-based authentication.

### 📋 Tasks

- [ ] **User Model**
  - Create User schema in MongoDB
  - Fields: `_id`, `email`, `username`, `password`, `profile`, `createdAt`, `updatedAt`
  - Add unique index on email and username
  - Add password hashing method

- [ ] **Register API**
  - Endpoint: `POST /api/auth/register`
  - Validate email, username, password
  - Hash password with bcryptjs
  - Return user object + JWT token

- [ ] **Login API**
  - Endpoint: `POST /api/auth/login`
  - Validate email/password
  - Generate JWT token
  - Return user + token

- [ ] **Password Hashing**
  - Implement bcryptjs integration
  - Hash on user creation
  - Compare on login

- [ ] **JWT Middleware**
  - Create authentication middleware
  - Verify JWT tokens
  - Attach user to request object
  - Handle token expiration

### ✨ Features Added
- ✅ User registration with validation
- ✅ Secure login with password verification
- ✅ JWT token generation & storage
- ✅ Protected routes with JWT middleware

### 📁 Files to Create/Modify
```
src/
├── models/
│   └── User.js (NEW)
├── routes/
│   └── auth.js (NEW)
├── controllers/
│   └── authController.js (NEW)
├── middleware/
│   └── auth.js (NEW)
└── server.js (UPDATE - add auth routes)
```

### 🔄 Git Commit
```bash
git commit -m "feat: user authentication with JWT and bcrypt"
```

---

## 🔹 DAY 3 — Chat Models & REST APIs

**Date**: January 6, 2026 | **Commit Time**: 10:00 AM

### 🎯 Goal
Build chat metadata and persistence layer with REST APIs.

### 📋 Tasks

- [ ] **Chat Model**
  - Support 1-1 and group chats
  - Fields: `_id`, `name`, `participants`, `creator`, `isGroup`, `lastMessage`, `createdAt`, `updatedAt`
  - Index on participants for quick lookup

- [ ] **Message Model**
  - Fields: `_id`, `chat`, `sender`, `content`, `timestamp`, `status`, `edited`, `deletedAt`
  - Reference to Chat and User models
  - Index on chat and timestamp

- [ ] **Create Chat API**
  - Endpoint: `POST /api/chats`
  - Create 1-1 or group chat
  - Add initial participants
  - Return chat object

- [ ] **Fetch Chats API**
  - Endpoint: `GET /api/chats`
  - Return paginated list of user's chats
  - Include last message preview
  - Sort by lastMessage timestamp

- [ ] **Fetch Chat History API**
  - Endpoint: `GET /api/chats/:chatId/messages`
  - Return paginated messages
  - Include sender details
  - Support cursor-based pagination

- [ ] **Add Participant API**
  - Endpoint: `POST /api/chats/:chatId/participants`
  - Add user to group chat
  - Validation: only group chats

### ✨ Features Added
- ✅ Persistent chat storage (1-1 & groups)
- ✅ Message storage in database
- ✅ Chat history retrieval
- ✅ Participant management

### 📁 Files to Create/Modify
```
src/
├── models/
│   ├── Chat.js (NEW)
│   └── Message.js (NEW)
├── routes/
│   └── chats.js (NEW)
├── controllers/
│   └── chatController.js (NEW)
└── server.js (UPDATE - add chat routes)
```

### 🔄 Git Commit
```bash
git commit -m "feat: chat models and REST APIs for messages"
```

---

## 🔹 DAY 4 — Real-Time Messaging (WebSockets)

**Date**: January 7, 2026 | **Commit Time**: 10:00 AM

### 🎯 Goal
Enable real-time message delivery using Socket.IO.

### 📋 Tasks

- [ ] **Socket.IO Setup**
  - Initialize Socket.IO server
  - Configure CORS and authentication
  - Handle client connections

- [ ] **WebSocket Authentication**
  - Verify JWT on socket connection
  - Attach user to socket session
  - Disconnect on invalid token

- [ ] **Send Message Event**
  - Event: `send_message`
  - Payload: `{chatId, content}`
  - Save to database
  - Broadcast to chat participants

- [ ] **Receive Message Event**
  - Event: `receive_message`
  - Send message to all connected participants
  - Include message metadata

- [ ] **Broadcast Messages**
  - Join users to chat rooms
  - Broadcast updates to room
  - Handle disconnections

- [ ] **Message Events**
  - `user_typing` - typing indicator
  - `user_stopped_typing` - clear indicator
  - `message_delivered` - delivery confirmation

### ✨ Features Added
- ✅ Live message delivery
- ✅ Real-time WebSocket connections
- ✅ Event-based communication
- ✅ Typing indicators

### 📁 Files to Create/Modify
```
src/
├── socket.js (NEW)
├── config/
│   └── socket.js (NEW)
├── events/
│   └── messageEvents.js (NEW)
└── server.js (UPDATE - integrate Socket.IO)
```

### 🔄 Git Commit
```bash
git commit -m "feat: real-time messaging with Socket.IO"
```

---

## 🔹 DAY 5 — Online Presence & Redis Pub/Sub

**Date**: January 8, 2026 | **Commit Time**: 10:00 AM

### 🎯 Goal
Make system scalable and distributed with Redis integration.

### 📋 Tasks

- [ ] **Redis Setup**
  - Install and configure Redis
  - Create Redis client
  - Add connection error handling

- [ ] **Track Online Users**
  - Store user online status in Redis
  - Key format: `user:${userId}:online`
  - Set TTL for auto-cleanup

- [ ] **Presence Events**
  - Emit `user_online` when connected
  - Emit `user_offline` when disconnected
  - Broadcast to all participants in active chats

- [ ] **Redis Pub/Sub Setup**
  - Subscribe to `chat:${chatId}` channel
  - Publish messages across instances
  - Support multi-server architecture

- [ ] **Sync Across Instances**
  - Handle Socket.IO adapter
  - Broadcast events to all servers
  - Share user session data via Redis

- [ ] **Presence Broadcast**
  - Get online users in chat
  - Endpoint: `GET /api/chats/:chatId/online-users`
  - Real-time updates on connect/disconnect

### ✨ Features Added
- ✅ Online/offline status tracking
- ✅ Multi-server support
- ✅ Redis Pub/Sub synchronization
- ✅ Scalable architecture

### 📁 Files to Create/Modify
```
src/
├── config/
│   └── redis.js (NEW)
├── events/
│   └── presenceEvents.js (NEW)
├── services/
│   ├── redisService.js (NEW)
│   └── presenceService.js (NEW)
└── server.js (UPDATE - Redis setup)
```

### 📦 New Dependencies
```bash
npm install redis
```

### 🔄 Git Commit
```bash
git commit -m "feat: online presence tracking with Redis Pub/Sub"
```

---

## 🔹 DAY 6 — Offline Messaging & Reliability

**Date**: January 9, 2026 | **Commit Time**: 10:00 AM

### 🎯 Goal
Add fault tolerance and reliable message delivery.

### 📋 Tasks

- [ ] **RabbitMQ Setup**
  - Install and configure RabbitMQ
  - Create message queue
  - Setup connection pool

- [ ] **Queue Offline Messages**
  - Store messages in RabbitMQ for offline users
  - Queue name: `chat.messages.${userId}`
  - Set message TTL

- [ ] **Message Delivery Acknowledgement**
  - Client sends `message_ack` after receipt
  - Mark message as delivered in database
  - Remove from offline queue

- [ ] **Reconnect Handler**
  - On user reconnect, send queued messages
  - Maintain message order
  - Clear queue after delivery

- [ ] **Message Status Tracking**
  - Status: `pending`, `sent`, `delivered`, `read`
  - Update status on events
  - Endpoint to fetch message status

- [ ] **Reliable Socket Handling**
  - Implement socket reconnection logic
  - Handle duplicate messages
  - Idempotency keys for messages

### ✨ Features Added
- ✅ Offline message queuing
- ✅ Reliable message delivery
- ✅ Message status tracking
- ✅ Automatic reconnection handling

### 📁 Files to Create/Modify
```
src/
├── config/
│   └── rabbitmq.js (NEW)
├── services/
│   ├── queueService.js (NEW)
│   └── messageQueueService.js (NEW)
├── events/
│   └── reliabilityEvents.js (NEW)
└── server.js (UPDATE - RabbitMQ setup)
```

### 📦 New Dependencies
```bash
npm install amqplib
```

### 🔄 Git Commit
```bash
git commit -m "feat: offline messaging with RabbitMQ reliability layer"
```

---

## 🔹 DAY 7 — Frontend, Docker & Deployment

**Date**: January 10, 2026 | **Commit Time**: 10:00 AM

### 🎯 Goal
Make it complete, usable, and deployable.

### 📋 Tasks

- [ ] **React Frontend Setup**
  - Create React app
  - Setup folder structure
  - Install dependencies (axios, socket.io-client, etc.)

- [ ] **Chat UI Components**
  - Login/Register forms
  - Chat list view
  - Message display area
  - Message input box

- [ ] **WebSocket Client Integration**
  - Connect to Socket.IO server
  - Handle message events
  - Display real-time messages
  - Show typing indicators

- [ ] **User Features UI**
  - Online status indicators
  - User list with presence
  - Create/join chat UI
  - User profile management

- [ ] **Dockerfile**
  - Backend Dockerfile
  - Frontend Dockerfile
  - Multi-stage build optimization

- [ ] **Docker Compose**
  - MongoDB service
  - Redis service
  - RabbitMQ service
  - Backend service
  - Frontend service
  - Network configuration

- [ ] **Environment Configuration**
  - Production `.env` file
  - Docker environment variables
  - Database URIs
  - API endpoints

- [ ] **Documentation**
  - Deployment guide
  - Environment setup
  - Architecture diagram
  - API documentation
  - Troubleshooting guide

### ✨ Features Added
- ✅ User interface for chat
- ✅ Full system deployment
- ✅ Complete documentation
- ✅ Containerized application

### 📁 Files to Create/Modify
```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── ChatList.js
│   │   ├── ChatWindow.js
│   │   └── MessageInput.js
│   ├── services/
│   │   └── socketService.js
│   └── App.js
├── Dockerfile
└── package.json

root/
├── Dockerfile.backend
├── docker-compose.yml
├── .env.production
├── DEPLOYMENT_GUIDE.md
└── API_DOCUMENTATION.md
```

### 📦 New Dependencies
```bash
cd frontend
npm create react-app .
npm install axios socket.io-client
```

### 🔄 Git Commit
```bash
git commit -m "feat: React frontend, Docker setup, and deployment configuration"
```

---

## 📊 Summary Timeline

| Day | Date | Focus | Commit Time |
|-----|------|-------|-------------|
| 2 | Jan 5 | User Authentication | 10:00 AM |
| 3 | Jan 6 | Chat Models & APIs | 10:00 AM |
| 4 | Jan 7 | Real-Time Messaging | 10:00 AM |
| 5 | Jan 8 | Online Presence | 10:00 AM |
| 6 | Jan 9 | Offline Reliability | 10:00 AM |
| 7 | Jan 10 | Frontend & Deployment | 10:00 AM |

---

## 🔧 Daily Workflow

### Morning (Before 10 AM)
1. Review tasks for the day
2. Implement features
3. Test locally
4. Fix bugs

### 10:00 AM - Commit & Push
```bash
git add .
git commit -m "feat: [day] description"
git push origin main
```

### Afternoon (After 10 AM)
1. Code review
2. Documentation updates
3. Prepare for next day

---

## 📦 Dependencies by Day

**Day 2**: `bcryptjs`, `jsonwebtoken` (already installed)

**Day 3**: `mongoose` (already installed)

**Day 4**: `socket.io` (already installed)

**Day 5**: 
```bash
npm install redis
```

**Day 6**:
```bash
npm install amqplib
```

**Day 7**:
```bash
npx create-react-app frontend
cd frontend
npm install axios socket.io-client
```

---

## ✅ Completion Checklist

- [ ] Day 2: User Authentication working
- [ ] Day 3: Chat APIs tested
- [ ] Day 4: Real-time messaging verified
- [ ] Day 5: Redis integration tested
- [ ] Day 6: RabbitMQ queuing working
- [ ] Day 7: Full stack deployed

---

**Status**: Ready for Day 2 implementation  
**Last Updated**: January 4, 2026
