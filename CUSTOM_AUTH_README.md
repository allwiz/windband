# Custom Profile-Based Authentication System

This project has been upgraded from Supabase Auth to a custom profile table-based authentication system with role management.

## Overview

The new authentication system:
- ✅ **Custom Profile Table**: Uses `user_profiles` table instead of `auth.users`
- ✅ **Role-Based Access**: Admin and User roles
- ✅ **Session Management**: Custom session tokens with expiration
- ✅ **Security**: Bcrypt password hashing, account lockout, RLS policies
- ✅ **No External Dependencies**: Pure Supabase database functions

## Quick Setup

### 1. Run the Database Setup

1. Go to your Supabase SQL Editor: https://app.supabase.com/project/dcwofyezpqkkqvxyfiol/sql
2. Copy and paste the content from `profile-auth-setup.sql`
3. Run the script to create tables and functions

### 2. Initialize the System

```bash
node setup-custom-auth.js
```

This will:
- Create an admin user (admin@windband.com / admin123)
- Test the authentication system
- Verify everything is working

### 3. Start the Application

```bash
npm run dev
```

You can now login with the admin credentials and manage users.

## Database Schema

### Main Tables

#### `user_profiles`
```sql
- id: UUID (Primary Key)
- email: TEXT (Unique, Required)
- password_hash: TEXT (Bcrypt hashed)
- full_name: TEXT
- phone: TEXT
- role: TEXT ('user' | 'admin')
- status: TEXT ('active' | 'inactive' | 'pending')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_login: TIMESTAMP
- login_attempts: INTEGER
- locked_until: TIMESTAMP
```

#### `user_sessions`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to user_profiles)
- session_token: TEXT (Unique)
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
- last_accessed: TIMESTAMP
- ip_address: INET
- user_agent: TEXT
```

## API Functions

### Authentication Functions

#### `register_user(email, password, full_name, phone)`
- Creates a new user account
- Returns: `{success, message, user_id}`

#### `login_user(email, password, ip_address, user_agent)`
- Authenticates user and creates session
- Returns: `{success, message, user_id, session_token, expires_at, role, full_name}`
- Features: Account lockout after 5 failed attempts

#### `validate_session(session_token)`
- Validates session token and returns user info
- Returns: `{valid, user_id, role, full_name, email}`

#### `logout_user(session_token)`
- Destroys session
- Returns: `boolean`

#### `change_password(user_id, old_password, new_password)`
- Changes user password
- Returns: `{success, message}`

### Admin Functions

#### `set_user_role(admin_id, target_user_id, new_role)`
- Admin-only function to change user roles
- Returns: `{success, message}`

#### `cleanup_expired_sessions()`
- Removes expired sessions
- Returns: `deleted_count`

## Frontend Integration

### AuthContext Updates

The `AuthContext` has been updated to use the new authentication system:

```jsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const {
    user,           // Current user object {id, email, role, fullName}
    loading,        // Loading state
    signIn,         // Login function
    signUp,         // Registration function
    signOut,        // Logout function
    isAdmin,        // Check if user is admin
    hasRole,        // Check specific role
    getAllUsers,    // Get all users (admin only)
    setUserRole,    // Set user role (admin only)
    updateProfile   // Update user profile
  } = useAuth()

  // Usage examples
  const handleLogin = async () => {
    const { data, error } = await signIn(email, password)
    if (error) console.error(error.message)
  }

  const handleRegister = async () => {
    const { data, error } = await signUp(email, password, {
      full_name: fullName,
      phone: phoneNumber
    })
    if (error) console.error(error.message)
  }

  const handleMakeAdmin = async (userId) => {
    if (isAdmin()) {
      const result = await setUserRole(userId, 'admin')
      if (!result.success) console.error(result.message)
    }
  }
}
```

## Role-Based Access Control

### Admin Access

Components like `AdminRoute` automatically check for admin role:

```jsx
import AdminRoute from './components/AdminRoute'

// Only admins can access this
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

### Programmatic Role Checks

```jsx
const { user, isAdmin, hasRole } = useAuth()

// Check if user is admin
if (isAdmin()) {
  // Show admin features
}

// Check specific role
if (hasRole('admin')) {
  // Show admin-specific content
}

// Check user data
if (user?.role === 'admin') {
  // Alternative way to check role
}
```

## Security Features

### Password Security
- ✅ Bcrypt hashing with salt rounds (10)
- ✅ Minimum password requirements (enforced by frontend)
- ✅ Secure password change function

### Account Protection
- ✅ Account lockout after 5 failed login attempts
- ✅ 15-minute lockout duration
- ✅ Login attempt tracking

### Session Security
- ✅ Cryptographically secure session tokens
- ✅ 7-day session expiration
- ✅ Session cleanup for expired tokens
- ✅ IP and User Agent tracking

### Database Security
- ✅ Row Level Security (RLS) policies
- ✅ Function-level security with SECURITY DEFINER
- ✅ User context setting for proper RLS enforcement

## Migration Notes

### Changes from Supabase Auth

1. **User Object Structure**:
   ```js
   // OLD (Supabase Auth)
   user = {
     id: "uuid",
     email: "email@example.com",
     user_metadata: { full_name: "Name" }
   }
   profile = {
     id: "uuid",
     role: "admin",
     // other profile fields
   }

   // NEW (Custom Auth)
   user = {
     id: "uuid",
     email: "email@example.com",
     role: "admin",
     fullName: "Name"
   }
   ```

2. **Authentication Functions**:
   ```js
   // OLD
   supabase.auth.signInWithPassword()
   supabase.auth.signUp()
   supabase.auth.signOut()

   // NEW
   authDb.login()
   authDb.register()
   authDb.logout()
   ```

3. **Role Checking**:
   ```js
   // OLD
   profile?.role === 'admin'

   // NEW
   user?.role === 'admin'
   // or use helper functions
   isAdmin()
   ```

## Troubleshooting

### Common Issues

#### "relation 'user_profiles' does not exist"
- Run the SQL setup script in Supabase SQL Editor
- Make sure all tables and functions are created

#### "Permission denied for function"
- Check RLS policies are properly configured
- Ensure user context is set correctly

#### Login fails with correct credentials
- Check if account is locked (wait 15 minutes or reset in database)
- Verify password was hashed correctly during registration

#### Session validation fails
- Check if session has expired (7 days)
- Verify session token is stored correctly in localStorage

### Database Queries for Debugging

```sql
-- Check all users
SELECT id, email, full_name, role, status, login_attempts, locked_until
FROM user_profiles;

-- Check active sessions
SELECT s.*, u.email, u.full_name
FROM user_sessions s
JOIN user_profiles u ON s.user_id = u.id
WHERE s.expires_at > NOW();

-- Reset locked account
UPDATE user_profiles
SET login_attempts = 0, locked_until = NULL
WHERE email = 'user@example.com';

-- Clean expired sessions
SELECT cleanup_expired_sessions();
```

## Admin Panel Features

The admin panel (`/admin`) now includes:

1. **User Management**:
   - View all users
   - Change user roles (Admin ↔ User)
   - Filter by role and status
   - Search users

2. **Role Management**:
   - Promote users to admin
   - Demote admins to regular users
   - Visual role indicators

3. **Session Management**:
   - View active sessions
   - Session cleanup tools

## Default Credentials

After setup, you can login with:
- **Email**: admin@windband.com
- **Password**: admin123

⚠️ **Important**: Change these credentials immediately after first login!

## Maintenance

### Regular Tasks

1. **Clean expired sessions** (recommended weekly):
   ```sql
   SELECT cleanup_expired_sessions();
   ```

2. **Monitor failed login attempts**:
   ```sql
   SELECT email, login_attempts, locked_until
   FROM user_profiles
   WHERE login_attempts > 0;
   ```

3. **Review admin users**:
   ```sql
   SELECT email, full_name, role, last_login
   FROM user_profiles
   WHERE role = 'admin';
   ```

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify database setup with the SQL queries above
3. Test with the setup script: `node setup-custom-auth.js`
4. Check Supabase logs for database errors

The system is designed to be robust and secure while providing a smooth user experience.