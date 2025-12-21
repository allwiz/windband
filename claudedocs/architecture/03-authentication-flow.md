# Authentication Flow

## Overview

The windband application uses a **custom authentication system** built on Supabase RPC functions, not Supabase's built-in auth. This provides more control over the authentication process.

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT SIDE                                     │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐  │
│  │  Login/Signup   │    │   AuthContext   │    │    localStorage         │  │
│  │    Pages        │───▶│   (Provider)    │◀──▶│  windband_session       │  │
│  └─────────────────┘    └────────┬────────┘    └─────────────────────────┘  │
│                                  │                                           │
│                                  ▼                                           │
│                         ┌─────────────────┐                                  │
│                         │   authService   │                                  │
│                         │   (lib/auth.js) │                                  │
│                         └────────┬────────┘                                  │
└──────────────────────────────────┼───────────────────────────────────────────┘
                                   │ Supabase RPC Calls
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SUPABASE                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  RPC Functions (PostgreSQL)                                         │    │
│  │  ├── register_user(email, password, name, phone)                    │    │
│  │  ├── verify_email(token)                                            │    │
│  │  ├── login_user(email, password, ip, user_agent)                    │    │
│  │  ├── validate_session(token)                                        │    │
│  │  ├── logout_user(token)                                             │    │
│  │  ├── request_password_reset(email)                                  │    │
│  │  ├── reset_password(token, new_password)                            │    │
│  │  └── change_password(user_id, current_password, new_password)       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌────────────────────────────┐    ┌────────────────────────────┐          │
│  │  users table               │    │  sessions table            │          │
│  │  - id                      │    │  - id                      │          │
│  │  - email                   │    │  - user_id                 │          │
│  │  - password_hash           │    │  - session_token           │          │
│  │  - full_name               │    │  - expires_at              │          │
│  │  - role (user/admin)       │    │  - ip_address              │          │
│  │  - is_active               │    │  - user_agent              │          │
│  │  - email_verified          │    │  - created_at              │          │
│  └────────────────────────────┘    └────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flow 1: User Registration

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Signup  │     │  Auth    │     │  auth    │     │ Supabase │     │  Email   │
│  Page    │     │ Context  │     │ Service  │     │   RPC    │     │ Service  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ User fills form│                │                │                │
     │ clicks Submit  │                │                │                │
     │ ───────────────>                │                │                │
     │                │ signUp(email,  │                │                │
     │                │ password, name)│                │                │
     │                │ ───────────────>                │                │
     │                │                │ register_user()│                │
     │                │                │ ───────────────>                │
     │                │                │                │                │
     │                │                │  { success,    │                │
     │                │                │    user_id,    │                │
     │                │                │    token }     │                │
     │                │                │ <───────────────                │
     │                │                │                │                │
     │                │                │ sendVerificationEmail()         │
     │                │                │ ──────────────────────────────> │
     │                │                │                │                │
     │                │                │                │   Email sent   │
     │                │                │ <──────────────────────────────│
     │                │                │                │                │
     │                │ { success,     │                │                │
     │                │   message }    │                │                │
     │                │ <───────────────                │                │
     │                │                │                │                │
     │ Show success   │                │                │                │
     │ message        │                │                │                │
     │ <───────────────                │                │                │
     │                │                │                │                │
```

### Registration Steps:

1. **User fills signup form** (email, password, name, phone)
2. **Form validates input** (client-side validation)
3. **AuthContext.signUp()** called
4. **authService.register()** sends RPC call to Supabase
5. **Supabase register_user()** function:
   - Checks if email already exists
   - Hashes password
   - Creates user record
   - Generates verification token
   - Returns success + token
6. **emailService sends verification email**
7. **User shown success message**

## Flow 2: Email Verification

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Verify  │     │  Auth    │     │  auth    │     │ Supabase │
│  Page    │     │ Context  │     │ Service  │     │   RPC    │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ User clicks    │                │                │
     │ email link     │                │                │
     │ /verify-email  │                │                │
     │ ?token=xxx     │                │                │
     │                │                │                │
     │ useEffect      │                │                │
     │ extracts token │                │                │
     │ ───────────────>                │                │
     │                │ verifyEmail    │                │
     │                │ (token)        │                │
     │                │ ───────────────>                │
     │                │                │ verify_email() │
     │                │                │ ───────────────>
     │                │                │                │
     │                │                │   { success,   │
     │                │                │     message }  │
     │                │                │ <───────────────
     │                │ { success }    │                │
     │                │ <───────────────                │
     │                │                │                │
     │ Show success   │                │                │
     │ Redirect to    │                │                │
     │ /login         │                │                │
     │ <───────────────                │                │
```

### Verification Steps:

1. **User clicks link in email** → opens `/verify-email?token=xxx`
2. **VerifyEmail page extracts token** from URL
3. **Calls verifyEmail(token)**
4. **Supabase verify_email()** function:
   - Finds user by token
   - Checks token not expired
   - Sets email_verified = true
   - Invalidates token
5. **User redirected to login**

## Flow 3: User Login

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │     │  Auth    │     │  auth    │     │ Supabase │     │  local   │
│  Page    │     │ Context  │     │ Service  │     │   RPC    │     │ Storage  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ User enters    │                │                │                │
     │ credentials    │                │                │                │
     │ ───────────────>                │                │                │
     │                │ signIn(email,  │                │                │
     │                │ password)      │                │                │
     │                │ ───────────────>                │                │
     │                │                │ login_user()   │                │
     │                │                │ ───────────────>                │
     │                │                │                │                │
     │                │                │  { success,    │                │
     │                │                │    user,       │                │
     │                │                │    session_    │                │
     │                │                │    token,      │                │
     │                │                │    expires_at }│                │
     │                │                │ <───────────────                │
     │                │                │                │                │
     │                │                │ saveSession()  │                │
     │                │                │ ──────────────────────────────> │
     │                │                │                │                │
     │                │ setUser(user)  │                │   Session      │
     │                │ <───────────────                │   stored       │
     │                │                │                │                │
     │ Redirect to    │                │                │                │
     │ /dashboard     │                │                │                │
     │ <───────────────                │                │                │
```

### Login Steps:

1. **User enters email/password**
2. **AuthContext.signIn()** called
3. **authService.login()** sends RPC call
4. **Supabase login_user()** function:
   - Finds user by email
   - Verifies password hash
   - Checks email_verified
   - Checks is_active
   - Creates session record
   - Returns user data + session token
5. **Session saved to localStorage**
6. **AuthContext updates user state**
7. **User redirected to dashboard**

## Flow 4: Session Validation (On Page Load)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   App    │     │  Auth    │     │  auth    │     │ Supabase │     │  local   │
│  Loads   │     │ Context  │     │ Service  │     │   RPC    │     │ Storage  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ App renders    │                │                │                │
     │ AuthProvider   │                │                │                │
     │ ───────────────>                │                │                │
     │                │ useEffect      │                │                │
     │                │ (on mount)     │                │                │
     │                │ ───────────────>                │                │
     │                │                │ loadSession()  │                │
     │                │                │ ──────────────────────────────> │
     │                │                │                │                │
     │                │                │   { token,     │   Read from    │
     │                │                │     user,      │   storage      │
     │                │                │     expires }  │                │
     │                │                │ <──────────────────────────────│
     │                │                │                │                │
     │                │                │ Check if       │                │
     │                │                │ expired        │                │
     │                │                │                │                │
     │                │                │ validate_      │                │
     │                │                │ session()      │                │
     │                │                │ ───────────────>                │
     │                │                │                │                │
     │                │                │  { success,    │                │
     │                │                │    user }      │                │
     │                │                │ <───────────────                │
     │                │                │                │                │
     │                │ setUser(user)  │                │                │
     │                │ setLoading     │                │                │
     │                │ (false)        │                │                │
     │                │ <───────────────                │                │
     │                │                │                │                │
     │ App renders    │                │                │                │
     │ with user      │                │                │                │
     │ <───────────────                │                │                │
```

### Session Validation Steps:

1. **App loads, AuthProvider mounts**
2. **useEffect runs initAuth()**
3. **authService.loadSession()** reads localStorage
4. **Check if session expired** locally
5. **If valid locally, call validate_session() RPC**
6. **Supabase validates token** against sessions table
7. **Returns user data if valid**
8. **AuthContext updates state**
9. **loading set to false, app renders**

## Flow 5: Logout

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Header  │     │  Auth    │     │  auth    │     │ Supabase │     │  local   │
│ (button) │     │ Context  │     │ Service  │     │   RPC    │     │ Storage  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ User clicks    │                │                │                │
     │ Logout button  │                │                │                │
     │ ───────────────>                │                │                │
     │                │ signOut()      │                │                │
     │                │ ───────────────>                │                │
     │                │                │ logout_user()  │                │
     │                │                │ ───────────────>                │
     │                │                │                │                │
     │                │                │   Session      │                │
     │                │                │   invalidated  │                │
     │                │                │ <───────────────                │
     │                │                │                │                │
     │                │                │ clearSession() │                │
     │                │                │ ──────────────────────────────> │
     │                │                │                │                │
     │                │                │                │   Remove       │
     │                │                │                │   session      │
     │                │                │ <──────────────────────────────│
     │                │                │                │                │
     │                │ setUser(null)  │                │                │
     │                │ <───────────────                │                │
     │                │                │                │                │
     │ Redirect to /  │                │                │                │
     │ <───────────────                │                │                │
```

### Logout Steps:

1. **User clicks logout**
2. **AuthContext.signOut()** called
3. **authService.logout()** sends RPC call
4. **Supabase logout_user()** invalidates session
5. **localStorage cleared**
6. **AuthContext sets user to null**
7. **User redirected to home**

## Flow 6: Protected Route Access

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Protected│     │  Auth    │     │   Page   │
│ Navigate │     │  Route   │     │ Context  │     │(children)│
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ Navigate to    │                │                │
     │ /dashboard     │                │                │
     │ ───────────────>                │                │
     │                │                │                │
     │                │ useAuth()      │                │
     │                │ ───────────────>                │
     │                │                │                │
     │                │ { user,        │                │
     │                │   loading }    │                │
     │                │ <───────────────                │
     │                │                │                │
     │                │                │                │
     │    ┌───────────┴────────────────┴────────────────┴───────────┐
     │    │                                                          │
     │    │  if (loading)                                           │
     │    │    → return <Spinner />                                 │
     │    │                                                          │
     │    │  if (!user)                                             │
     │    │    → return <Navigate to="/login" />                    │
     │    │                                                          │
     │    │  if (requireAdmin && !isAdmin())                        │
     │    │    → return <Navigate to="/dashboard" />                │
     │    │                                                          │
     │    │  else                                                   │
     │    │    → return children (the protected page)               │
     │    │                                                          │
     │    └───────────┬────────────────┬────────────────┬───────────┘
     │                │                │                │
     │                │                │ Render page    │
     │                │                │ ───────────────>
     │                │                │                │
     │ Page displays  │                │                │
     │ <────────────────────────────────────────────────│
```

## Session Storage Structure

```javascript
// localStorage key: 'windband_session'
{
  "token": "abc123xyz...",           // Session token
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",                  // or "admin"
    "is_active": true,
    "email_verified": true
  },
  "expires_at": "2024-01-15T10:30:00Z"  // Session expiry
}
```

## Security Considerations

### Password Security
- Passwords hashed server-side (Supabase RPC)
- Never stored or transmitted in plain text
- bcrypt or similar hashing algorithm

### Session Security
- Session tokens are random UUIDs
- Stored in localStorage (consider httpOnly cookies for production)
- Validated on every protected route access
- Expire after set period

### Protected Routes
- Client-side protection via ProtectedRoute component
- Server-side protection via RLS policies
- Admin routes check user role

### Email Verification
- Token-based verification
- Tokens expire after set period
- Single-use tokens
