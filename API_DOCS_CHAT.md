# Chat Models & REST APIs - Day 3 Documentation

## Overview
Complete chat messaging system with support for direct (1-to-1) and group chats, message persistence, and chat management.

## Features Implemented
✅ Direct and group chat creation
✅ Chat history retrieval with pagination
✅ Message persistence with full history
✅ Message editing and deletion
✅ Message read receipts
✅ Group participant management
✅ Message reactions and replies
✅ Chat list with unread counts
✅ Input validation on all endpoints

## Models

### Chat Model
```javascript
{
  _id: ObjectId,
  chatType: String (direct|group),
  participants: [ObjectId], // Array of User IDs
  groupName: String (required for group),
  groupAvatar: String,
  groupDescription: String,
  createdBy: ObjectId (User, for group chats),
  admins: [ObjectId], // Array of User IDs with admin rights
  lastMessage: ObjectId (ref to Message),
  lastMessageTime: Date,
  messageCount: Number,
  pinnedMessages: [ObjectId],
  mutedBy: [{ userId, mutedAt }],
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  chatId: ObjectId (ref to Chat),
  senderId: ObjectId (ref to User),
  content: String (max 5000 chars),
  messageType: String (text|image|file|system),
  attachments: [{ type, url, fileName, fileSize, fileType }],
  readBy: [{ userId, readAt }],
  edited: Boolean,
  editedAt: Date,
  editHistory: [{ content, editedAt }],
  replyTo: ObjectId (ref to Message, for replies),
  reactions: [{ userId, emoji }],
  isDeleted: Boolean,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### 1. Create Chat
**POST** `/api/chats`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (Direct Chat):**
```json
{
  "chatType": "direct",
  "participantIds": ["userId1", "userId2"]
}
```

**Request Body (Group Chat):**
```json
{
  "chatType": "group",
  "groupName": "Project Team",
  "groupDescription": "Team discussing project updates",
  "participantIds": ["userId1", "userId2", "userId3"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "chat": {
    "_id": "507f1f77bcf86cd799439011",
    "chatType": "group",
    "groupName": "Project Team",
    "groupDescription": "Team discussing project updates",
    "participants": [
      { "_id": "...", "username": "user1", "avatar": "..." },
      { "_id": "...", "username": "user2", "avatar": "..." }
    ],
    "createdBy": { "_id": "...", "username": "user1" },
    "admins": ["507f1f77bcf86cd799439011"],
    "messageCount": 0,
    "createdAt": "2026-01-08T10:30:00Z",
    "participantCount": 3
  }
}
```

---

### 2. Get Chat List
**GET** `/api/chats`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=20&skip=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "chats": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "chatType": "direct",
      "participants": [
        { "_id": "...", "username": "john", "avatar": "..." }
      ],
      "lastMessage": {
        "_id": "...",
        "content": "Hey, how are you?",
        "senderId": { "_id": "..." },
        "createdAt": "2026-01-08T11:45:00Z"
      },
      "lastMessageTime": "2026-01-08T11:45:00Z",
      "unreadCount": 2
    }
  ],
  "totalChats": 15,
  "hasMore": true
}
```

---

### 3. Get Chat History
**GET** `/api/chats/:chatId/messages`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=50&skip=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "chatId": "507f1f77bcf86cd799439011",
      "senderId": {
        "_id": "...",
        "username": "john",
        "avatar": "https://..."
      },
      "content": "Hello there!",
      "messageType": "text",
      "readBy": [
        { "userId": "...", "readAt": "2026-01-08T11:50:00Z" }
      ],
      "edited": false,
      "replyTo": null,
      "reactions": [],
      "createdAt": "2026-01-08T11:45:00Z"
    }
  ],
  "totalMessages": 245,
  "hasMore": true,
  "chat": {
    "_id": "507f1f77bcf86cd799439011",
    "chatType": "direct",
    "participants": 2
  }
}
```

---

### 4. Send Message
**POST** `/api/chats/:chatId/messages`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Hello! How are you doing?",
  "messageType": "text",
  "attachments": [],
  "replyTo": null
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "chatId": "507f1f77bcf86cd799439011",
    "senderId": {
      "_id": "...",
      "username": "john",
      "avatar": "..."
    },
    "content": "Hello! How are you doing?",
    "messageType": "text",
    "readBy": [
      { "userId": "...", "readAt": "2026-01-08T11:55:00Z" }
    ],
    "edited": false,
    "createdAt": "2026-01-08T11:55:00Z"
  }
}
```

---

### 5. Edit Message
**PUT** `/api/chats/messages/:messageId`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Hello! Updated message"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "content": "Hello! Updated message",
    "edited": true,
    "editedAt": "2026-01-08T12:00:00Z",
    "editHistory": [
      {
        "content": "Hello! How are you doing?",
        "editedAt": "2026-01-08T12:00:00Z"
      }
    ]
  }
}
```

---

### 6. Delete Message
**DELETE** `/api/chats/messages/:messageId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

### 7. Add Participant to Group
**POST** `/api/chats/:chatId/participants`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439014"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Participant added successfully",
  "chat": {
    "_id": "507f1f77bcf86cd799439011",
    "groupName": "Project Team",
    "participants": [
      { "_id": "...", "username": "user1", "avatar": "..." },
      { "_id": "...", "username": "user2", "avatar": "..." },
      { "_id": "...", "username": "user3", "avatar": "..." }
    ]
  }
}
```

---

### 8. Remove Participant from Group
**DELETE** `/api/chats/:chatId/participants`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439014"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Participant removed successfully",
  "chat": {
    "_id": "507f1f77bcf86cd799439011",
    "participants": [
      { "_id": "...", "username": "user1", "avatar": "..." },
      { "_id": "...", "username": "user2", "avatar": "..." }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Direct chat must have exactly 2 participants"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not a participant in this chat"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Chat not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create chat",
  "error": "Error details"
}
```

---

## Testing Examples

### Create a direct chat
```bash
curl -X POST http://localhost:5000/api/chats \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatType": "direct",
    "participantIds": ["userId1", "userId2"]
  }'
```

### Create a group chat
```bash
curl -X POST http://localhost:5000/api/chats \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatType": "group",
    "groupName": "Development Team",
    "groupDescription": "Discussing new features",
    "participantIds": ["userId1", "userId2", "userId3"]
  }'
```

### Get chat list
```bash
curl -X GET "http://localhost:5000/api/chats?limit=20&skip=0" \
  -H "Authorization: Bearer TOKEN"
```

### Get chat history
```bash
curl -X GET "http://localhost:5000/api/chats/:chatId/messages?limit=50&skip=0" \
  -H "Authorization: Bearer TOKEN"
```

### Send a message
```bash
curl -X POST "http://localhost:5000/api/chats/:chatId/messages" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello everyone!",
    "messageType": "text"
  }'
```

---

## Key Features

### Direct Chats
- One-to-one messaging
- Automatic deduplication (won't create duplicate chats)
- Full message history

### Group Chats
- Multiple participants
- Admin controls for managing members
- Group customization (name, description, avatar)
- Participant addition/removal

### Messages
- Full edit history tracking
- Message reactions support
- Reply functionality
- Read receipts
- Soft deletion (messages marked as deleted but retained)
- Support for attachments and multiple message types

### Security
- ✅ Authentication required on all endpoints
- ✅ User validation (only participants can access chat)
- ✅ Admin-only operations for group management
- ✅ Input validation on all requests
- ✅ Pagination to prevent data overload

---

**Status**: Day 3 Complete ✅
**Last Updated**: January 8, 2026
