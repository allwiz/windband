# Database Schema Architecture

## Overview

The Windband application uses **Supabase** (PostgreSQL) as its database. This document describes all tables, their columns, relationships, and constraints.

## Database Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────┐       ┌───────────────┐                              │
│  │    users      │       │   sessions    │                              │
│  │───────────────│       │───────────────│                              │
│  │ id (PK)       │◄──────│ user_id (FK)  │                              │
│  │ email         │       │ token         │                              │
│  │ password_hash │       │ expires_at    │                              │
│  │ full_name     │       └───────────────┘                              │
│  │ role          │                                                      │
│  │ is_active     │                                                      │
│  └───────┬───────┘                                                      │
│          │                                                              │
│          │ created_by (FK)                                              │
│          │                                                              │
│  ┌───────┴───────┐  ┌───────────────┐  ┌───────────────┐                │
│  │   gallery     │  │ performances  │  │   openings    │                │
│  │───────────────│  │───────────────│  │───────────────│                │
│  │ id (PK)       │  │ id (PK)       │  │ id (PK)       │                │
│  │ title         │  │ title         │  │ instrument    │                │
│  │ image_url     │  │ date          │  │ openings_count│                │
│  │ category      │  │ venue         │  │ priority      │                │
│  │ is_active     │  │ is_featured   │  │ is_active     │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │    events     │  │ site_content  │  │ site_settings │                │
│  │───────────────│  │───────────────│  │───────────────│                │
│  │ id (PK)       │  │ id (PK)       │  │ id (PK)       │                │
│  │ title         │  │ content_key   │  │ setting_key   │                │
│  │ date          │  │ content_value │  │ setting_value │                │
│  │ event_type    │  │ content_type  │  │ setting_type  │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Table Descriptions

### 1. users

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: uuid_generate_v4() | Unique identifier |
| email | text | UNIQUE, NOT NULL | User's email address |
| password_hash | text | NOT NULL | Hashed password (never store plain text!) |
| full_name | text | nullable | User's display name |
| phone | text | nullable | Phone number |
| avatar_url | text | nullable | Profile picture URL |
| role | text | CHECK (user, admin), Default: 'user' | User role |
| email_verified | boolean | Default: false | Email verification status |
| email_verification_token | text | nullable | Token for email verification |
| email_verification_token_expires_at | timestamptz | nullable | Token expiry |
| email_verified_at | timestamptz | nullable | When email was verified |
| password_reset_token | text | nullable | Token for password reset |
| password_reset_expires | timestamptz | nullable | Reset token expiry |
| last_login_at | timestamptz | nullable | Last login timestamp |
| login_count | integer | Default: 0 | Number of logins |
| is_active | boolean | Default: true | Account active status |
| created_at | timestamptz | Default: now() | Creation timestamp |
| updated_at | timestamptz | Default: now() | Last update timestamp |

**Role Values:**
- `user` - Regular user with dashboard access
- `admin` - Administrator with full access

### 2. sessions

Stores user authentication sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: uuid_generate_v4() | Unique identifier |
| user_id | uuid | FK → users.id, NOT NULL | Reference to user |
| token | text | UNIQUE, NOT NULL | Session token |
| expires_at | timestamptz | NOT NULL | Session expiry |
| ip_address | inet | nullable | Client IP address |
| user_agent | text | nullable | Browser information |
| last_activity | timestamptz | Default: now() | Last activity timestamp |
| created_at | timestamptz | Default: now() | Session creation time |

### 3. gallery

Stores photo gallery items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: gen_random_uuid() | Unique identifier |
| title | text | NOT NULL | Image title |
| description | text | nullable | Image description (can be HTML) |
| image_url | text | NOT NULL | Public URL of the image |
| storage_path | text | nullable | Path in Supabase storage |
| category | text | CHECK, Default: 'general' | Image category |
| date | date | Default: CURRENT_DATE | Date of photo |
| file_size | integer | nullable | File size in bytes |
| mime_type | text | nullable | File MIME type |
| width | integer | nullable | Image width in pixels |
| height | integer | nullable | Image height in pixels |
| is_active | boolean | Default: true | Display status |
| created_by | uuid | FK → users.id | Creator user |
| created_at | timestamptz | Default: now() | Creation timestamp |
| updated_at | timestamptz | Default: now() | Last update timestamp |

**Category Values:**
- `concerts` - Concert photos
- `rehearsals` - Rehearsal photos
- `events` - Event photos
- `members` - Member photos
- `general` - General photos

### 4. performances

Stores performance/concert information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: gen_random_uuid() | Unique identifier |
| title | text | NOT NULL | Performance title |
| description | text | nullable | Performance description |
| category | text | CHECK, Default: 'concert' | Performance type |
| date | date | Default: CURRENT_DATE | Performance date |
| start_time | time | nullable | Start time |
| end_time | time | nullable | End time |
| venue | text | nullable | Venue name/address |
| image_url | text | nullable | Promotional image URL |
| storage_path | text | nullable | Path in Supabase storage |
| file_size | integer | nullable | File size in bytes |
| mime_type | text | nullable | File MIME type |
| width | integer | nullable | Image width |
| height | integer | nullable | Image height |
| ticket_link | text | nullable | URL for tickets |
| is_featured | boolean | Default: false | Featured on homepage |
| is_active | boolean | Default: true | Display status |
| created_by | uuid | FK → users.id | Creator user |
| created_at | timestamptz | Default: now() | Creation timestamp |
| updated_at | timestamptz | Default: now() | Last update timestamp |

**Category Values:**
- `concert` - Regular concerts
- `competition` - Competition performances
- `festival` - Festival appearances
- `recital` - Recitals
- `community` - Community events
- `general` - Other performances

### 5. openings

Stores instrument openings/vacancies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: gen_random_uuid() | Unique identifier |
| instrument_name | text | NOT NULL | Instrument name |
| openings_count | integer | Default: 1 | Number of openings |
| description | text | nullable | Additional details |
| priority | integer | Default: 0 | Display priority (higher = first) |
| is_active | boolean | Default: true | Display status |
| created_by | uuid | FK → users.id | Creator user |
| created_at | timestamptz | Default: now() | Creation timestamp |
| updated_at | timestamptz | Default: now() | Last update timestamp |

### 6. events

Stores internal events (rehearsals, meetings, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: gen_random_uuid() | Unique identifier |
| title | text | NOT NULL | Event title |
| description | text | nullable | Event description |
| event_type | text | CHECK, Default: 'rehearsal' | Type of event |
| date | date | NOT NULL | Event date |
| start_time | time | nullable | Start time |
| end_time | time | nullable | End time |
| location | text | nullable | Event location |
| is_recurring | boolean | Default: false | Recurring event flag |
| recurrence_pattern | text | nullable | Recurrence details |
| is_active | boolean | Default: true | Active status |
| created_by | uuid | FK → users.id | Creator user |
| created_at | timestamptz | Default: now() | Creation timestamp |
| updated_at | timestamptz | Default: now() | Last update timestamp |

**Event Type Values:**
- `rehearsal` - Band rehearsals
- `meeting` - Administrative meetings
- `social` - Social gatherings
- `workshop` - Educational workshops
- `other` - Other events

### 7. site_content

Stores dynamic website content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: gen_random_uuid() | Unique identifier |
| content_key | text | UNIQUE, NOT NULL | Content identifier |
| content_value | text | nullable | The content |
| content_type | text | CHECK, Default: 'text' | Content format |
| description | text | nullable | Admin description |
| updated_by | uuid | FK → users.id | Last updater |
| created_at | timestamptz | Default: now() | Creation timestamp |
| updated_at | timestamptz | Default: now() | Last update timestamp |

**Content Type Values:**
- `text` - Plain text
- `html` - HTML content
- `json` - JSON data

### 8. site_settings

Stores website configuration settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, Default: gen_random_uuid() | Unique identifier |
| setting_key | text | UNIQUE, NOT NULL | Setting identifier |
| setting_value | text | nullable | The setting value |
| setting_type | text | CHECK, Default: 'text' | Value type |
| description | text | nullable | Admin description |
| updated_by | uuid | FK → users.id | Last updater |
| created_at | timestamptz | Default: now() | Creation timestamp |
| updated_at | timestamptz | Default: now() | Last update timestamp |

**Setting Type Values:**
- `text` - Plain text
- `number` - Numeric value
- `boolean` - True/false
- `json` - JSON object
- `email` - Email address
- `url` - URL

## Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FOREIGN KEY RELATIONSHIPS                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  users (1) ─────┬───── (*) sessions                                     │
│                 │      sessions.user_id → users.id                      │
│                 │                                                       │
│                 ├───── (*) gallery                                      │
│                 │      gallery.created_by → users.id                    │
│                 │                                                       │
│                 ├───── (*) performances                                 │
│                 │      performances.created_by → users.id               │
│                 │                                                       │
│                 ├───── (*) openings                                     │
│                 │      openings.created_by → users.id                   │
│                 │                                                       │
│                 ├───── (*) events                                       │
│                 │      events.created_by → users.id                     │
│                 │                                                       │
│                 ├───── (*) site_content                                 │
│                 │      site_content.updated_by → users.id               │
│                 │                                                       │
│                 └───── (*) site_settings                                │
│                        site_settings.updated_by → users.id              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
  (1) = One
  (*) = Many
  → = Foreign Key reference
```

## Row Level Security (RLS)

All tables have RLS enabled for security. This controls who can access what data:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RLS STATUS                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Table          │ RLS Enabled │ Description                             │
│─────────────────┼─────────────┼─────────────────────────────────────────│
│  users          │     ✓       │ Users can only access their own data    │
│  sessions       │     ✓       │ Sessions tied to specific users         │
│  gallery        │     ✓       │ Public read, admin write                │
│  performances   │     ✓       │ Public read, admin write                │
│  openings       │     ✓       │ Public read, admin write                │
│  events         │     ✓       │ Public read, admin write                │
│  site_content   │     ✓       │ Public read, admin write                │
│  site_settings  │     ✓       │ Public read, admin write                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Types Reference

### PostgreSQL Types Used

| Type | Description | Example |
|------|-------------|---------|
| uuid | Universally Unique Identifier | `550e8400-e29b-41d4-a716-446655440000` |
| text | Variable-length string | `"Hello World"` |
| boolean | True/False | `true`, `false` |
| integer | Whole number | `42` |
| date | Calendar date | `2024-03-15` |
| time | Time of day | `19:30:00` |
| timestamptz | Timestamp with timezone | `2024-03-15T19:30:00Z` |
| inet | IP address | `192.168.1.1` |

### Default Values

```sql
-- UUID generation
DEFAULT: gen_random_uuid()
DEFAULT: uuid_generate_v4()

-- Timestamps
DEFAULT: now()
DEFAULT: CURRENT_DATE

-- Booleans
DEFAULT: true
DEFAULT: false

-- Text
DEFAULT: 'user'::text
DEFAULT: 'general'::text
```

### Check Constraints

Check constraints limit the values that can be stored:

```sql
-- Role constraint
CHECK (role = ANY (ARRAY['user'::text, 'admin'::text]))

-- Gallery category constraint
CHECK (category = ANY (ARRAY[
  'concerts'::text,
  'rehearsals'::text,
  'events'::text,
  'members'::text,
  'general'::text
]))

-- Performance category constraint
CHECK (category = ANY (ARRAY[
  'concert'::text,
  'competition'::text,
  'festival'::text,
  'recital'::text,
  'community'::text,
  'general'::text
]))
```

## Common Query Patterns

### Select All Active Items

```sql
SELECT * FROM gallery WHERE is_active = true;
SELECT * FROM performances WHERE is_active = true;
SELECT * FROM openings WHERE is_active = true;
```

### Filter by Category

```sql
SELECT * FROM gallery
WHERE category = 'concerts' AND is_active = true
ORDER BY created_at DESC;
```

### Join User Information

```sql
SELECT g.*, u.full_name as creator_name
FROM gallery g
LEFT JOIN users u ON g.created_by = u.id
WHERE g.is_active = true;
```

### Get Featured Performances

```sql
SELECT * FROM performances
WHERE is_featured = true AND is_active = true
ORDER BY date ASC;
```

### Count Items by Category

```sql
SELECT category, COUNT(*) as count
FROM gallery
WHERE is_active = true
GROUP BY category;
```

## Supabase Client Usage

### JavaScript Query Examples

```javascript
// Select all active gallery items
const { data } = await supabase
  .from('gallery')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });

// Insert new item
const { data } = await supabase
  .from('gallery')
  .insert([{
    title: 'Concert Photo',
    image_url: 'https://...',
    category: 'concerts'
  }])
  .select()
  .single();

// Update item
const { data } = await supabase
  .from('gallery')
  .update({ title: 'New Title' })
  .eq('id', 'item-uuid')
  .select()
  .single();

// Delete item
const { error } = await supabase
  .from('gallery')
  .delete()
  .eq('id', 'item-uuid');
```

## Storage Buckets

In addition to the database, Supabase Storage is used for files:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STORAGE BUCKETS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  gallery/                                                               │
│  ├── concerts/                                                          │
│  │   └── 1702400000_abc123.jpg                                         │
│  ├── rehearsals/                                                        │
│  │   └── 1702400001_def456.png                                         │
│  ├── events/                                                            │
│  │   └── ...                                                            │
│  └── performances/                                                      │
│      └── concert/                                                       │
│          └── 1702400002_ghi789.jpg                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**File naming convention:**
```
{category}/{timestamp}_{random}.{extension}
Example: concerts/1702400000_abc123.jpg
```

---
*File: `claudedocs/architecture/06-database-schema.md`*
