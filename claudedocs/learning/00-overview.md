# Web Development Learning Guide

## Welcome!

This learning guide will teach you **React**, **Supabase**, and **web programming** using the Windband project as a real-world example.

## Technology Stack

| Technology | Purpose | Website |
|------------|---------|---------|
| **React** | UI Framework | reactjs.org |
| **Vite** | Build Tool | vitejs.dev |
| **Tailwind CSS** | Styling | tailwindcss.com |
| **Supabase** | Backend (Database, Auth, Storage) | supabase.com |
| **React Router** | Navigation | reactrouter.com |
| **Lucide React** | Icons | lucide.dev |

## Learning Path

Follow these lessons in order for the best learning experience:

### Beginner Level

| # | Lesson | File | Topics |
|---|--------|------|--------|
| 1 | [index.html](./01-index-html.md) | `index.html` | HTML basics, document structure, entry point |
| 2 | [main.jsx](./02-main-jsx.md) | `src/main.jsx` | React entry, imports, createRoot |
| 3 | [App.jsx](./03-app-jsx.md) | `src/App.jsx` | Routing, components, providers |

### Intermediate Level

| # | Lesson | File | Topics |
|---|--------|------|--------|
| 4 | [About.jsx](./04-about-jsx.md) | `src/pages/About.jsx` | Components, JSX, .map(), Tailwind |
| 5 | [AuthContext](./05-auth-context.md) | `src/contexts/AuthContext.jsx` | Hooks, Context API, state management |

### Advanced Level

| # | Lesson | File | Topics |
|---|--------|------|--------|
| 6 | [galleryService](./06-gallery-service.md) | `src/services/galleryService.js` | Supabase, CRUD, file uploads |

## Project Structure

```
windband/
├── index.html              ← 1. Browser entry point
├── package.json            ← Dependencies & scripts
├── tailwind.config.js      ← Tailwind configuration
├── vite.config.js          ← Build tool config
├── .env.local              ← Environment variables (secrets)
│
├── public/                 ← Static assets (images, favicon)
│   ├── logo.png
│   └── manifest.json
│
└── src/
    ├── main.jsx            ← 2. React entry point
    ├── App.jsx             ← 3. Main component + routing
    ├── index.css           ← Global styles
    │
    ├── components/         ← Reusable UI components
    │   ├── Layout.jsx      ← Page layout (header + footer)
    │   ├── ErrorBoundary.jsx
    │   └── ProtectedRoute.jsx
    │
    ├── pages/              ← Page components
    │   ├── Home.jsx
    │   ├── About.jsx       ← 4. Simple page example
    │   ├── Gallery.jsx
    │   ├── Contact.jsx
    │   ├── Login.jsx
    │   └── admin/
    │       └── AdminDashboard.jsx
    │
    ├── contexts/           ← Global state
    │   └── AuthContext.jsx ← 5. Authentication state
    │
    ├── services/           ← API/Database calls
    │   ├── galleryService.js  ← 6. Supabase operations
    │   ├── performanceService.js
    │   └── emailService.js
    │
    └── lib/                ← Utilities
        ├── supabase.js     ← Supabase client
        └── auth.js         ← Auth helpers
```

## Key Concepts by Lesson

### Lesson 1: HTML Fundamentals
- Document structure (`<!doctype>`, `<html>`, `<head>`, `<body>`)
- Meta tags (charset, viewport, description)
- The `<div id="root">` where React renders
- Script loading with `type="module"`

### Lesson 2: React Bootstrap
- ES6 imports and exports
- `createRoot()` and rendering
- StrictMode for development
- JSX basics

### Lesson 3: React Router
- `BrowserRouter`, `Routes`, `Route`
- Nested routes and layouts
- Protected routes with authentication
- Path matching and navigation

### Lesson 4: React Components
- Function components
- JSX syntax and expressions `{}`
- Arrays and `.map()` for lists
- The `key` prop
- Tailwind CSS utility classes

### Lesson 5: React Hooks
- `useState` - local state management
- `useEffect` - side effects and lifecycle
- `useContext` - consuming context
- Custom hooks (`useAuth`)
- Context API for global state

### Lesson 6: Supabase Database
- CRUD operations (Create, Read, Update, Delete)
- Query building with method chaining
- File uploads to Storage
- Error handling patterns
- Service class organization

## Quick Reference

### React Hooks
```jsx
// State
const [value, setValue] = useState(initialValue);

// Effect (runs after render)
useEffect(() => {
  // Code here
}, [dependencies]);

// Context
const contextValue = useContext(MyContext);
```

### Supabase Queries
```jsx
// Select all
const { data } = await supabase.from('table').select('*');

// Insert
const { data } = await supabase.from('table').insert([{ col: 'val' }]);

// Update
const { data } = await supabase.from('table').update({ col: 'new' }).eq('id', 1);

// Delete
const { error } = await supabase.from('table').delete().eq('id', 1);
```

### Tailwind CSS Common Classes
```
Layout:     flex, grid, block, hidden
Spacing:    p-4, m-2, px-6, my-8, gap-4
Sizing:     w-full, h-screen, max-w-xl
Colors:     bg-white, text-gray-900, border-gray-200
Typography: text-lg, font-bold, uppercase
Borders:    rounded-xl, border, shadow-lg
Responsive: md:flex, lg:grid-cols-3
```

## How to Run the Project

```bash
# Navigate to project
cd windband

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

## Recommended Learning Resources

### React
- [React Official Docs](https://react.dev)
- [React Tutorial](https://react.dev/learn)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Playground](https://play.tailwindcss.com)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Guide](https://supabase.com/docs/reference/javascript)

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org)
- [JavaScript.info](https://javascript.info)

## Practice Suggestions

1. **Modify existing components** - Change text, colors, layout
2. **Add a new page** - Create a simple page with routing
3. **Build a form** - Handle user input with useState
4. **Fetch data** - Use useEffect to load data from Supabase
5. **Create a new service** - Add CRUD operations for a new table

## Getting Help

If you get stuck:
1. Check the browser console for errors (F12)
2. Read the error message carefully
3. Search the error on Google/StackOverflow
4. Review the relevant lesson documentation
5. Ask for help with specific error messages

---

**Happy Learning!**

*These documents were created from the windband project source code to help you understand modern web development.*
