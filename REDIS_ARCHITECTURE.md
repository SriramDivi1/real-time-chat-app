# Online Presence & Redis Pub/Sub - Day 5 Documentation

## Overview
Scalable distributed chat system using Redis for presence tracking and Pub/Sub messaging to synchronize events across multiple server instances.

## Features Implemented
✅ Redis integration for distributed caching
✅ Online/offline user tracking via Redis
✅ Redis Pub/Sub for multi-instance synchronization
✅ Presence broadcast events across servers
✅ Socket.IO Redis adapter for scalable WebSocket support
✅ Session management across distributed servers
✅ Automatic presence expiration
✅ Event propagation between instances

## Architecture

### Redis Key Structure
```
online_users                    # Set of online user IDs
user_presence:{userId}          # User presence data with TTL (24h)
user_sockets:{userId}           # Set of socket IDs for user
```

### Redis Channels
```
presence_events                 # Broadcast user online/offline/status changes
chat_events                     # Broadcast chat messages and events
```

## Components

### 1. Redis Configuration (`src/config/redis.js`)
- Redis client connection management
- Publisher and subscriber clients
- Connection pooling and retry logic
- Error handling and reconnection

### 2. Presence Manager (`src/services/presenceManager.js`)
Core functionality for tracking user presence:

#### Functions
- `setUserOnline(userId, socketId, userData)` - Mark user as online
- `setUserOffline(userId, socketId)` - Mark user as offline
- `getUserPresence(userId)` - Get current user presence
- `getOnlineUsers()` - Get all online users
- `getUserSocketCount(userId)` - Count active sockets for user
- `publishPresenceEvent(event, data)` - Publish presence events
- `clearExpiredSessions()` - Cleanup expired presence data

### 3. Redis Pub/Sub (`src/services/redisPubSub.js`)
Event synchronization across instances:

#### Channels
- **presence_events**: User online/offline/status changes
- **chat_events**: Messages, typing, reactions (per chat)

#### Handlers
- Receives events from other server instances
- Broadcasts to local Socket.IO connections
- Maintains event consistency across cluster

## Usage

### Environment Variables
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_optional
REDIS_DB=0

# Server Identification
SERVER_ID=server-1
```

### Presence Tracking
```javascript
const {
  setUserOnline,
  setUserOffline,
  getUserPresence,
  getOnlineUsers
} = require('./services/presenceManager');

// User comes online
await setUserOnline(userId, socketId, {
  username: 'john',
  avatar: 'url'
});

// Get user presence
const presence = await getUserPresence(userId);

// Get all online users
const onlineUsers = await getOnlineUsers();

// User goes offline
await setUserOffline(userId, socketId);
```

### Publishing Events
```javascript
const {
  publishPresenceEvent,
  publishChatEvent
} = require('./services/redisPubSub');

// Publish user online event
publishPresenceEvent('user:online', {
  userId,
  username: 'john',
  timestamp: new Date()
});

// Publish chat message event
publishChatEvent('message:sent', chatId, {
  messageId,
  senderId,
  content,
  timestamp: new Date()
});
```

## Multi-Instance Synchronization Flow

### Scenario: Message Sent on Server A, Received on Server B

```
Server A (Instance 1)
├── User Alice sends message
├── Save to MongoDB
├── Local broadcast to Socket.IO room
└── Publish via Redis Pub/Sub to 'chat_events' channel

Redis Pub/Sub Channel (chat_events)
└── Message forwarded to all subscribed instances

Server B (Instance 2)
├── Subscribe handler receives event
├── Broadcast to local Socket.IO room
└── User Bob receives message in real-time
```

### Scenario: User Online Across Cluster

```
Server A
└── User logs in, socket connects
    ├── setUserOnline() stores in Redis
    ├── Publishes 'user:online' event
    └── Local broadcast

Server B & C
├── Receive 'user:online' via Redis Pub/Sub
└── Broadcast to their local clients
```

## Socket.IO Redis Adapter

Enables Socket.IO rooms and namespaces to work across multiple instances:

```javascript
const io = new Server(server, {
  adapter: redisIO({
    host: 'localhost',
    port: 6379
  })
});
```

Benefits:
- ✅ Room messages work across instances
- ✅ Broadcasting reaches all servers
- ✅ Socket state synchronized
- ✅ Scalable to many instances

## Scalability

### Horizontal Scaling
```
Load Balancer
├── Server 1 (Node.js + Socket.IO)
├── Server 2 (Node.js + Socket.IO)
└── Server 3 (Node.js + Socket.IO)

All connected to:
├── Redis (presence & Pub/Sub)
└── MongoDB (persistence)
```

### Redis Pub/Sub vs Direct Broadcasting
- Direct: Limited to single instance
- Redis Pub/Sub: Reaches all instances
- Socket.IO Redis Adapter: Automatic room sync

## Events & Flow

### Presence Events
```javascript
// Published when user comes online
{
  event: 'user:online',
  data: {
    userId: '...',
    username: 'john',
    avatar: 'url',
    timestamp: Date
  }
}

// Published when user goes offline
{
  event: 'user:offline',
  data: {
    userId: '...',
    timestamp: Date
  }
}
```

### Chat Events
```javascript
{
  event: 'message:sent',
  chatId: '...',
  data: {
    messageId: '...',
    senderId: '...',
    content: 'Hello',
    timestamp: Date
  }
}
```

## Session Expiry

User presence expires after 24 hours (configurable via `PRESENCE_EXPIRY`):

```javascript
const PRESENCE_EXPIRY = 24 * 60 * 60; // 24 hours

// Automatic cleanup
setex(key, PRESENCE_EXPIRY, data);
```

## Monitoring & Debugging

### Check Online Users
```bash
redis-cli
> SMEMBERS online_users
> GET user_presence:{userId}
> SMEMBERS user_sockets:{userId}
```

### Monitor Pub/Sub
```bash
redis-cli
SUBSCRIBE presence_events chat_events
```

### Server Logs
```javascript
// Logs from presence manager
User online: userId - Socket: socketId
User offline: userId
Published presence event: user:online
```

## Fault Tolerance

### Redis Unavailable
- System continues with in-memory tracking
- No cross-server synchronization
- Automatic reconnection on Redis availability
- Log warning and continue

### Server Crashes
- Presence data expires automatically (24h)
- Other instances continue normally
- Socket.IO automatically handles disconnections

### Network Partitions
- Events may be delayed but not lost
- Redis Pub/Sub ensures eventual consistency
- Automatic recovery when partition heals

## Configuration Examples

### Single Server (Development)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Multi-Server Cluster (Production)
```env
REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=secure_password
SERVER_ID=server-prod-1
```

### Redis Cluster
```env
REDIS_HOST=redis-1,redis-2,redis-3
REDIS_PORT=6379
```

## Performance

- **Online Users Lookup**: O(1) - Redis set operation
- **Presence Data Fetch**: O(1) - Redis key lookup
- **Event Publishing**: O(n) where n = subscribers
- **Scalability**: Linear with server count

## Testing Multi-Instance Locally

```bash
# Terminal 1: Start Server 1
SERVER_ID=server-1 PORT=5000 npm run dev

# Terminal 2: Start Server 2
SERVER_ID=server-2 PORT=5001 npm run dev

# Terminal 3: Monitor Redis
redis-cli MONITOR

# Client: Connect to both servers
socket1 = io('http://localhost:5000', {auth: {token}})
socket2 = io('http://localhost:5001', {auth: {token}})

# Messages sent on socket1 received on socket2
```

## Future Enhancements

- [ ] Redis Sentinel for HA
- [ ] Redis Cluster support
- [ ] Presence histograms
- [ ] User activity analytics
- [ ] Persistent event log
- [ ] Geo-distributed Redis

---

**Status**: Day 5 Complete ✅
**Last Updated**: January 8, 2026
