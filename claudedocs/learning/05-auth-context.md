# Lesson 5: Understanding AuthContext.jsx (Hooks & Context)

## Overview

The `AuthContext.jsx` file demonstrates advanced React concepts:
- **Hooks**: `useState`, `useEffect`, `useContext`
- **Context API**: Sharing state across the entire app
- **Custom Hooks**: Creating reusable logic
- **Async Operations**: Handling login/logout

This is a critical file because authentication state needs to be available everywhere in the app.

## File Location
```
windband/src/contexts/AuthContext.jsx
```

## The Complete Code Structure

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/auth';

// 1. Create context
const AuthContext = createContext({});

// 2. Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// 3. Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      // ...validate session
    };
    initAuth();
  }, []);

  // Auth functions
  const signIn = async (email, password) => { /* ... */ };
  const signOut = async () => { /* ... */ };
  // ...more functions

  // Provide values
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    // ...
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Section-by-Section Explanation

### Section 1: Imports

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/auth';
```

| Import | Purpose |
|--------|---------|
| `createContext` | Creates a Context object |
| `useContext` | Hook to consume context |
| `useState` | Hook for state management |
| `useEffect` | Hook for side effects |
| `authService` | Backend authentication functions |

### Section 2: Creating Context

```jsx
const AuthContext = createContext({});
```

**What is Context?**
- A way to pass data through the component tree
- Without passing props manually at every level
- Like a "global variable" for React components

**Visual comparison:**

```
WITHOUT Context (Prop Drilling):         WITH Context:
┌─────────────────┐                      ┌─────────────────┐
│ App             │                      │ App             │
│ user={user}     │                      │ <AuthProvider>  │
│     │           │                      │     │           │
│     ▼           │                      │     ▼           │
│ ┌───────────┐   │                      │ ┌───────────┐   │
│ │ Layout    │   │                      │ │ Layout    │   │
│ │ user={user}│  │                      │ │           │   │  ← No props needed!
│ │    │      │   │                      │ │    │      │   │
│ │    ▼      │   │                      │ │    ▼      │   │
│ │ ┌──────┐  │   │                      │ │ ┌──────┐  │   │
│ │ │Header│  │   │                      │ │ │Header│  │   │
│ │ │user= │  │   │                      │ │ │useAuth()│ │  ← Gets user directly!
│ │ └──────┘  │   │                      │ │ └──────┘  │   │
│ └───────────┘   │                      │ └───────────┘   │
└─────────────────┘                      └─────────────────┘
```

### Section 3: Custom Hook (useAuth)

```jsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**What is a Custom Hook?**
- A function that uses other hooks
- Name starts with `use` (convention)
- Encapsulates reusable logic

**How it's used in other components:**
```jsx
// In any component
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </div>
  );
};
```

**The error check:**
```jsx
if (!context) {
  throw new Error('useAuth must be used within AuthProvider');
}
```
- Prevents using `useAuth()` outside of `AuthProvider`
- Helpful error message for developers

### Section 4: useState Hook

```jsx
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**useState Syntax:**
```jsx
const [currentValue, setterFunction] = useState(initialValue);
```

| Part | Description |
|------|-------------|
| `currentValue` | The current state value |
| `setterFunction` | Function to update the state |
| `initialValue` | Starting value |

**Examples:**
```jsx
const [count, setCount] = useState(0);        // Number
const [name, setName] = useState('');         // String
const [items, setItems] = useState([]);       // Array
const [user, setUser] = useState(null);       // Object or null
const [isOpen, setIsOpen] = useState(false);  // Boolean
```

**Updating state:**
```jsx
// Direct value
setCount(5);

// Based on previous value
setCount(prevCount => prevCount + 1);

// Object update (spread existing + new)
setUser({ ...user, name: 'New Name' });

// Array update
setItems([...items, newItem]);
```

**Important:** State updates are ASYNCHRONOUS!
```jsx
setCount(1);
console.log(count);  // Still shows OLD value!
// The new value is available on next render
```

### Section 5: useEffect Hook

```jsx
useEffect(() => {
  const initAuth = async () => {
    try {
      const result = await authService.validateSession();
      if (result.success) {
        setUser(result.user);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);
```

**What is useEffect?**
- Runs code after render (side effects)
- Used for: API calls, subscriptions, timers, DOM manipulation

**Syntax:**
```jsx
useEffect(() => {
  // Code to run
}, [dependencies]);
```

**The dependency array `[]`:**
```jsx
// Empty array: Run ONCE when component mounts
useEffect(() => {
  console.log('Mounted!');
}, []);

// With dependencies: Run when any dependency changes
useEffect(() => {
  console.log('userId changed!');
}, [userId]);

// No array: Run after EVERY render (usually wrong!)
useEffect(() => {
  console.log('Every render');
});
```

**Visual timeline:**
```
Component Lifecycle with useEffect
──────────────────────────────────────────────────────────
Time →

1. Component mounts (first render)
   │
   ├── React renders JSX
   │
   └── useEffect runs (if [] empty or dependencies match)
       │
       └── async initAuth() is called
           │
           ├── API call to validate session
           │
           └── setUser(result.user) triggers re-render

2. Re-render (state changed)
   │
   ├── React renders JSX with new state
   │
   └── useEffect checks dependencies
       │
       └── If dependencies unchanged → skip
           If dependencies changed → run effect
```

### Section 6: Async Functions

```jsx
const signIn = async (email, password) => {
  try {
    setError(null);
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  } catch (err) {
    setError(err.message);
    throw err;
  }
};
```

**Async/Await Pattern:**
```jsx
// async - marks function as asynchronous
const signIn = async (email, password) => {

  // await - waits for promise to resolve
  const result = await authService.login(email, password);

  // Code after await runs when promise completes
  setUser(result.user);
};
```

**Error Handling with try/catch:**
```jsx
try {
  // Code that might fail
  const result = await riskyOperation();
} catch (err) {
  // Handle the error
  console.error(err.message);
} finally {
  // Always runs (success or error)
  setLoading(false);
}
```

### Section 7: Helper Functions

```jsx
const isAdmin = () => user?.role === 'admin';
const isAuthenticated = () => !!user;
```

**Optional Chaining (`?.`):**
```jsx
user?.role === 'admin'
// If user is null/undefined, returns undefined
// If user exists, returns user.role === 'admin'

// Without optional chaining:
user && user.role === 'admin'
```

**Double Bang (`!!`):**
```jsx
!!user
// Converts to boolean
// null → false
// undefined → false
// {} → true
// "string" → true
```

### Section 8: Provider Component

```jsx
export const AuthProvider = ({ children }) => {
  // ... state and functions

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAdmin,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**The `children` prop:**
```jsx
// In App.jsx
<AuthProvider>
  <Router>        ←─┐
    <Routes />       │ These are "children"
  </Router>       ←─┘
</AuthProvider>

// AuthProvider receives them as:
const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={value}>
      {children}  ← Renders Router and Routes here
    </AuthContext.Provider>
  );
};
```

**The `value` prop:**
```jsx
<AuthContext.Provider value={value}>
```
- Everything in `value` is accessible via `useAuth()`
- Any component can call `const { user, signIn } = useAuth()`

## Complete Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ AuthProvider (wraps entire app)                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ State:                                                 │  │
│  │   user: { id: 1, name: 'John', role: 'admin' }        │  │
│  │   loading: false                                       │  │
│  │   error: null                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ AuthContext.Provider value={...}                       │  │
│  │   Provides: user, loading, signIn, signOut, isAdmin   │  │
│  └────────────────────────────────────────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ Header  │      │Dashboard│      │ Admin   │
    │useAuth()│      │useAuth()│      │useAuth()│
    │         │      │         │      │         │
    │ Shows   │      │ Shows   │      │ Checks  │
    │ user    │      │ user    │      │ isAdmin │
    │ name    │      │ data    │      │         │
    └─────────┘      └─────────┘      └─────────┘
```

## Common Patterns

### Pattern 1: Loading State
```jsx
const { user, loading } = useAuth();

if (loading) {
  return <div>Loading...</div>;
}

return user ? <Dashboard /> : <Login />;
```

### Pattern 2: Protected Component
```jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};
```

### Pattern 3: Conditional Rendering
```jsx
const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <nav>
      {user ? (
        <>
          <span>Welcome, {user.name}</span>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
};
```

## Hooks Rules (Important!)

1. **Only call hooks at the top level**
   ```jsx
   // BAD - inside condition
   if (condition) {
     const [state, setState] = useState();
   }

   // GOOD - always at top
   const [state, setState] = useState();
   if (condition) {
     // use state here
   }
   ```

2. **Only call hooks from React functions**
   ```jsx
   // BAD - regular function
   function calculateTotal() {
     const [total, setTotal] = useState(0);  // Error!
   }

   // GOOD - React component or custom hook
   function Calculator() {
     const [total, setTotal] = useState(0);  // OK
   }
   ```

## Practice Exercises

### Exercise 1: Create a simple counter with useState
```jsx
const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add</button>
    </div>
  );
};
```

### Exercise 2: Fetch data with useEffect
```jsx
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
};
```

## Next Lesson

In the next lesson, we'll look at `galleryService.js` - learning how to interact with Supabase database for CRUD operations (Create, Read, Update, Delete).

---
*File: `claudedocs/learning/05-auth-context.md`*
