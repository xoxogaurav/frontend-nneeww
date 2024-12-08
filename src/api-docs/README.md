# TaskFlow API Documentation

## Base URL
```
https://bookmaster.fun/api
```

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

The JWT token contains the user's ID and role (admin/user). This token is used to:
1. Authenticate the user
2. Identify the user for all protected endpoints
3. Authorize access to admin-only features

### Token Contents
The JWT payload contains:
```json
{
  "userId": 123,
  "email": "user@example.com",
  "isAdmin": false,
  "iat": 1677483600,
  "exp": 1677487200
}
```

## Protected Endpoints
For endpoints like `/transactions` or `/notifications`, the API middleware:
1. Extracts the user ID from the JWT token
2. Automatically filters data based on the authenticated user
3. Prevents access to other users' data

Example middleware flow:
```javascript
// Authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'No token provided' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds user info to request object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }
};

// Example protected route
app.get('/transactions', authenticateUser, (req, res) => {
  // req.user.userId is available from the token
  const userTransactions = await Transaction.findAll({
    where: { userId: req.user.userId }
  });
  res.json({ success: true, data: userTransactions });
});
```

## Response Format
All endpoints return JSON responses in the following format:
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message"
}
```

## Error Format
Errors are returned in the following format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized (Invalid or missing token)
- 403: Forbidden (Valid token but insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
API requests are limited to 100 requests per minute per IP address.

## Endpoints Overview

### Authentication
- POST /auth/register - Register a new user
- POST /auth/login - Login user
- POST /auth/logout - Logout user
- POST /auth/refresh - Refresh JWT token

### Users
- GET /users/profile - Get current user profile (uses token)
- PUT /users/profile - Update user profile (uses token)
- GET /users/leaderboard - Get top users leaderboard

### Tasks
- GET /tasks - List all active tasks
- POST /tasks - Create new task (admin only, uses token)
- POST /tasks/:taskId/submit - Submit task completion (uses token)
- PUT /tasks/:taskId/review - Review task submission (admin only, uses token)

### Transactions
- GET /transactions - List user transactions (filtered by token)
- POST /transactions/withdraw - Request withdrawal (uses token)

### Notifications
- GET /notifications - List user notifications (filtered by token)
- PUT /notifications/:id/read - Mark notification as read (validates owner via token)
- PUT /notifications/read-all - Mark all notifications as read (filtered by token)

## Security Considerations
1. All protected endpoints verify the JWT token before processing requests
2. User data is automatically scoped to the authenticated user
3. Admin-only endpoints check for admin role in the token
4. Cross-Origin Resource Sharing (CORS) is properly configured
5. Rate limiting prevents abuse
6. Token expiration requires periodic renewal

## Detailed API Documentation
See the `routes.ts` file for detailed request/response examples for each endpoint.