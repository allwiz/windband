# Component Hierarchy

## Complete Component Tree

```
<React.StrictMode>
│
└── <App>
    │
    └── <ErrorBoundary>
        │
        └── <AuthProvider>  ──────────────────────────── Provides: user, signIn, signOut, etc.
            │
            └── <BrowserRouter>
                │
                └── <Routes>
                    │
                    ├── <Route path="/" element={<Layout />}>
                    │   │
                    │   │   ┌─────────────────────────────────────┐
                    │   │   │ <Layout>                            │
                    │   │   │   <Header />   ← Navigation         │
                    │   │   │   <main>                            │
                    │   │   │     <Outlet /> ← Child renders here │
                    │   │   │   </main>                           │
                    │   │   │   <Footer />                        │
                    │   │   └─────────────────────────────────────┘
                    │   │
                    │   ├── <Route index element={<Home />} />
                    │   ├── <Route path="about" element={<About />} />
                    │   ├── <Route path="performances" element={<Performances />} />
                    │   ├── <Route path="gallery" element={<Gallery />} />
                    │   ├── <Route path="join" element={<Join />} />
                    │   └── <Route path="contact" element={<Contact />} />
                    │
                    ├── <Route path="/login" element={<Login />} />
                    ├── <Route path="/signup" element={<Signup />} />
                    ├── <Route path="/verify-email" element={<VerifyEmail />} />
                    │
                    ├── <Route path="/dashboard">
                    │   └── <ProtectedRoute>
                    │       └── <Dashboard />
                    │
                    └── <Route path="/admin">
                        └── <ProtectedRoute requireAdmin={true}>
                            └── <AdminDashboard>
                                ├── <AdminSidebar />
                                ├── <UsersTable />
                                ├── <GalleryForm />
                                ├── <GalleryList />
                                ├── <PerformanceForm />
                                ├── <PerformanceList />
                                ├── <OpeningsForm />
                                └── <OpeningsList />
```

## Component Categories

### 1. App Shell Components
Components that form the application structure.

```
┌─────────────────────────────────────────────────────────────┐
│  App.jsx                                                    │
│  - Root component                                           │
│  - Sets up providers (Auth, Router)                         │
│  - Defines all routes                                       │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  ErrorBoundary.jsx                                          │
│  - Catches JavaScript errors                                │
│  - Displays fallback UI on error                            │
│  - Prevents entire app crash                                │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthProvider (from AuthContext.jsx)                        │
│  - Provides authentication state                            │
│  - user, loading, signIn, signOut, etc.                     │
│  - Available via useAuth() hook                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Layout Components
Components that provide page structure.

```
┌─────────────────────────────────────────────────────────────┐
│  Layout.jsx                                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  <Header />                                           │  │
│  │  - Logo                                               │  │
│  │  - Navigation links                                   │  │
│  │  - Auth buttons (Login/Logout)                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  <main>                                               │  │
│  │    <Outlet />  ← Page content renders here            │  │
│  │  </main>                                              │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  <Footer />                                           │  │
│  │  - Copyright                                          │  │
│  │  - Social links                                       │  │
│  │  - Quick links                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Page Components
Full-page components mapped to routes.

```
Public Pages (with Layout)
├── Home.jsx         → /              Main landing page
├── About.jsx        → /about         Organization info
├── Performances.jsx → /performances  Events & concerts
├── Gallery.jsx      → /gallery       Photo gallery
├── Join.jsx         → /join          Membership info
└── Contact.jsx      → /contact       Contact form

Auth Pages (no Layout)
├── Login.jsx        → /login         User login
├── Signup.jsx       → /signup        User registration
└── VerifyEmail.jsx  → /verify-email  Email verification

Protected Pages
├── Dashboard.jsx      → /dashboard   User dashboard
└── AdminDashboard.jsx → /admin       Admin panel
```

### 4. Guard Components
Components that control access.

```
┌─────────────────────────────────────────────────────────────┐
│  ProtectedRoute.jsx                                         │
│                                                             │
│  Props:                                                     │
│  - children: Component to render if authorized              │
│  - requireAdmin: boolean (default: false)                   │
│                                                             │
│  Flow:                                                      │
│  1. Check loading state → Show spinner                      │
│  2. Check user exists → Redirect to /login if not           │
│  3. Check admin (if required) → Redirect to /dashboard      │
│  4. Render children if all checks pass                      │
└─────────────────────────────────────────────────────────────┘
```

### 5. Admin Components
Components for the admin dashboard.

```
AdminDashboard.jsx
│
├── AdminSidebar.jsx
│   - Navigation menu for admin sections
│   - Highlights active section
│
├── Dashboard Section
│   └── UsersTable.jsx
│       - Lists all users
│       - Toggle user status
│       - Change user roles
│
├── Gallery Section
│   ├── GalleryForm.jsx
│   │   - Add/Edit gallery items
│   │   - Image upload
│   │   - Category selection
│   │
│   └── GalleryList.jsx
│       - Display all gallery items
│       - Edit/Delete actions
│       - Status indicators
│
├── Performance Section
│   ├── PerformanceForm.jsx
│   │   - Add/Edit performances
│   │   - Date/time selection
│   │   - Venue information
│   │
│   └── PerformanceList.jsx
│       - Display all performances
│       - Toggle featured status
│       - Delete actions
│
└── Openings Section
    ├── OpeningsForm.jsx
    │   - Add/Edit instrument openings
    │   - Priority settings
    │
    └── OpeningsList.jsx
        - Display all openings
        - Toggle active status
        - Edit/Delete actions
```

## Component Communication

### Parent to Child (Props)
```jsx
// Parent
<GalleryList onEdit={handleEdit} onDelete={handleDelete} />

// Child
const GalleryList = ({ onEdit, onDelete }) => {
  return (
    <button onClick={() => onEdit(item)}>Edit</button>
    <button onClick={() => onDelete(item.id)}>Delete</button>
  );
};
```

### Child to Parent (Callback Props)
```jsx
// Parent
const [selectedItem, setSelectedItem] = useState(null);
<GalleryList onSelect={(item) => setSelectedItem(item)} />

// Child
<div onClick={() => onSelect(item)}>
  {item.title}
</div>
```

### Global State (Context)
```jsx
// Any component
const { user, signOut } = useAuth();

if (user) {
  return <span>Welcome, {user.name}</span>;
}
```

### Sibling Communication (Lift State Up)
```jsx
// Parent manages shared state
const AdminDashboard = () => {
  const [editItem, setEditItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <GalleryForm
        editItem={editItem}
        onSave={() => {
          setEditItem(null);
          setRefreshKey(k => k + 1);
        }}
      />
      <GalleryList
        key={refreshKey}
        onEdit={setEditItem}
      />
    </>
  );
};
```

## Component Props Reference

### ProtectedRoute
```typescript
{
  children: ReactNode,      // Component to protect
  requireAdmin?: boolean    // Require admin role (default: false)
}
```

### GalleryForm
```typescript
{
  editItem?: GalleryItem,   // Item to edit (null for new)
  onSave?: () => void,      // Called after successful save
  onCancel?: () => void     // Called when cancel clicked
}
```

### GalleryList
```typescript
{
  onAddNew?: () => void,    // Called when Add New clicked
  onEdit?: (item) => void   // Called with item to edit
}
```

### UsersTable
```typescript
{
  users: User[],                          // List of users
  loading: boolean,                        // Loading state
  toggleUserStatus: (id, status) => void, // Toggle active status
  changeUserRole: (id, role) => void      // Change user role
}
```

## Component State Patterns

### Local State (useState)
```jsx
// For component-specific data
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### Global State (Context)
```jsx
// For app-wide data (authentication)
const { user, signIn, signOut } = useAuth();
```

### Derived State
```jsx
// Computed from other state
const activeItems = items.filter(item => item.is_active);
const itemCount = items.length;
const isAdmin = user?.role === 'admin';
```

## Re-render Triggers

```
Component Re-renders When:
│
├── State changes (useState setter called)
│   setItems([...])
│
├── Props change
│   <Child value={newValue} />
│
├── Parent re-renders (if not memoized)
│   Parent state change → Child re-renders
│
└── Context value changes
    AuthContext updates → All consumers re-render
```
