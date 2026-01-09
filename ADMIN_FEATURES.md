# Admin Login and Dashboard Features

## Overview
This document outlines the admin login and dashboard features implemented in the Climate Engagement Platform.

## Admin User Creation

To create an admin user, run the following command:

```bash
npm run create-admin [email] [password] [name]
```

Examples:
```bash
# Creates an admin with default credentials (admin@example.com, admin123)
npm run create-admin

# Creates an admin with custom credentials
npm run create-admin admin@yourdomain.com mypassword123 "Your Admin Name"
```

## Admin Login Access

There are two ways to access the admin panel:

### 1. Direct Admin Login Page
- Navigate to `/admin/login`
- Enter your admin credentials
- You will be redirected to the admin dashboard if you have admin privileges

### 2. From Regular Login
- If you're logging in with admin credentials, you can access the admin dashboard through the navigation bar that appears after login
- An "Admin Panel" notification bar will appear at the top of the screen with a link to the admin dashboard

## Admin Dashboard Features

Once logged in as an admin, you have access to:

### Dashboard Statistics
- Total number of users registered
- Number of active users today
- Total number of posts created

### User Management
- View all users in the system
- See their roles (user, moderator, admin)
- Edit user roles
- Delete users

### Report Management
- View all reported content/users
- Update report statuses (pending, reviewed, resolved)

## Security Features

- Admin routes are protected by the `requireAdmin` middleware
- Only users with the `admin` role can access admin features
- JWT tokens are used for authentication
- Role-based access control ensures proper permissions

## Navigation

When logged in as an admin:
- A yellow admin notification bar appears at the top of every page
- It contains a direct link to the admin dashboard
- The regular user interface remains accessible alongside admin features

## API Endpoints

Protected admin endpoints include:
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/reports` - Get all reports
- `PUT /api/admin/reports/:reportId` - Update report status