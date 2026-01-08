# Admin API Quick Reference - New Endpoints

## User Management

### Update User
```typescript
// Update user details
PUT /api/admin/users/[userId]
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "manager",
  "permissions": ["view_analytics", "manage_users"],
  "isActive": true,
  "password": "newPassword123" // optional
}

// Response
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "_id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager"
  }
}
```

### Delete User
```typescript
// Delete user account
DELETE /api/admin/users/[userId]

// Response
{
  "success": true,
  "message": "User deleted successfully"
}

// Error - Cannot delete self
{
  "error": "Cannot delete your own account"
}
```

### Reset Password
```typescript
// Generate temporary password for user
POST /api/admin/users/reset
{
  "userId": "user123"
}

// Response
{
  "success": true,
  "message": "Password reset successfully",
  "tempPassword": "ABC12XYZ",
  "userEmail": "user@example.com",
  "instruction": "Share this temporary password with the user: ABC12XYZ"
}
```

## Orders

### Get Orders with Filtering
```typescript
// Get all orders
GET /api/admin/orders

// Filter by status
GET /api/admin/orders?status=delivered

// Filter by payment status
GET /api/admin/orders?paymentStatus=paid

// Filter by date range
GET /api/admin/orders?dateFrom=2024-01-01&dateTo=2024-01-31

// Combined filters with pagination
GET /api/admin/orders?status=delivered&paymentStatus=paid&dateFrom=2024-01-01&limit=50&offset=0

// Response
{
  "success": true,
  "orders": [
    {
      "_id": "order123",
      "orderId": "ORD-001",
      "status": "delivered",
      "paymentStatus": "paid",
      "total": 250.00,
      "customer": { "name": "John Doe", "email": "john@example.com" }
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 50,
    "offset": 0,
    "pages": 4
  }
}
```

**Status Values**: `pending_payment`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`
**Payment Status**: `paid`, `unpaid`

## Revenue Analytics

### Get Revenue Data
```typescript
// Get revenue for specific period
GET /api/admin/revenue?period=month

// Period options: today, week, month, all

// Response
{
  "success": true,
  "revenue": {
    "total": 45230.50,
    "averageOrderValue": 289.81,
    "totalOrders": 156,
    "byStatus": {
      "processing": 2500.00,
      "shipped": 8750.50,
      "delivered": 34000.00,
      "cancelled": 0.00,
      "refunded": 0.00,
      "pending_payment": 0.00
    },
    "byPaymentStatus": {
      "paid": 43230.50,
      "unpaid": 2000.00
    },
    "byPaymentMethod": {
      "Paid": 43230.50,
      "Unpaid": 2000.00
    },
    "dailyTrend": {
      "2024-01-01": 1250.00,
      "2024-01-02": 2100.50,
      // ... more days
    }
  },
  "period": "month"
}
```

## SMS Management

### Send SMS
```typescript
// Send SMS to recipients
POST /api/admin/sms/send
{
  "phoneNumbers": ["0501234567", "233501234568", "+233501234569"],
  "message": "Order #123 has been shipped!",
  "orderId": "order123" // optional
}

// Response
{
  "success": true,
  "message": "SMS sent to 3 recipient(s)",
  "messageId": "msg_abc123",
  "recipientCount": 3
}
```

**Phone Formats Accepted**:
- `0XXXXXXXXX` (Ghana format)
- `233XXXXXXXXX` (International format)
- `+233XXXXXXXXX` (With country code)

### Get SMS Statistics
```typescript
// Get SMS stats for period
GET /api/admin/sms/stats?period=month

// Period options: today, week, month, all

// Response
{
  "success": true,
  "stats": {
    "totalSMSSent": 245,
    "totalRecipients": 1205,
    "averageRecipientsPerSMS": 4.92,
    "statusBreakdown": {
      "sent": 240,
      "failed": 5,
      "pending": 0
    },
    "failureReasons": {
      "Invalid number": 3,
      "Network error": 2
    },
    "smsByUser": {
      "John Doe": 120,
      "Jane Smith": 125
    },
    "dailyTrend": {
      "2024-01-01": 5,
      "2024-01-02": 8,
      // ... more days
    }
  },
  "period": "month",
  "recentSMS": [
    {
      "_id": "sms123",
      "messageId": "msg_abc",
      "message": "Your order is ready!",
      "sentAt": "2024-01-15T10:30:00Z",
      "phoneNumbers": ["0501234567"]
    }
  ]
}
```

## Statistics

### Get Dashboard Stats
```typescript
// Get all dashboard statistics
GET /api/admin/stats

// Response
{
  "success": true,
  "totalOrders": 156,
  "pendingOrders": 12,
  "processingOrders": 25,
  "shippedOrders": 19,
  "completedOrders": 95,
  "cancelledOrders": 3,
  "refundedOrders": 2,
  "totalRevenue": 45230.50,
  "paidRevenue": 43230.50,
  "unpaidRevenue": 2000.00,
  "avgOrderValue": 289.81,
  "todaysRevenue": 1250.75,
  "todaysOrders": 5,
  "todaysPaidOrders": 4,
  "todaysUnpaidOrders": 1,
  "thisWeekRevenue": 8750.25,
  "totalCustomers": 89,
  "topProducts": [
    {
      "name": "Premium T-Shirt",
      "sales": 45,
      "revenue": 2250.00
    }
  ],
  "revenueByDay": [
    {
      "date": "2024-01-01",
      "revenue": 1250.00,
      "orders": 5
    }
  ]
}
```

## Error Handling

### Common Error Responses

**Unauthorized** (401)
```json
{
  "error": "Unauthorized"
}
```

**Not Found** (404)
```json
{
  "error": "User not found"
}
```

**Bad Request** (400)
```json
{
  "error": "Phone numbers array is required"
}
```

**Server Error** (500)
```json
{
  "error": "Failed to update user"
}
```

## Permission Requirements

| Endpoint | Permission |
|----------|-----------|
| User CRUD (PUT/DELETE) | `manage_users` |
| Password Reset | `manage_users` |
| View Orders | Authentication only |
| Filter Orders | Authentication only |
| View Revenue | `view_analytics` |
| Send SMS | `send_sms` |
| View SMS Stats | `view_analytics` |
| View Stats | Authentication only |

## Frontend Integration Examples

### React Hook for User Management
```typescript
const useUserManagement = () => {
  const updateUser = async (userId: string, data: any) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  const deleteUser = async (userId: string) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    })
    return response.json()
  }

  const resetPassword = async (userId: string) => {
    const response = await fetch('/api/admin/users/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    return response.json()
  }

  return { updateUser, deleteUser, resetPassword }
}
```

### React Hook for Orders
```typescript
const useOrders = () => {
  const [orders, setOrders] = useState([])

  const fetchOrders = async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`/api/admin/orders?${params}`)
    const data = await response.json()
    setOrders(data.orders)
    return data
  }

  return { orders, fetchOrders }
}
```

### React Hook for Revenue
```typescript
const useRevenue = () => {
  const [revenue, setRevenue] = useState(null)

  const fetchRevenue = async (period = 'month') => {
    const response = await fetch(`/api/admin/revenue?period=${period}`)
    const data = await response.json()
    setRevenue(data.revenue)
    return data
  }

  return { revenue, fetchRevenue }
}
```

## Rate Limiting & Caching

- **Cache-Control**: All endpoints return `no-store` headers
- **Admin APIs**: No rate limiting applied (internal use)
- **Sanity Queries**: May be rate-limited by Sanity (typically 100+ req/sec)

## Debugging Tips

1. **Check permissions**: User role must have required permissions
2. **Check session**: Session may have expired (24 hour expiry)
3. **Check data format**: Phone numbers must be string array
4. **Check dates**: Use ISO 8601 format for date filtering
5. **Check response headers**: Verify `Cache-Control` headers are set

## Common Use Cases

### Filter pending orders this week
```
GET /api/admin/orders?status=pending_payment&dateFrom=2024-01-08
```

### Get unpaid orders exceeding 7 days
```
GET /api/admin/orders?paymentStatus=unpaid&dateFrom=2024-01-08
```

### Calculate daily revenue for month
```
GET /api/admin/revenue?period=month
// Use dailyTrend data for charts
```

### Send order notification to customer
```
POST /api/admin/sms/send
{
  "phoneNumbers": ["0501234567"],
  "message": "Your order #123 has been confirmed!",
  "orderId": "order123"
}
```

### Track SMS campaign effectiveness
```
GET /api/admin/sms/stats?period=week
// Check dailyTrend to see engagement pattern
```
