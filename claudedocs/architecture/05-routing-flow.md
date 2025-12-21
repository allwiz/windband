# Routing Flow Architecture

## Overview

This document explains how navigation and routing work in the Windband application using React Router v7.

## What is Routing?

Routing determines which page/component to display based on the URL:

```
URL: /about     →  Displays: About.jsx
URL: /gallery   →  Displays: Gallery.jsx
URL: /admin     →  Displays: AdminDashboard.jsx (if authorized)
```

## Route Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROUTE HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  /                          ← Layout wrapper (Header + Footer)          │
│  ├── /                      ← Home page (index route)                   │
│  ├── /about                 ← About page                                │
│  ├── /performances          ← Performances page                         │
│  ├── /gallery               ← Gallery page                              │
│  ├── /join                  ← Join page                                 │
│  └── /contact               ← Contact page                              │
│                                                                         │
│  /login                     ← Login page (no layout)                    │
│  /signup                    ← Signup page (no layout)                   │
│  /verify-email              ← Email verification (no layout)            │
│                                                                         │
│  /dashboard                 ← User dashboard (protected)                │
│  /admin                     ← Admin dashboard (admin only)              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Route Types

### 1. Public Routes (with Layout)

Routes accessible to everyone, wrapped in the Layout component:

```jsx
<Route path="/" element={<Layout />}>
  <Route index element={<Home />} />        {/* / */}
  <Route path="about" element={<About />} /> {/* /about */}
  <Route path="performances" element={<Performances />} />
  <Route path="gallery" element={<Gallery />} />
  <Route path="join" element={<Join />} />
  <Route path="contact" element={<Contact />} />
</Route>
```

**Visual representation:**
```
┌─────────────────────────────────────────┐
│  Header (Navigation)                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  <Outlet />                       │  │
│  │  (Child route renders here)       │  │
│  │                                   │  │
│  │  - Home                           │  │
│  │  - About                          │  │
│  │  - Gallery                        │  │
│  │  - etc.                           │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│  Footer                                 │
└─────────────────────────────────────────┘
```

### 2. Auth Routes (no Layout)

Standalone pages without Header/Footer:

```jsx
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/verify-email" element={<VerifyEmail />} />
```

**Visual representation:**
```
┌─────────────────────────────────────────┐
│                                         │
│        Full-page login form             │
│        (no header/footer)               │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Protected Routes

Routes that require authentication:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 4. Admin Routes

Routes that require admin role:

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## ProtectedRoute Component

This component guards protected routes:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROTECTED ROUTE FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  User visits /dashboard                                                 │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────┐                                    │
│  │  Is loading?                    │                                    │
│  │  (checking auth status)         │                                    │
│  └───────────────┬─────────────────┘                                    │
│                  │                                                      │
│       ┌──────────┴──────────┐                                           │
│       │                     │                                           │
│      YES                   NO                                           │
│       │                     │                                           │
│       ▼                     ▼                                           │
│  ┌─────────────┐    ┌─────────────────────────┐                         │
│  │ Show        │    │ Is user logged in?      │                         │
│  │ Spinner     │    └───────────┬─────────────┘                         │
│  └─────────────┘                │                                       │
│                      ┌──────────┴──────────┐                            │
│                      │                     │                            │
│                     YES                   NO                            │
│                      │                     │                            │
│                      ▼                     ▼                            │
│  ┌─────────────────────────┐    ┌─────────────────────────┐             │
│  │ Is admin required?      │    │ Redirect to /login      │             │
│  └───────────┬─────────────┘    │ (save original URL)     │             │
│              │                  └─────────────────────────┘             │
│   ┌──────────┴──────────┐                                               │
│   │                     │                                               │
│  YES                   NO                                               │
│   │                     │                                               │
│   ▼                     ▼                                               │
│  ┌───────────────┐  ┌───────────────┐                                   │
│  │ Is user       │  │ Render        │                                   │
│  │ admin?        │  │ children      │                                   │
│  └───────┬───────┘  │ (Dashboard)   │                                   │
│          │          └───────────────┘                                   │
│  ┌───────┴───────┐                                                      │
│  │               │                                                      │
│ YES             NO                                                      │
│  │               │                                                      │
│  ▼               ▼                                                      │
│ Render      Redirect to                                                 │
│ children    /dashboard                                                  │
│ (Admin)                                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## ProtectedRoute Code

```jsx
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin route and user is not admin, redirect to dashboard
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required permissions
  return children;
};
```

## Navigation Methods

### 1. Link Component (Declarative)

For regular navigation links:

```jsx
import { Link } from 'react-router-dom';

<Link to="/about">About Us</Link>
<Link to="/gallery">Gallery</Link>
```

### 2. NavLink Component (With Active State)

For navigation menus that show active state:

```jsx
import { NavLink } from 'react-router-dom';

<NavLink
  to="/about"
  className={({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-600'}
>
  About
</NavLink>
```

### 3. useNavigate Hook (Programmatic)

For navigation in code (after form submission, etc.):

```jsx
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    // ... login logic
    if (success) {
      navigate('/dashboard');  // Redirect after login
    }
  };
};
```

### 4. Navigate Component (Redirect)

For conditional redirects in JSX:

```jsx
import { Navigate } from 'react-router-dom';

if (!user) {
  return <Navigate to="/login" replace />;
}
```

## Layout and Outlet

The Layout component uses Outlet to render child routes:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Layout.jsx                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  const Layout = () => {                                                 │
│    return (                                                             │
│      <div>                                                              │
│        <Header />              ← Always visible                         │
│        <main>                                                           │
│          <Outlet />            ← Child route renders here               │
│        </main>                                                          │
│        <Footer />              ← Always visible                         │
│      </div>                                                             │
│    );                                                                   │
│  };                                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**How Outlet Works:**

```
URL: /about

<Route path="/" element={<Layout />}>      ← Layout renders
  <Route path="about" element={<About />} /> ← About renders in <Outlet />
</Route>

Result:
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│ About.jsx content   │  ← Rendered via <Outlet />
├─────────────────────┤
│ Footer              │
└─────────────────────┘
```

## Navigation Flow Examples

### Example 1: User Visits Homepage

```
User types: http://localhost:5173/

┌───────────────────────────────────────────────────────────────────┐
│  1. Browser sends URL to React Router                             │
│  2. Router matches "/" path                                       │
│  3. Layout component renders                                      │
│  4. Index route (<Home />) renders in <Outlet />                  │
│  5. User sees: Header + Home content + Footer                     │
└───────────────────────────────────────────────────────────────────┘
```

### Example 2: User Clicks Navigation Link

```
User clicks "Gallery" link

┌───────────────────────────────────────────────────────────────────┐
│  1. <Link to="/gallery"> triggers navigation                      │
│  2. URL changes to /gallery (no page reload!)                     │
│  3. Router matches "/gallery" path                                │
│  4. Layout stays mounted (Header/Footer don't re-render)          │
│  5. <Outlet /> updates to render <Gallery />                      │
│  6. User sees: Same Header + Gallery content + Same Footer        │
└───────────────────────────────────────────────────────────────────┘
```

### Example 3: Unauthenticated User Visits /dashboard

```
User types: http://localhost:5173/dashboard

┌───────────────────────────────────────────────────────────────────┐
│  1. Router matches "/dashboard" path                              │
│  2. <ProtectedRoute> component checks auth                        │
│  3. loading = true → Show spinner                                 │
│  4. Auth check completes, user = null                             │
│  5. <Navigate to="/login" state={{ from: location }} />           │
│  6. URL changes to /login                                         │
│  7. Login page renders                                            │
│  8. After login, user redirected back to /dashboard               │
└───────────────────────────────────────────────────────────────────┘
```

### Example 4: Non-Admin Visits /admin

```
Regular user types: http://localhost:5173/admin

┌───────────────────────────────────────────────────────────────────┐
│  1. Router matches "/admin" path                                  │
│  2. <ProtectedRoute requireAdmin={true}> checks auth              │
│  3. User is logged in ✓                                           │
│  4. isAdmin() returns false ✗                                     │
│  5. <Navigate to="/dashboard" replace />                          │
│  6. User redirected to /dashboard instead                         │
└───────────────────────────────────────────────────────────────────┘
```

## Route Configuration Summary

```jsx
// App.jsx - Complete Route Configuration

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes with Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="performances" element={<Performances />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="join" element={<Join />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* Auth routes (standalone, no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes (require login) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin routes (require admin role) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

## Key Concepts

### 1. Single Page Application (SPA)

React Router enables SPA behavior:
- Page content changes without full page reload
- Only the content inside `<Outlet />` updates
- Header/Footer remain mounted
- Faster, smoother navigation

### 2. Client-Side Routing

All routing happens in the browser:
```
Traditional: Click link → Server request → Full page load
SPA:         Click link → JavaScript updates → Content swap
```

### 3. Route Matching

Routes are matched from top to bottom:
```jsx
<Route path="/" element={<Layout />}>
  <Route index element={<Home />} />        {/* Matches exactly "/" */}
  <Route path="about" element={<About />} /> {/* Matches "/about" */}
</Route>
```

### 4. Nested Routes

Child routes render inside parent's `<Outlet />`:
```jsx
<Route path="/" element={<Layout />}>
  {/* These routes render inside Layout's <Outlet /> */}
  <Route path="about" element={<About />} />
</Route>
```

### 5. Route Guards

ProtectedRoute acts as a guard:
```jsx
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />  {/* Only renders if user is admin */}
</ProtectedRoute>
```

## URL Parameters (Advanced)

Though not used extensively in Windband, React Router supports URL parameters:

```jsx
// Route definition
<Route path="/gallery/:id" element={<GalleryItem />} />

// Component usage
const { id } = useParams();  // Gets the :id from URL
```

---
*File: `claudedocs/architecture/05-routing-flow.md`*
