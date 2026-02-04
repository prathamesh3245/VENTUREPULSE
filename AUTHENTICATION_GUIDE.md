# User Authentication Guide for VenturePulse

## Overview

VenturePulse uses **JWT (JSON Web Token)** based authentication with role-based authorization. The system supports two user types:
1. **Investment Bankers** (requires SEBI Registration Number)
2. **Startups** (requires Indian Government Platform Startup ID)

---

## 🔐 Authentication Flow

### 1. **Registration** → 2. **Login** → 3. **Get JWT Token** → 4. **Use Token for Protected Routes**

---

## 📋 Step-by-Step Authentication Process

### **Method 1: Using the Frontend UI** (Recommended)

#### **Step 1: Register a New User**

1. **Navigate to Registration Page:**
   - Open: `http://localhost:5173/register`
   - Or click "Register here" from the login page

2. **Choose User Type:**
   - Click **"Startup"** or **"Investment Banker"** button

3. **Fill Registration Form:**

   **For Investment Bankers:**
   ```
   - Full Name: John Doe
   - Email: banker@example.com
   - Password: password123 (minimum 6 characters)
   - Company Name: ABC Investments (optional)
   - Phone: +91-1234567890 (optional)
   - SEBI Registration Number: IN-SEBI-12345 (required, format: IN-SEBI-XXXXX)
   ```

   **For Startups:**
   ```
   - Full Name: Jane Founder
   - Email: startup@example.com
   - Password: password123 (minimum 6 characters)
   - Company Name: Tech Startup Inc (optional)
   - Phone: +91-1234567890 (optional)
   - Startup Unique ID: DIPP/STARTUP/123456 (required, format: DIPP/STARTUP/XXXXXX)
   ```

4. **Submit Form:**
   - Click "Register" button
   - You'll be automatically logged in and redirected to `/dashboard`
   - JWT token is stored in browser's localStorage

#### **Step 2: Login (if already registered)**

1. **Navigate to Login Page:**
   - Open: `http://localhost:5173/login`
   - Or click "Login here" from registration page

2. **Enter Credentials:**
   ```
   Email: your-email@example.com
   Password: your-password
   ```

3. **Submit:**
   - Click "Login" button
   - You'll be redirected to `/dashboard`
   - JWT token is stored in browser's localStorage

#### **Step 3: Access Protected Routes**

- After login, you can access:
  - `/dashboard` - User dashboard (automatically protected)
  - All API endpoints that require authentication

---

### **Method 2: Using API Directly (cURL/Postman)**

#### **Step 1: Register Investment Banker**

```bash
curl -X POST http://localhost:3000/api/auth/register/investment-banker \
  -H "Content-Type: application/json" \
  -d '{
    "email": "banker@example.com",
    "password": "password123",
    "name": "John Banker",
    "companyName": "ABC Investments",
    "sebiRegistrationNumber": "IN-SEBI-12345",
    "phone": "+91-1234567890"
  }'
```

**Response:**
```json
{
  "message": "Investment banker registered successfully. SEBI verification pending.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "banker@example.com",
    "name": "John Banker",
    "userType": "investment_banker",
    "sebiRegistrationNumber": "IN-SEBI-12345",
    "sebiVerified": false
  }
}
```

#### **Step 2: Register Startup**

```bash
curl -X POST http://localhost:3000/api/auth/register/startup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "startup@example.com",
    "password": "password123",
    "name": "Jane Founder",
    "companyName": "Tech Startup Inc",
    "startupUniqueId": "DIPP/STARTUP/123456",
    "phone": "+91-1234567890"
  }'
```

**Response:**
```json
{
  "message": "Startup registered successfully. Startup ID verification pending.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "startup@example.com",
    "name": "Jane Founder",
    "userType": "startup",
    "startupUniqueId": "DIPP/STARTUP/123456",
    "startupVerified": false
  }
}
```

#### **Step 3: Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "banker@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "banker@example.com",
    "name": "John Banker",
    "userType": "investment_banker",
    "companyName": "ABC Investments",
    "sebiRegistrationNumber": "IN-SEBI-12345",
    "sebiVerified": false
  }
}
```

#### **Step 4: Use Token for Protected Routes**

Save the token from the response, then use it in the Authorization header:

```bash
# Get current user profile
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Access protected prediction endpoint
curl -X POST http://localhost:3000/getPredict \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "features": [1.5, 2.3, 0.7, 4.2, 1.8]
  }'

# Investment Banker Dashboard (requires SEBI verification)
curl -X GET http://localhost:3000/api/investment-banker/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Startup Dashboard (requires Startup ID verification)
curl -X GET http://localhost:3000/api/startup/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔑 Token Management

### **How Tokens Work:**

1. **Token Generation:**
   - Generated automatically on successful registration/login
   - Valid for **7 days**
   - Contains user ID encrypted with JWT_SECRET

2. **Token Storage (Frontend):**
   - Stored in `localStorage` as `'token'`
   - Automatically included in API requests via `getAuthHeaders()`

3. **Token Usage:**
   - Sent in `Authorization` header: `Bearer <token>`
   - Backend validates token on each protected route

### **Token Expiration:**
- Tokens expire after 7 days
- User needs to login again after expiration
- Frontend automatically checks token validity on app load

---

## 🛡️ Protected Routes & Authorization

### **Public Routes (No Authentication Required):**
- `GET /health` - Health check
- `POST /api/auth/register/investment-banker` - Registration
- `POST /api/auth/register/startup` - Registration
- `POST /api/auth/login` - Login

### **Protected Routes (Authentication Required):**
- `GET /api/auth/me` - Get current user profile
- `POST /getPredict` - ML prediction endpoint
- `GET /api/investment-banker/dashboard` - Investment banker dashboard (requires SEBI verification)
- `GET /api/startup/dashboard` - Startup dashboard (requires Startup ID verification)

### **Authorization Levels:**

1. **Basic Authentication:**
   - Any logged-in user can access
   - Example: `/api/auth/me`, `/getPredict`

2. **SEBI Verification Required:**
   - Only verified investment bankers
   - Example: `/api/investment-banker/dashboard`

3. **Startup ID Verification Required:**
   - Only verified startups
   - Example: `/api/startup/dashboard`

---

## 📝 ID Format Requirements

### **SEBI Registration Number:**
- **Format:** `IN-SEBI-XXXXX`
- **Pattern:** `IN-SEBI-[A-Z0-9]{5,10}`
- **Examples:**
  - ✅ `IN-SEBI-12345`
  - ✅ `IN-SEBI-ABC123`
  - ❌ `IN-SEBI-123` (too short)
  - ❌ `SEBI-12345` (missing IN- prefix)

### **Startup Unique ID:**
- **Format:** `DIPP/STARTUP/XXXXXX` or `GOV/STARTUP/XXXXXX`
- **Pattern:** `(DIPP|STARTUP|GOV)[\/\-][A-Z0-9]{6,12}`
- **Examples:**
  - ✅ `DIPP/STARTUP/123456`
  - ✅ `GOV/STARTUP/ABC123`
  - ✅ `STARTUP-123456`
  - ❌ `DIPP/123456` (missing STARTUP)
  - ❌ `DIPP/STARTUP/123` (too short)

---

## 🔍 Verification Status

### **Initial Status:**
- Both `sebiVerified` and `startupVerified` are `false` after registration
- Users can still login and access basic features
- Some features require verification

### **Verification Endpoints:**

**Verify SEBI Registration:**
```bash
POST /api/auth/verify/sebi/:userId
Headers: Authorization: Bearer <token>
```

**Verify Startup ID:**
```bash
POST /api/auth/verify/startup/:userId
Headers: Authorization: Bearer <token>
```

**Note:** In production, these should integrate with actual SEBI and Indian government APIs.

---

## 💻 Frontend Usage

### **Using Auth Context in React Components:**

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,           // Current user object
    token,          // JWT token
    isAuthenticated, // Boolean: true if logged in
    login,          // Function: login(email, password)
    logout,         // Function: logout()
    getAuthHeaders  // Function: returns headers with token
  } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  // Access user data
  console.log(user.name, user.email, user.userType);

  // Make authenticated API call
  const fetchData = async () => {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: getAuthHeaders()
    });
    const data = await response.json();
  };

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### **Protected Routes:**

```javascript
import { ProtectedRoute } from './Components/ProtectedRoute';

// In your router
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  } 
/>

// For role-specific routes
<Route 
  path="/banker-dashboard" 
  element={
    <ProtectedRoute requiredUserType="investment_banker">
      <BankerDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 🚨 Error Handling

### **Common Errors:**

1. **401 Unauthorized:**
   - Missing or invalid token
   - Token expired
   - Solution: Login again

2. **403 Forbidden:**
   - User doesn't have required permissions
   - SEBI/Startup ID not verified
   - Solution: Complete verification

3. **400 Bad Request:**
   - Invalid ID format
   - Missing required fields
   - Email already exists
   - Solution: Check input format and requirements

---

## 🔐 Security Best Practices

1. **Never expose JWT_SECRET** in client-side code
2. **Use HTTPS** in production
3. **Store tokens securely** (localStorage is OK for this app, but consider httpOnly cookies for production)
4. **Validate all inputs** on both client and server
5. **Implement rate limiting** to prevent brute force attacks
6. **Set strong passwords** (consider adding complexity requirements)

---

## 📚 API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register/investment-banker` | No | Register investment banker |
| POST | `/api/auth/register/startup` | No | Register startup |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/verify/sebi/:userId` | Yes | Verify SEBI registration |
| POST | `/api/auth/verify/startup/:userId` | Yes | Verify startup ID |
| POST | `/getPredict` | Yes | ML prediction |
| GET | `/api/investment-banker/dashboard` | Yes + SEBI | Banker dashboard |
| GET | `/api/startup/dashboard` | Yes + Startup | Startup dashboard |

---

## 🎯 Quick Start Example

1. **Start servers:**
   ```bash
   # Backend
   npm start
   
   # Frontend (in another terminal)
   cd frontend && npm run dev
   ```

2. **Register a user:**
   - Go to `http://localhost:5173/register`
   - Choose "Startup" or "Investment Banker"
   - Fill form and submit

3. **Login:**
   - Go to `http://localhost:5173/login`
   - Enter credentials and login

4. **Access dashboard:**
   - Automatically redirected to `/dashboard`
   - View user information and verification status

---

## ✅ Testing Authentication

### **Test Registration:**
```bash
# Investment Banker
curl -X POST http://localhost:3000/api/auth/register/investment-banker \
  -H "Content-Type: application/json" \
  -d '{"email":"test@banker.com","password":"test123","name":"Test Banker","sebiRegistrationNumber":"IN-SEBI-TEST1"}'

# Startup
curl -X POST http://localhost:3000/api/auth/register/startup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@startup.com","password":"test123","name":"Test Startup","startupUniqueId":"DIPP/STARTUP/TEST1"}'
```

### **Test Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@banker.com","password":"test123"}'
```

### **Test Protected Route:**
```bash
# Replace YOUR_TOKEN with actual token from login response
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

That's it! You now know how to authenticate users in VenturePulse. 🎉
