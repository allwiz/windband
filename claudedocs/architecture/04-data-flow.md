# Data Flow Architecture

## Overview

This document explains how data moves through the Windband application, from user interactions to the database and back.

## Data Flow Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                                  │
│                    (Clicks, Types, Submits)                             │
└─────────────────────────────────────────────┬───────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     REACT COMPONENTS (UI Layer)                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  - Event Handlers (onClick, onChange, onSubmit)                   │  │
│  │  - Local State (useState)                                         │  │
│  │  - Side Effects (useEffect)                                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────┬───────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER (Business Logic)                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  - galleryService     - Handles gallery CRUD + file uploads       │  │
│  │  - performanceService - Handles performances CRUD + file uploads  │  │
│  │  - openingsService    - Handles openings CRUD                     │  │
│  │  - emailService       - Handles email sending                     │  │
│  │  - authService        - Handles authentication                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────┬───────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE CLIENT (API Layer)                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  - Database queries  (.from().select().insert().update().delete())│  │
│  │  - Storage operations (.storage.from().upload().getPublicUrl())   │  │
│  │  - RPC calls         (.rpc('function_name', params))              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────┬───────────────────────────┘
                                              │ HTTPS
                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE CLOUD (Backend)                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   PostgreSQL    │  │    Storage      │  │    Edge Functions       │  │
│  │   Database      │  │    Buckets      │  │    (RPC)                │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Complete Data Fetch Flow

### Example: Loading Gallery Items

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. COMPONENT MOUNTS                                                      │
│  ───────────────────                                                      │
│  Gallery.jsx                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  useEffect(() => {                                                 │  │
│  │    fetchGalleryItems();  // Called when component mounts           │  │
│  │  }, []);                 // Empty array = run once                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. FETCH FUNCTION                                                        │
│  ─────────────────                                                        │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  const fetchGalleryItems = async () => {                           │  │
│  │    setLoading(true);                          // Show spinner      │  │
│  │    const result = await galleryService.getGalleryItems({           │  │
│  │      isActive: true                           // Only active items │  │
│  │    });                                                             │  │
│  │    if (result.success) {                                           │  │
│  │      setGalleryItems(result.data);            // Update state      │  │
│  │    }                                                               │  │
│  │    setLoading(false);                         // Hide spinner      │  │
│  │  };                                                                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. SERVICE METHOD                                                        │
│  ────────────────                                                         │
│  galleryService.js                                                        │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  async getGalleryItems(filters = {}) {                             │  │
│  │    try {                                                           │  │
│  │      let query = supabase                                          │  │
│  │        .from('gallery')                       // Table name        │  │
│  │        .select('*')                           // All columns       │  │
│  │        .order('created_at', { ascending: false });                 │  │
│  │                                                                    │  │
│  │      if (filters.isActive !== undefined) {                         │  │
│  │        query = query.eq('is_active', filters.isActive);            │  │
│  │      }                                                             │  │
│  │                                                                    │  │
│  │      const { data, error } = await query;     // Execute query     │  │
│  │                                                                    │  │
│  │      if (error) throw error;                                       │  │
│  │                                                                    │  │
│  │      return { success: true, data };          // Return data       │  │
│  │    } catch (error) {                                               │  │
│  │      return { success: false, error: error.message, data: [] };    │  │
│  │    }                                                               │  │
│  │  }                                                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. SUPABASE QUERY (HTTP Request)                                         │
│  ───────────────────────────────                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  GET https://xxxxx.supabase.co/rest/v1/gallery                     │  │
│  │  ?select=*                                                         │  │
│  │  &is_active=eq.true                                                │  │
│  │  &order=created_at.desc                                            │  │
│  │                                                                    │  │
│  │  Headers:                                                          │  │
│  │    apikey: VITE_SUPABASE_ANON_KEY                                  │  │
│  │    Authorization: Bearer VITE_SUPABASE_ANON_KEY                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5. DATABASE RESPONSE                                                     │
│  ───────────────────                                                      │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  [                                                                 │  │
│  │    {                                                               │  │
│  │      "id": "uuid-1",                                               │  │
│  │      "title": "Concert Photo",                                     │  │
│  │      "image_url": "https://...",                                   │  │
│  │      "category": "concerts",                                       │  │
│  │      "created_at": "2024-01-15T..."                                │  │
│  │    },                                                              │  │
│  │    { ... more items ... }                                          │  │
│  │  ]                                                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  6. UI UPDATE                                                             │
│  ──────────                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  setGalleryItems(result.data);                                     │  │
│  │                                                                    │  │
│  │  React re-renders the component with new data:                     │  │
│  │                                                                    │  │
│  │  {galleryItems.map(item => (                                       │  │
│  │    <div key={item.id}>                                             │  │
│  │      <img src={item.image_url} alt={item.title} />                 │  │
│  │      <h3>{item.title}</h3>                                         │  │
│  │    </div>                                                          │  │
│  │  ))}                                                               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Complete Data Create Flow

### Example: Adding a New Gallery Item

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. USER ACTION                                                           │
│  ─────────────                                                            │
│  Admin fills form and clicks "Save"                                       │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Form Data:                                                        │  │
│  │    - title: "Spring Concert 2024"                                  │  │
│  │    - description: "Our annual spring concert"                      │  │
│  │    - category: "concerts"                                          │  │
│  │    - file: [Selected Image File]                                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. FORM SUBMISSION HANDLER                                               │
│  ─────────────────────────                                                │
│  GalleryForm.jsx                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  const handleSubmit = async (e) => {                               │  │
│  │    e.preventDefault();                                             │  │
│  │    setSubmitting(true);                                            │  │
│  │                                                                    │  │
│  │    // Step 1: Upload image first                                   │  │
│  │    if (selectedFile) {                                             │  │
│  │      const uploadResult = await galleryService.uploadImage(        │  │
│  │        selectedFile,                                               │  │
│  │        formData.category                                           │  │
│  │      );                                                            │  │
│  │      if (!uploadResult.success) { /* handle error */ }             │  │
│  │      imageData = uploadResult;                                     │  │
│  │    }                                                               │  │
│  │                                                                    │  │
│  │    // Step 2: Create database record                               │  │
│  │    const result = await galleryService.createGalleryItem({         │  │
│  │      ...formData,                                                  │  │
│  │      imageUrl: imageData.url,                                      │  │
│  │      storagePath: imageData.storagePath                            │  │
│  │    });                                                             │  │
│  │                                                                    │  │
│  │    if (result.success) onSave();                                   │  │
│  │  };                                                                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                          ┌────────────────────┴────────────────────┐
                          │                                         │
                          ▼                                         ▼
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│  3A. FILE UPLOAD                    │    │  3B. DATABASE INSERT                │
│  ───────────────                    │    │  ───────────────────                │
│  galleryService.uploadImage()       │    │  galleryService.createGalleryItem() │
│  ┌───────────────────────────────┐  │    │  ┌───────────────────────────────┐  │
│  │  // Generate unique filename  │  │    │  │  const insertData = {         │  │
│  │  const fileName =             │  │    │  │    title: 'Spring Concert',   │  │
│  │    `concerts/1702400000_abc.  │  │    │  │    description: '...',        │  │
│  │     jpg`;                     │  │    │  │    category: 'concerts',      │  │
│  │                               │  │    │  │    image_url: 'https://...',  │  │
│  │  // Upload to storage         │  │    │  │    storage_path: 'concerts/...'│ │
│  │  await supabase.storage       │  │    │  │  };                           │  │
│  │    .from('gallery')           │  │    │  │                               │  │
│  │    .upload(fileName, file);   │  │    │  │  await supabase               │  │
│  │                               │  │    │  │    .from('gallery')           │  │
│  │  // Get public URL            │  │    │  │    .insert([insertData])      │  │
│  │  const { publicUrl } =        │  │    │  │    .select()                  │  │
│  │    supabase.storage           │  │    │  │    .single();                 │  │
│  │    .from('gallery')           │  │    │  └───────────────────────────────┘  │
│  │    .getPublicUrl(fileName);   │  │    │                                     │
│  └───────────────────────────────┘  │    │                                     │
└─────────────────────────────────────┘    └─────────────────────────────────────┘
```

## Data Update Flow

### Example: Updating a Gallery Item

```
┌───────────────────────────────────────────────────────────────────────┐
│  Component                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  const handleUpdate = async (id, updates) => {                  │  │
│  │    const result = await galleryService.updateGalleryItem(       │  │
│  │      id,                                                        │  │
│  │      { title: 'New Title', is_active: false }                   │  │
│  │    );                                                           │  │
│  │                                                                 │  │
│  │    if (result.success) {                                        │  │
│  │      // Update local state to reflect change                    │  │
│  │      setItems(items.map(item =>                                 │  │
│  │        item.id === id ? result.data : item                      │  │
│  │      ));                                                        │  │
│  │    }                                                            │  │
│  │  };                                                             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Service                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  async updateGalleryItem(id, updates) {                         │  │
│  │    const { data, error } = await supabase                       │  │
│  │      .from('gallery')                                           │  │
│  │      .update(updates)           // Set new values               │  │
│  │      .eq('id', id)              // WHERE id = ?                 │  │
│  │      .select()                  // Return updated row           │  │
│  │      .single();                 // Expect one result            │  │
│  │                                                                 │  │
│  │    return { success: !error, data };                            │  │
│  │  }                                                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Delete Flow

### Example: Deleting a Gallery Item

```
┌───────────────────────────────────────────────────────────────────────┐
│  Delete Operation (Two Steps)                                         │
│                                                                       │
│  Step 1: Get storage path                                             │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  const { data: item } = await supabase                          │  │
│  │    .from('gallery')                                             │  │
│  │    .select('storage_path')                                      │  │
│  │    .eq('id', id)                                                │  │
│  │    .single();                                                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                              │                                        │
│                              ▼                                        │
│  Step 2: Delete file from storage                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  if (item?.storage_path) {                                      │  │
│  │    await supabase.storage                                       │  │
│  │      .from('gallery')                                           │  │
│  │      .remove([item.storage_path]);                              │  │
│  │  }                                                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                              │                                        │
│                              ▼                                        │
│  Step 3: Delete database record                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  await supabase                                                 │  │
│  │    .from('gallery')                                             │  │
│  │    .delete()                                                    │  │
│  │    .eq('id', id);                                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                              │                                        │
│                              ▼                                        │
│  Step 4: Update UI                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  setItems(items.filter(item => item.id !== id));                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

## State Management Flow

### Local State (useState)

```
Component-specific data managed with useState:

┌─────────────────────────────────────────────────────────────────────────┐
│  const [items, setItems] = useState([]);        // List of items        │
│  const [loading, setLoading] = useState(true);  // Loading indicator    │
│  const [error, setError] = useState(null);      // Error message        │
│  const [searchQuery, setSearchQuery] = useState('');  // Search input   │
│  const [selectedCategory, setSelectedCategory] = useState('all');       │
└─────────────────────────────────────────────────────────────────────────┘

State Update Triggers Re-render:

  setItems([newItem, ...items])
         │
         ▼
  ┌──────────────────┐
  │  React detects   │
  │  state change    │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  Component       │
  │  re-renders      │
  │  with new data   │
  └──────────────────┘
```

### Global State (Context API)

```
Authentication state shared across all components:

┌─────────────────────────────────────────────────────────────────────────┐
│  AuthContext                                                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Provides:                                                        │  │
│  │    - user          (current user object or null)                  │  │
│  │    - loading       (authentication loading state)                 │  │
│  │    - signIn()      (login function)                               │  │
│  │    - signOut()     (logout function)                              │  │
│  │    - signUp()      (registration function)                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

Any component can access:

┌─────────────────────────────────────────────────────────────────────────┐
│  const { user, signOut } = useAuth();                                   │
│                                                                         │
│  if (user) {                                                            │
│    return <span>Welcome, {user.name}</span>;                            │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Client-Side Filtering

Data is often filtered on the client after fetching:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  // All items stored in state                                           │
│  const [galleryItems, setGalleryItems] = useState([]);                  │
│                                                                         │
│  // Filter criteria                                                     │
│  const [selectedCategory, setSelectedCategory] = useState('all');       │
│  const [searchQuery, setSearchQuery] = useState('');                    │
│                                                                         │
│  // Derived state (computed on each render)                             │
│  const filteredItems = galleryItems.filter(item => {                    │
│    const matchesCategory = selectedCategory === 'all' ||                │
│                            item.category === selectedCategory;          │
│    const matchesSearch = item.title.toLowerCase()                       │
│                          .includes(searchQuery.toLowerCase());          │
│    return matchesCategory && matchesSearch;                             │
│  });                                                                    │
│                                                                         │
│  // Render filtered items                                               │
│  {filteredItems.map(item => <GalleryCard key={item.id} item={item} />)} │
└─────────────────────────────────────────────────────────────────────────┘
```

## Service Response Pattern

All services return consistent response objects:

```
Success Response:
┌─────────────────────────────────────────┐
│  {                                      │
│    success: true,                       │
│    data: { ... } or [ ... ]             │
│  }                                      │
└─────────────────────────────────────────┘

Error Response:
┌─────────────────────────────────────────┐
│  {                                      │
│    success: false,                      │
│    error: "Error message here",         │
│    data: [] (optional empty array)      │
│  }                                      │
└─────────────────────────────────────────┘

Component Usage:
┌─────────────────────────────────────────┐
│  const result = await service.method(); │
│                                         │
│  if (result.success) {                  │
│    // Handle success                    │
│    setData(result.data);                │
│  } else {                               │
│    // Handle error                      │
│    setError(result.error);              │
│  }                                      │
└─────────────────────────────────────────┘
```

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW PATTERNS                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  READ:    Component → Service → Supabase → Database                     │
│           Component ← Service ← Supabase ← Database                     │
│                                                                         │
│  CREATE:  Form → Service.upload() → Storage                             │
│           Form → Service.create() → Database                            │
│                                                                         │
│  UPDATE:  Component → Service.update() → Database                       │
│           Component ← Service ← Database                                │
│           Component → setItems() → Re-render                            │
│                                                                         │
│  DELETE:  Component → Service.delete()                                  │
│           Service → Get storage path from Database                      │
│           Service → Delete file from Storage                            │
│           Service → Delete record from Database                         │
│           Component → setItems(filter) → Re-render                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. Async/Await
All database operations are asynchronous (take time to complete):
```jsx
const result = await galleryService.getGalleryItems();
//             ↑ Wait for this to complete before continuing
```

### 2. State Updates Trigger Re-renders
When state changes, React automatically re-renders the component:
```jsx
setItems([newItem, ...items]);  // This causes a re-render
```

### 3. Service Layer Abstraction
Components don't call Supabase directly - they use services:
```jsx
// Good: Use service
const result = await galleryService.getGalleryItems();

// Avoid: Direct Supabase call in component
const { data } = await supabase.from('gallery').select('*');
```

### 4. Consistent Error Handling
Services catch errors and return structured responses:
```jsx
try {
  // Try database operation
  const { data, error } = await supabase.from('table')...
  if (error) throw error;
  return { success: true, data };
} catch (error) {
  return { success: false, error: error.message };
}
```

---
*File: `claudedocs/architecture/04-data-flow.md`*
