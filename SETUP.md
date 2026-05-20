# Backend Setup Guide

## Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Git

## Installation Steps

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the server directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job_portal?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_make_it_random_and_long_at_least_32_chars

# Frontend
CLIENT_URL=http://localhost:5173
```

### 4. MongoDB Atlas Setup
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project
4. Create a database cluster (free tier)
5. Create a database user with password
6. Add your IP to whitelist (or 0.0.0.0/0 for development)
7. Click "Connect" and copy the connection string
8. Replace username, password in MONGODB_URI

### 5. Start Development Server
```bash
npm run dev
```

Server will run on: **http://localhost:5000**

### API Testing

Test the API with cURL or Postman:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all jobs
curl http://localhost:5000/api/job

# Get all categories
curl http://localhost:5000/api/category
```

### Database Structure

Once connected, MongoDB will automatically create:
- `users` collection
- `categories` collection
- `jobs` collection
- `applications` collection

### Production Deployment

See main README.md for Render deployment instructions.

## Troubleshooting

**Connection Error?**
- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas
- Ensure network connection

**Port in use?**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
# Or change PORT in .env
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Auth logic
│   ├── categoryController.js # Category logic
│   ├── jobController.js      # Job logic
│   ├── applicationController.js
│   └── userController.js
├── middleware/
│   ├── auth.js               # JWT verification
│   └── errorHandler.js       # Error handling
├── models/
│   ├── User.js
│   ├── Category.js
│   ├── Job.js
│   └── Application.js
├── routes/
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   └── userRoutes.js
├── utils/
│   └── multer.js             # File upload config
├── uploads/                  # Resume storage
├── server.js                 # Entry point
├── .env                      # Environment variables
└── package.json
```

## Available Scripts

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start

# Check for errors
npm run lint
```
