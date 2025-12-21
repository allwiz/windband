# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         React Application                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  UI Layer (Pages & Components)                                  │  │  │
│  │  │  Home | About | Gallery | Performances | Join | Contact | Admin │  │  │
│  │  └───────────────────────────┬─────────────────────────────────────┘  │  │
│  │                              │                                         │  │
│  │  ┌───────────────────────────▼─────────────────────────────────────┐  │  │
│  │  │  State Management Layer                                         │  │  │
│  │  │  AuthContext | useState | useEffect                             │  │  │
│  │  └───────────────────────────┬─────────────────────────────────────┘  │  │
│  │                              │                                         │  │
│  │  ┌───────────────────────────▼─────────────────────────────────────┐  │  │
│  │  │  Service Layer (API Calls)                                      │  │  │
│  │  │  authService | galleryService | performanceService | emailService│  │  │
│  │  └───────────────────────────┬─────────────────────────────────────┘  │  │
│  │                              │                                         │  │
│  │  ┌───────────────────────────▼─────────────────────────────────────┐  │  │
│  │  │  Supabase Client (lib/supabase.js)                             │  │  │
│  │  └───────────────────────────┬─────────────────────────────────────┘  │  │
│  └──────────────────────────────┼────────────────────────────────────────┘  │
└─────────────────────────────────┼────────────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE CLOUD                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   PostgreSQL    │  │    Storage      │  │      Edge Functions         │  │
│  │   Database      │  │   (Images)      │  │   (Serverless Backend)      │  │
│  │                 │  │                 │  │                             │  │
│  │  - users        │  │  - gallery/     │  │  - register_user()          │  │
│  │  - sessions     │  │  - performances/│  │  - login_user()             │  │
│  │  - gallery      │  │                 │  │  - validate_session()       │  │
│  │  - performances │  │                 │  │  - verify_email()           │  │
│  │  - openings     │  │                 │  │                             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 19.x |
| Vite | Build Tool & Dev Server | 7.x |
| React Router | Client-side Routing | 7.x |
| Tailwind CSS | Utility-first CSS | 3.x |
| Lucide React | Icon Library | - |
| TipTap | Rich Text Editor | 3.x |

### Backend (Supabase)
| Service | Purpose |
|---------|---------|
| PostgreSQL | Relational Database |
| Auth (Custom) | User Authentication via RPC functions |
| Storage | File/Image Storage |
| RPC Functions | Server-side Business Logic |

### External Services
| Service | Purpose |
|---------|---------|
| EmailJS | Email Sending (verification, contact) |
| Vercel | Hosting & Deployment |

## Application Layers

### 1. Presentation Layer (UI)
```
src/pages/          → Page components (routes)
src/components/     → Reusable UI components
```
- Renders user interface
- Handles user interactions
- Displays data from state

### 2. State Management Layer
```
src/contexts/       → React Context (global state)
useState/useEffect  → Local component state
```
- Manages application state
- Provides state to components
- Handles state updates

### 3. Service Layer
```
src/services/       → Business logic & API calls
src/lib/            → Utilities & configurations
```
- Encapsulates API calls
- Business logic
- Data transformation

### 4. Data Layer (Supabase)
```
Supabase Database   → Data persistence
Supabase Storage    → File storage
Supabase RPC        → Server-side functions
```
- Data storage
- Authentication
- File management

## Request Flow Example

### User Views Gallery Page
```
1. User navigates to /gallery
        │
        ▼
2. React Router renders <Gallery /> component
        │
        ▼
3. useEffect() triggers on mount
        │
        ▼
4. galleryService.getGalleryItems() called
        │
        ▼
5. Supabase client sends HTTP request
        │
        ▼
6. Supabase returns data from PostgreSQL
        │
        ▼
7. Service returns { success: true, data: [...] }
        │
        ▼
8. Component calls setItems(data)
        │
        ▼
9. React re-renders with gallery items
```

## Key Design Patterns

### 1. Service Pattern
- All database operations go through service classes
- Services return consistent response objects
- Components don't directly call Supabase

### 2. Context Provider Pattern
- AuthContext wraps entire app
- Provides authentication state globally
- Any component can access via useAuth()

### 3. Protected Route Pattern
- ProtectedRoute component guards routes
- Checks authentication before rendering
- Redirects unauthorized users

### 4. Layout Pattern
- Layout component provides consistent structure
- Header + Content + Footer
- Child routes render via Outlet

## Environment Configuration

```
.env.local
├── VITE_SUPABASE_URL        → Supabase project URL
├── VITE_SUPABASE_ANON_KEY   → Supabase public API key
├── VITE_EMAILJS_SERVICE_ID  → EmailJS service ID
├── VITE_EMAILJS_TEMPLATE_ID → EmailJS template ID
└── VITE_EMAILJS_PUBLIC_KEY  → EmailJS public key
```

## Build & Deployment

```
Development:
npm run dev  →  Vite Dev Server  →  http://localhost:5173

Production:
npm run build  →  dist/  →  Vercel  →  https://your-domain.com
```

## File Structure Summary

```
windband/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── tailwind.config.js      # CSS config
├── .env.local              # Environment variables
│
├── public/                 # Static assets
│   ├── logo.png
│   └── manifest.json
│
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Root component + routes
    ├── index.css           # Global styles
    │
    ├── components/         # Shared components
    │   ├── Layout.jsx
    │   ├── Header.jsx
    │   ├── Footer.jsx
    │   ├── ProtectedRoute.jsx
    │   └── ErrorBoundary.jsx
    │
    ├── pages/              # Route components
    │   ├── Home.jsx
    │   ├── About.jsx
    │   ├── Gallery.jsx
    │   ├── Performances.jsx
    │   ├── Join.jsx
    │   ├── Contact.jsx
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── Dashboard.jsx
    │   └── admin/
    │       └── AdminDashboard.jsx
    │
    ├── contexts/           # State management
    │   └── AuthContext.jsx
    │
    ├── services/           # API layer
    │   ├── galleryService.js
    │   ├── performanceService.js
    │   ├── openingsService.js
    │   └── emailService.js
    │
    └── lib/                # Utilities
        ├── supabase.js
        └── auth.js
```
