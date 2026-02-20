# PR Review System - Backend

Express + TypeScript + MongoDB backend for the PR Review Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/pr-review-system
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

4. Make sure MongoDB is running locally or update `MONGODB_URI` in `.env`

5. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   └── auth.controller.ts   # Auth logic
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   └── notFound.ts          # 404 handler
│   ├── models/
│   │   └── User.ts              # User schema
│   ├── routes/
│   │   └── auth.routes.ts       # Auth routes
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── .env.example                 # Environment variables template
├── package.json
└── tsconfig.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "developer"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (protected)
  - Requires: `Authorization: Bearer <token>`

### Health Check
- `GET /health` - Server health check

## Database Schema

### User Model
- `name`: String (required, 2-100 chars)
- `email`: String (required, unique, indexed)
- `password`: String (required, min 6 chars, hashed)
- `role`: Enum ['developer', 'reviewer'] (required, default: 'developer')
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time (default: 7d)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
