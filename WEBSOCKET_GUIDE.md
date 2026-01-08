# Real-Time Messaging (WebSockets) - Day 4 Documentation

## Overview
Complete WebSocket implementation using Socket.IO for real-time message delivery, user presence tracking, and live chat features.

## Features Implemented
✅ Socket.IO authentication
✅ Real-time message send/receive
✅ User presence tracking (online/offline)
✅ Typing indicators
✅ Message read receipts
✅ Real-time message editing
✅ Real-time message deletion
✅ Emoji reactions
✅ Active user count in chats
✅ Event-based communication

## Socket.IO Events

### Connection & Authentication

#### `connection`
Emitted when a user connects to Socket.IO
- Authenticates user via JWT token
- Updates user status to online
- Broadcasts user online event

**Example:**
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

#### `disconnect`
Emitted when user disconnects
- Removes socket from active users
- Updates user status to offline if no other sockets
- Broadcasts user offline event

---

### Chat Room Events

#### `chat:join`
User joins a chat room to receive real-time updates

**Emit:**
```javascript
socket.emit('chat:join', {
  chatId: '507f1f77bcf86cd799439011'
});
```

**Response:**
```javascript
socket.on('user:joined', (data) => {
  console.log(`User ${data.userId} joined chat ${data.chatId}`);
});

socket.on('chat:activeUsers', (data) => {
  console.log(`Active users in chat: ${data.count}`);
});
```

#### `chat:leave`
User leaves a chat room

**Emit:**
```javascript
socket.emit('chat:leave', {
  chatId: '507f1f77bcf86cd799439011'
});
```

**Response:**
```javascript
socket.on('user:left', (data) => {
  console.log(`User ${data.userId} left chat ${data.chatId}`);
});
```

---

### Messaging Events

#### `message:send`
Send a real-time message to a chat

**Emit:**
```javascript
socket.emit('message:send', {
  chatId: '507f1f77bcf86cd799439011',
  content: 'Hello everyone!',
  messageType: 'text',
  attachments: [],
  replyTo: null
});
```

**Response (All users in room):**
```javascript
socket.on('message:received', (message) => {
  console.log(`New message: ${message.content}`);
  console.log(`From: ${message.senderId.username}`);
  console.log(`Timestamp: ${message.createdAt}`);
});
```

**Acknowledgement (Sender only):**
```javascript
socket.on('message:sent', (data) => {
  console.log(`Message sent with ID: ${data.messageId}`);
});
```

#### `message:markRead`
Mark a message as read by current user

**Emit:**
```javascript
socket.emit('message:markRead', {
  messageId: '507f1f77bcf86cd799439012',
  chatId: '507f1f77bcf86cd799439011'
});
```

**Response (All users in room):**
```javascript
socket.on('message:read', (data) => {
  console.log(`Message read by ${data.userId} at ${data.readAt}`);
});
```

#### `message:edit`
Edit a sent message in real-time

**Emit:**
```javascript
socket.emit('message:edit', {
  messageId: '507f1f77bcf86cd799439012',
  chatId: '507f1f77bcf86cd799439011',
  content: 'Updated message content'
});
```

**Response (All users in room):**
```javascript
socket.on('message:edited', (data) => {
  console.log(`Message edited: ${data.content}`);
  console.log(`Edited at: ${data.editedAt}`);
});
```

#### `message:delete`
Delete a message in real-time

**Emit:**
```javascript
socket.emit('message:delete', {
  messageId: '507f1f77bcf86cd799439012',
  chatId: '507f1f77bcf86cd799439011'
});
```

**Response (All users in room):**
```javascript
socket.on('message:deleted', (data) => {
  console.log(`Message deleted: ${data.messageId}`);
});
```

---

### Typing Indicators

#### `chat:typing`
Indicate that user is typing

**Emit:**
```javascript
socket.emit('chat:typing', {
  chatId: '507f1f77bcf86cd799439011'
});
```

**Response (All other users in room):**
```javascript
socket.on('user:typing', (data) => {
  console.log(`${data.username} is typing...`);
});
```

#### `chat:stopTyping`
Indicate that user stopped typing

**Emit:**
```javascript
socket.emit('chat:stopTyping', {
  chatId: '507f1f77bcf86cd799439011'
});
```

**Response (All other users in room):**
```javascript
socket.on('user:stoppedTyping', (data) => {
  console.log(`${data.userId} stopped typing`);
});
```

---

### Reactions

#### `message:reaction`
Add/remove emoji reaction to a message

**Emit:**
```javascript
socket.emit('message:reaction', {
  messageId: '507f1f77bcf86cd799439012',
  chatId: '507f1f77bcf86cd799439011',
  emoji: '👍'
});
```

**Response (All users in room):**
```javascript
socket.on('message:reactionUpdated', (data) => {
  console.log(`Message reactions:`, data.reactions);
  // reactions: [
  //   { userId: '...', emoji: '👍' },
  //   { userId: '...', emoji: '❤️' }
  // ]
});
```

---

### Presence Events

#### `user:online`
Emitted when a user comes online (broadcasted to all users)

**Response:**
```javascript
socket.on('user:online', (data) => {
  console.log(`User ${data.userId} is now online`);
});
```

#### `user:offline`
Emitted when a user goes offline (broadcasted to all users)

**Response:**
```javascript
socket.on('user:offline', (data) => {
  console.log(`User ${data.userId} is now offline`);
});
```

---

### Error Handling

#### `error`
Emitted when an error occurs

**Response:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

---

## Client Example (JavaScript)

```javascript
import io from 'socket.io-client';

// Connect to server
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('authToken')
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Join chat
const joinChat = (chatId) => {
  socket.emit('chat:join', { chatId });
};

// Send message
const sendMessage = (chatId, content) => {
  socket.emit('message:send', {
    chatId,
    content,
    messageType: 'text'
  });
};

// Listen for new messages
socket.on('message:received', (message) => {
  console.log('New message:', message);
  // Update UI with new message
});

// Typing indicator
const onTyping = (chatId) => {
  socket.emit('chat:typing', { chatId });
};

const onStopTyping = (chatId) => {
  socket.emit('chat:stopTyping', { chatId });
};

socket.on('user:typing', (data) => {
  console.log(`${data.username} is typing...`);
});
```

---

## Client Example (React)

```jsx
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ chatId, token }) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO
    socketRef.current = io('http://localhost:5000', {
      auth: { token }
    });

    // Join chat
    socketRef.current.emit('chat:join', { chatId });

    // Listen for messages
    socketRef.current.on('message:received', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing
    socketRef.current.on('user:typing', (data) => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    return () => {
      socketRef.current?.emit('chat:leave', { chatId });
      socketRef.current?.disconnect();
    };
  }, [chatId, token]);

  const handleSendMessage = (content) => {
    socketRef.current?.emit('message:send', {
      chatId,
      content,
      messageType: 'text'
    });
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id}>{msg.content}</div>
        ))}
        {isTyping && <div className="typing">Someone is typing...</div>}
      </div>
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage(e.target.value);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}

export default ChatComponent;
```

---

## Configuration

### Environment Variables
```
SOCKET_IO_PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Socket.IO Options
```javascript
{
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingInterval: 30000,
  pingTimeout: 10000
}
```

---

## Architecture

### In-Memory Data Structures
- `activeUsers`: Map of userId → { sockets: Set, rooms: Set }
- `socketUsers`: Map of socketId → userId

### Room Structure
- Rooms named as `chat:{chatId}`
- Users join rooms for specific chats
- Broadcasting within rooms for real-time updates

### Connection Flow
1. Client connects with JWT token
2. Server authenticates token
3. User status updated to 'online'
4. Online event broadcasted
5. User can join chat rooms
6. Receive/send real-time messages

---

## Security Features
- ✅ JWT authentication on WebSocket connection
- ✅ User verification for chat participation
- ✅ Permission checks for edit/delete operations
- ✅ Rate limiting via Socket.IO namespace
- ✅ Secure room isolation

---

**Status**: Day 4 Complete ✅
**Last Updated**: January 8, 2026
