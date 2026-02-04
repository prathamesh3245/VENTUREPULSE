# VenturePulse Authentication & Authorization Setup

This document provides instructions for setting up the authentication and authorization system for VenturePulse.

## Features Implemented

### Authentication
- **User Registration**: Separate registration flows for Investment Bankers and Startups
- **User Login**: Unified login system for both user types
- **JWT-based Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing for security

### Authorization
- **SEBI Registration**: Investment Bankers must provide SEBI Registration Number (Format: IN-SEBI-XXXXX)
- **Startup Unique ID**: Startups must provide Indian Government Platform ID (Format: DIPP/STARTUP/XXXXXX)
- **Role-based Access Control**: Different endpoints for different user types
- **Verification System**: Placeholder for SEBI and Indian gov platform API integration

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **Python** (for Flask ML backend)

## Backend Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `express` - Web framework
- Other existing dependencies

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update the `MONGODB_URI` in your environment variables

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/venturepulse
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

### 4. Start Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## API Endpoints

### Authentication Endpoints

#### Register Investment Banker
```
POST /api/auth/register/investment-banker
Body: {
  email: string,
  password: string,
  name: string,
  companyName?: string,
  sebiRegistrationNumber: string, // Format: IN-SEBI-XXXXX
  phone?: string
}
```

#### Register Startup
```
POST /api/auth/register/startup
Body: {
  email: string,
  password: string,
  name: string,
  companyName?: string,
  startupUniqueId: string, // Format: DIPP/STARTUP/XXXXXX
  phone?: string
}
```

#### Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  token: string,
  user: object
}
```

#### Get Current User
```
GET /api/auth/me
Headers: {
  Authorization: Bearer <token>
}
```

### Protected Endpoints

#### Prediction (Requires Authentication)
```
POST /getPredict
Headers: {
  Authorization: Bearer <token>
}
Body: {
  features: number[]
}
```

#### Investment Banker Dashboard (Requires SEBI Verification)
```
GET /api/investment-banker/dashboard
Headers: {
  Authorization: Bearer <token>
}
```

#### Startup Dashboard (Requires Startup ID Verification)
```
GET /api/startup/dashboard
Headers: {
  Authorization: Bearer <token>
}
```

## Frontend Routes

- `/` - Home page (public)
- `/login` - Login page
- `/register` - Registration page (with user type selection)
- `/dashboard` - User dashboard (protected, requires authentication)

## User Types

### Investment Banker
- Must provide SEBI Registration Number
- Format: `IN-SEBI-XXXXX` (e.g., `IN-SEBI-12345`)
- SEBI verification status tracked in database
- Access to investment banker-specific features

### Startup
- Must provide Indian Government Platform Startup Unique ID
- Format: `DIPP/STARTUP/XXXXXX` or `GOV/STARTUP/XXXXXX` (e.g., `DIPP/STARTUP/123456`)
- Startup ID verification status tracked in database
- Access to startup-specific features

## Verification System

Currently, the verification endpoints (`/api/auth/verify/sebi/:userId` and `/api/auth/verify/startup/:userId`) are placeholder implementations. In production, these should:

1. **SEBI Verification**: Integrate with SEBI's official API or database to verify registration numbers
2. **Startup Verification**: Integrate with Indian government's startup platform API (e.g., Startup India portal) to verify unique IDs

## Security Considerations

1. **JWT Secret**: Always use a strong, random secret key in production
2. **Password Requirements**: Currently minimum 6 characters - consider adding complexity requirements
3. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly for production
6. **Input Validation**: Additional validation can be added as needed

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  userType: String (enum: ['investment_banker', 'startup'], required),
  sebiRegistrationNumber: String (unique, sparse, for investment bankers),
  sebiVerified: Boolean (default: false),
  startupUniqueId: String (unique, sparse, for startups),
  startupVerified: Boolean (default: false),
  name: String (required),
  companyName: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing the Authentication

### 1. Register an Investment Banker
```bash
curl -X POST http://localhost:3000/api/auth/register/investment-banker \
  -H "Content-Type: application/json" \
  -d '{
    "email": "banker@example.com",
    "password": "password123",
    "name": "John Banker",
    "companyName": "ABC Investments",
    "sebiRegistrationNumber": "IN-SEBI-12345"
  }'
```

### 2. Register a Startup
```bash
curl -X POST http://localhost:3000/api/auth/register/startup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "startup@example.com",
    "password": "password123",
    "name": "Jane Founder",
    "companyName": "Tech Startup Inc",
    "startupUniqueId": "DIPP/STARTUP/123456"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "banker@example.com",
    "password": "password123"
  }'
```

### 4. Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-token-here>"
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify MongoDB port (default: 27017)

### JWT Token Issues
- Ensure `JWT_SECRET` is set in environment variables
- Check token expiration (default: 7 days)
- Verify token is sent in `Authorization` header as `Bearer <token>`

### Frontend Issues
- Ensure backend server is running on port 3000
- Check browser console for CORS errors
- Verify API endpoints match backend routes

## Next Steps

1. Integrate actual SEBI API for verification
2. Integrate Indian government startup platform API for verification
3. Add email verification
4. Add password reset functionality
5. Add admin panel for managing verifications
6. Add more granular role-based permissions
7. Add audit logging for security
