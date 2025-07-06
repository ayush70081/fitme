# Fitness Tracker Backend API

A robust Node.js/Express backend API for fitness tracking with authentication and user management.

## Tech Stack

- Node.js & Express.js
- MongoDB Atlas & Mongoose
- JWT Authentication
- Bcrypt password hashing
- Input validation with express-validator

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up MongoDB Atlas:**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier available)
   - Create a database user with read/write permissions
   - Add your IP address to the IP whitelist
   - Get your connection string

3. **Configure environment:**
   - Copy `env.example` to `.env`
   - Update the `.env` file with your MongoDB connection string and JWT secret
```bash
# Copy the example file
cp env.example .env
# Then edit .env with your actual values
```

4. **Test the setup (optional):**
```bash
node test-server.js
```

5. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### User Management
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/profile-photo` - Update profile photo
- `DELETE /api/user/profile-photo` - Delete profile photo
- `GET /api/user/stats` - Get user statistics
- `PUT /api/user/email` - Update email
- `GET /api/user/preferences` - Get preferences
- `DELETE /api/user/account` - Delete account

## Example Usage

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

The API returns JWT tokens for authentication. Include the access token in subsequent requests:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your_access_token"
```

## Features

- User registration and authentication
- Profile management with fitness data
- BMI, BMR, TDEE calculations
- Secure password hashing
- JWT token authentication
- Input validation and sanitization
- Rate limiting and security headers

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend root directory:
   ```env
   # Environment Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Atlas Configuration
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/fitness-tracker?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
   JWT_EXPIRE=7d

   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   ```

4. **MongoDB Atlas Setup:**
   - Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Create a database user
   - Whitelist your IP address
   - Get your connection string and add it to `.env`

5. **Start the server:**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "profileCompleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt_access_token
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123",
  "confirmNewPassword": "NewPassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer jwt_access_token
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer jwt_access_token
```

### User Management Endpoints

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "height": 180,
  "weight": 75,
  "activityLevel": "moderately-active",
  "fitnessGoals": ["weight-loss", "muscle-gain"]
}
```

#### Update Profile Photo
```http
PUT /api/user/profile-photo
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "profilePhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**Request Body:**
- `profilePhoto` (string): Base64 encoded image data URI

**Validation:**
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- Must be valid base64 data URI format

**Response:**
```json
{
  "success": true,
  "message": "Profile photo updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "profilePhoto": "data:image/jpeg;base64,..."
    },
    "photoSize": "1.2MB"
  }
}
```

#### Delete Profile Photo
```http
DELETE /api/user/profile-photo
Authorization: Bearer jwt_access_token
```

**Response:**
```json
{
  "success": true,
  "message": "Profile photo deleted successfully",
  "data": {
    "user": {
      "id": "user_id"
      // profilePhoto field is removed
    }
  }
}
```

#### Get User Statistics
```http
GET /api/user/stats
Authorization: Bearer jwt_access_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "accountAge": 30,
      "profileCompleteness": 100,
      "bmi": 23.1,
      "bmr": 1800,
      "tdee": 2400,
      "age": 34,
      "fitnessGoalsCount": 2
    }
  }
}
```

#### Update Email
```http
PUT /api/user/email
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "password": "Password123"
}
```

#### Get User Preferences
```http
GET /api/user/preferences
Authorization: Bearer jwt_access_token
```

#### Delete Account
```http
DELETE /api/user/account
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "password": "Password123"
}
```

### Health Check
```http
GET /api/health
```

## Data Models

### User Schema
```javascript
{
  email: String, // required, unique
  password: String, // required, hashed
  firstName: String, // required
  lastName: String, // required
  username: String, // unique
  profilePhoto: String, // base64 data URI, max 5MB
  dateOfBirth: Date,
  gender: String, // enum: ['male', 'female', 'other', 'prefer-not-to-say']
  height: Number, // in cm
  weight: Number, // in kg
  activityLevel: String, // enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active']
  fitnessGoals: [String], // array of fitness goals
  isEmailVerified: Boolean,
  profileCompleted: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules

### Registration
- **Email**: Valid email format, unique
- **Password**: Minimum 6 characters, must contain uppercase, lowercase, and number
- **First/Last Name**: 2-50 characters, letters and spaces only
- **Username**: 3-30 characters, alphanumeric and underscores only

### Profile Update
- **Date of Birth**: Valid date, age between 13-120 years
- **Height**: 50-300 cm
- **Weight**: 20-500 kg
- **Gender**: One of predefined options
- **Activity Level**: One of predefined levels
- **Fitness Goals**: Array of valid goal options

## Security Features

- **Password Hashing**: Bcrypt with salt rounds of 12
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for frontend domain
- **Security Headers**: Helmet middleware for security headers
- **Error Handling**: Comprehensive error handling without exposing sensitive data

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ // Optional detailed errors
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created (registration, etc.)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Development

### Available Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Test profile photo functionality
npm run test:profile-photo

# Run tests (if implemented)
npm test
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## Deployment

1. Set up MongoDB Atlas production cluster
2. Configure environment variables for production
3. Use a strong JWT secret (minimum 32 characters)
4. Set `NODE_ENV=production`
5. Use HTTPS in production
6. Configure proper CORS settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 