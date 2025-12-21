# Lesson 6: Understanding galleryService.js (Supabase Database)

## Overview

The `galleryService.js` file demonstrates how to interact with a **Supabase database**:
- CRUD operations (Create, Read, Update, Delete)
- File uploads to Supabase Storage
- Service class pattern
- Error handling

## File Location
```
windband/src/services/galleryService.js
```

## What is Supabase?

Supabase is a "Backend as a Service" (BaaS) that provides:
- **PostgreSQL Database** - Stores your data in tables
- **Authentication** - User login/signup
- **Storage** - File uploads (images, documents)
- **Realtime** - Live data updates
- **Edge Functions** - Server-side code

**It's like Firebase, but uses SQL and is open source.**

## Supabase Setup (src/lib/supabase.js)

```jsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Environment Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public API key

**Stored in `.env.local`:**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

## Code Structure Overview

```jsx
import { supabase } from '../lib/supabase';

class GalleryService {
  // Check if user is admin
  async isUserAdmin() { }

  // Upload image file
  async uploadImage(file, category) { }

  // Create gallery item in database
  async createGalleryItem(galleryData) { }

  // Get all gallery items
  async getGalleryItems(filters) { }

  // Update gallery item
  async updateGalleryItem(id, updates) { }

  // Delete gallery item
  async deleteGalleryItem(id) { }

  // Get image dimensions
  async getImageDimensions(file) { }
}

export const galleryService = new GalleryService();
```

## CRUD Operations Explained

### CREATE - Adding New Data

```jsx
async createGalleryItem(galleryData) {
  const insertData = {
    title: galleryData.title,
    description: galleryData.description || null,
    category: galleryData.category,
    image_url: galleryData.imageUrl,
    is_active: true
  };

  const { data, error } = await supabase
    .from('gallery')
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;

  return { success: true, data };
}
```

**SQL Equivalent:**
```sql
INSERT INTO gallery (title, description, category, image_url, is_active)
VALUES ('Concert Photo', 'Our annual concert', 'concerts', 'https://...', true)
RETURNING *;
```

**Breakdown:**
| Method | Purpose |
|--------|---------|
| `.from('gallery')` | Select the table |
| `.insert([insertData])` | Insert data (array of objects) |
| `.select()` | Return the inserted row |
| `.single()` | Expect one result |

### READ - Fetching Data

```jsx
async getGalleryItems(filters = {}) {
  let query = supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, error } = await query;

  if (error) throw error;

  return { success: true, data };
}
```

**SQL Equivalent:**
```sql
SELECT * FROM gallery
WHERE category = 'concerts' AND is_active = true
ORDER BY created_at DESC;
```

**Query Methods:**
| Method | SQL Equivalent | Example |
|--------|---------------|---------|
| `.select('*')` | `SELECT *` | Get all columns |
| `.select('id, title')` | `SELECT id, title` | Specific columns |
| `.eq('category', 'concerts')` | `WHERE category = 'concerts'` | Equals |
| `.neq('status', 'draft')` | `WHERE status != 'draft'` | Not equals |
| `.gt('price', 100)` | `WHERE price > 100` | Greater than |
| `.lt('price', 100)` | `WHERE price < 100` | Less than |
| `.gte('age', 18)` | `WHERE age >= 18` | Greater or equal |
| `.lte('age', 65)` | `WHERE age <= 65` | Less or equal |
| `.like('name', '%John%')` | `WHERE name LIKE '%John%'` | Pattern match |
| `.ilike('name', '%john%')` | `WHERE name ILIKE '%john%'` | Case-insensitive |
| `.in('id', [1, 2, 3])` | `WHERE id IN (1, 2, 3)` | In list |
| `.order('created_at', {...})` | `ORDER BY created_at DESC` | Sort |
| `.limit(10)` | `LIMIT 10` | Limit results |
| `.range(0, 9)` | `LIMIT 10 OFFSET 0` | Pagination |

### UPDATE - Modifying Data

```jsx
async updateGalleryItem(id, updates) {
  const { data, error } = await supabase
    .from('gallery')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return { success: true, data };
}
```

**SQL Equivalent:**
```sql
UPDATE gallery
SET title = 'New Title', description = 'New description'
WHERE id = 123
RETURNING *;
```

**Usage:**
```jsx
await galleryService.updateGalleryItem('123', {
  title: 'Updated Title',
  is_active: false
});
```

### DELETE - Removing Data

```jsx
async deleteGalleryItem(id) {
  // First get the item to retrieve storage path
  const { data: item } = await supabase
    .from('gallery')
    .select('storage_path')
    .eq('id', id)
    .single();

  // Delete from storage if path exists
  if (item?.storage_path) {
    await supabase.storage
      .from('gallery')
      .remove([item.storage_path]);
  }

  // Delete from database
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return { success: true };
}
```

**SQL Equivalent:**
```sql
DELETE FROM gallery WHERE id = 123;
```

**Why two steps?**
1. Get the storage path first
2. Delete the file from storage
3. Delete the database record

## File Uploads (Supabase Storage)

```jsx
async uploadImage(file, category = 'general') {
  // Generate unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${category}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('gallery')           // Bucket name
    .upload(fileName, file, {
      cacheControl: '3600',    // Cache for 1 hour
      upsert: false            // Don't overwrite
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('gallery')
    .getPublicUrl(fileName);

  return {
    success: true,
    url: publicUrl,
    storagePath: fileName
  };
}
```

**File name generation:**
```jsx
// Input: photo.jpg, category: 'concerts'
const fileExt = 'jpg';
const fileName = 'concerts/1702400000000_abc123.jpg';
// Unique path prevents overwrites
```

**Storage operations:**
| Method | Purpose |
|--------|---------|
| `.upload(path, file)` | Upload a file |
| `.download(path)` | Download a file |
| `.remove([paths])` | Delete files |
| `.getPublicUrl(path)` | Get public URL |
| `.createSignedUrl(path, seconds)` | Temporary URL |
| `.list(folder)` | List files in folder |

## Error Handling Pattern

```jsx
async createGalleryItem(galleryData) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Create gallery item error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

**Response pattern:**
```jsx
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: 'Error message' }
```

**Using the service:**
```jsx
const result = await galleryService.createGalleryItem(data);

if (result.success) {
  console.log('Created:', result.data);
} else {
  console.error('Failed:', result.error);
}
```

## Class Pattern vs Functions

### Class Pattern (Used in this file)
```jsx
class GalleryService {
  async getItems() { }
  async createItem() { }
}
export const galleryService = new GalleryService();

// Usage
galleryService.getItems();
```

### Function Pattern (Alternative)
```jsx
export async function getItems() { }
export async function createItem() { }

// Usage
import { getItems, createItem } from './galleryService';
getItems();
```

**Why use class?**
- Groups related functions together
- Can have shared state (if needed)
- Single instance (`new GalleryService()`)

## Visual Diagram: Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  React Component (e.g., Gallery.jsx)                             │
│                                                                  │
│  useEffect(() => {                                               │
│    const fetchData = async () => {                               │
│      const result = await galleryService.getGalleryItems();      │
│      if (result.success) setItems(result.data);                  │
│    };                                                            │
│    fetchData();                                                  │
│  }, []);                                                         │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│  galleryService.js                                               │
│                                                                  │
│  async getGalleryItems() {                                       │
│    const { data, error } = await supabase                        │
│      .from('gallery')                                            │
│      .select('*');                                               │
│    return { success: true, data };                               │
│  }                                                               │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│  Supabase Client (lib/supabase.js)                               │
│                                                                  │
│  Sends HTTP request to Supabase API                              │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│  Supabase Cloud                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                       │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  gallery table                                       │  │  │
│  │  │  id | title | image_url | category | created_at      │  │  │
│  │  │  ───────────────────────────────────────────────────  │  │  │
│  │  │  1  | Photo | https://  | concerts | 2024-01-01      │  │  │
│  │  │  2  | Video | https://  | events   | 2024-01-02      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Complete CRUD Example

### In a React Component

```jsx
import { useState, useEffect } from 'react';
import { galleryService } from '../services/galleryService';

const GalleryAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // READ - Fetch items on mount
  useEffect(() => {
    const fetchItems = async () => {
      const result = await galleryService.getGalleryItems();
      if (result.success) {
        setItems(result.data);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  // CREATE - Add new item
  const handleCreate = async (formData) => {
    const result = await galleryService.createGalleryItem(formData);
    if (result.success) {
      setItems([result.data, ...items]);  // Add to top of list
    }
  };

  // UPDATE - Edit item
  const handleUpdate = async (id, updates) => {
    const result = await galleryService.updateGalleryItem(id, updates);
    if (result.success) {
      setItems(items.map(item =>
        item.id === id ? result.data : item
      ));
    }
  };

  // DELETE - Remove item
  const handleDelete = async (id) => {
    const result = await galleryService.deleteGalleryItem(id);
    if (result.success) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <button onClick={() => handleUpdate(item.id, { title: 'New' })}>
            Edit
          </button>
          <button onClick={() => handleDelete(item.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Common Supabase Patterns

### Pagination
```jsx
const { data } = await supabase
  .from('gallery')
  .select('*')
  .range(0, 9);  // First 10 items (0-9)

// Page 2
  .range(10, 19);  // Items 11-20
```

### Count Total
```jsx
const { count } = await supabase
  .from('gallery')
  .select('*', { count: 'exact', head: true });
// Returns count without fetching data
```

### Related Data (Joins)
```jsx
const { data } = await supabase
  .from('gallery')
  .select(`
    *,
    user:created_by (
      id,
      name,
      email
    )
  `);
// Fetches gallery items with related user data
```

### Real-time Subscriptions
```jsx
const subscription = supabase
  .channel('gallery-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'gallery' },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Practice Exercises

### Exercise 1: Add a search function
```jsx
async searchGalleryItems(searchTerm) {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .ilike('title', `%${searchTerm}%`);

  if (error) throw error;
  return { success: true, data };
}
```

### Exercise 2: Get items by date range
```jsx
async getItemsByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) throw error;
  return { success: true, data };
}
```

## Summary

| Operation | Supabase Method | SQL |
|-----------|-----------------|-----|
| Create | `.insert([data])` | INSERT |
| Read | `.select('*')` | SELECT |
| Update | `.update(data).eq('id', id)` | UPDATE WHERE |
| Delete | `.delete().eq('id', id)` | DELETE WHERE |

**Key Takeaways:**
1. Supabase uses method chaining (fluent API)
2. Always handle errors with try/catch
3. Return consistent response objects
4. Use service classes to organize database logic
5. Keep database operations separate from UI components

---
*File: `claudedocs/learning/06-gallery-service.md`*
