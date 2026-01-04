# Real-Time Chat Application - Development Guide

## Project Overview
A scalable real-time chat application built with Node.js, Express, Socket.io, and MongoDB using a 7-day feature-driven development schedule.

## Architecture
- **Backend**: Express.js RESTful API
- **Real-Time**: Socket.io for WebSocket communication
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, bcryptjs

## Day 1: Project Setup & Core Architecture

### ✅ Completed Tasks
1. ✅ Project scaffolding with folder structure
2. ✅ Node.js/Express server setup
3. ✅ MongoDB connection configuration
4. ✅ Health check API endpoints
5. ✅ Environment configuration
6. ✅ Logging utility
7. ✅ Security middleware (Helmet, CORS)

### 📂 Project Structure
```
src/
├── server.js                 # Main server entry point
├── config/
│   ├── database.js          # MongoDB connection
│   └── environment.js       # Environment variables
├── routes/
│   └── health.js            # Health check endpoints
├── utils/
│   └── logger.js            # Logging utility
└── (models/, controllers/, middleware/ coming in Day 2+)
```

### 🚀 Getting Started

#### Installation
```bash
npm install
```

#### Development
```bash
# Copy environment template
cp .env.example .env

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

#### Health Check
```bash
# Basic health check
curl http://localhost:5000/api/health

# Detailed health information
curl http://localhost:5000/api/health/detailed
```

### 📝 API Endpoints (Day 1)
- `GET /api/health` - Basic server health status
- `GET /api/health/detailed` - Detailed server information

### 📋 Day 1 Checklist
- [x] GitHub repo initialized
- [x] Folder structure created
- [x] Node.js backend running
- [x] MongoDB connection working
- [x] Health check API implemented
- [x] Environment configuration
- [x] Logging system
- [x] Security middleware

### 🔜 Next Steps (Day 2)
- User registration endpoint
- User login with JWT
- Password encryption
- Authentication middleware
- User profile management

## Development Rules
- Follow Git commit strategy: `feat: description`
- Use semantic versioning
- Add tests for new features
- Update README with changes
- Follow ESLint rules

## Debugging
- Enable debug logs: `LOG_LEVEL=debug npm run dev`
- Check MongoDB connection: `curl http://localhost:5000/api/health`
- View server uptime and memory usage in health endpoint

## Resources
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Socket.io Documentation](https://socket.io/docs)
- [Mongoose Documentation](https://mongoosejs.com)

---
**Status**: Day 1 Complete ✅
**Last Updated**: January 4, 2026
