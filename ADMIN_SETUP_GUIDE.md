# Admin System Setup Guide

This guide will help you set up the complete admin management system for the Global Mission Wind Band website.

## 🚀 Quick Setup

### Step 1: Database Setup
1. Go to your Supabase SQL Editor: https://app.supabase.com/project/dcwofyezpqkkqvxyfiol/sql
2. Copy and paste the contents of `admin-database-setup.sql`
3. Click **Run** to execute the SQL

### Step 2: Create First Admin User
```bash
node setup-admin.js
```

### Step 3: Access Admin Dashboard
- Visit: http://localhost:5173/admin
- Login with:
  - Email: `admin@gmwb.com`
  - Password: `AdminPassword123!`

**⚠️ Important: Change the admin password after first login!**

## 🛡️ Admin Features

### Dashboard Overview
- Member statistics and analytics
- Recent admin activity log
- Quick access to all management tools
- Real-time data updates

### Member Management
- View all registered members
- Search and filter members by status, role, or name
- Update member roles (member, admin, super_admin)
- Activate/deactivate member accounts
- Bulk member operations
- Member contact information management

### Content Management System
- Edit website content dynamically
- Manage text, HTML, images, and JSON content
- Page-based content organization
- Live content updates without code changes
- Content versioning and history

### Role-Based Access Control
- **Member**: Basic access to member dashboard
- **Admin**: Full access to member and content management
- **Super Admin**: Complete access including system settings

### Security Features
- Row Level Security (RLS) policies
- Admin activity logging
- Secure role-based permissions
- Protected admin routes
- Session management

## 📊 Database Schema

### Core Tables
- `profiles` - Extended user information with roles
- `site_content` - Manageable website content
- `announcements` - Band announcements and news
- `events` - Concerts, rehearsals, and performances
- `applications` - Member application management
- `admin_activity_log` - Admin action tracking

### User Roles
- `member` - Regular band member
- `admin` - Band administrator
- `super_admin` - System administrator

## 🔧 Advanced Configuration

### Adding New Admin Users
1. User must first sign up normally at `/signup`
2. Admin can then update their role in Member Management
3. Or update directly in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

### Customizing Content
1. Access Content Management in admin dashboard
2. Add new content with page/section identifiers
3. Use in React components:
```jsx
const { data } = await supabase
  .from('site_content')
  .select('content')
  .eq('page', 'home')
  .eq('section', 'hero_title')
  .single()
```

### Security Configuration
All admin operations are:
- Protected by Row Level Security
- Logged to admin_activity_log
- Restricted by role-based permissions
- Validated at API level

## 🎯 Next Steps

### Immediate Actions
1. [ ] Run database setup SQL
2. [ ] Create first admin user
3. [ ] Login and change admin password
4. [ ] Test member management features
5. [ ] Add your first content items

### Production Considerations
1. [ ] Update admin email in setup script
2. [ ] Configure strong passwords
3. [ ] Review security policies
4. [ ] Set up backup procedures
5. [ ] Configure monitoring

## 📚 Available Admin Functions

### Member Management APIs
```javascript
// Get all members
const { data: members } = await supabase
  .from('profiles')
  .select('*')

// Update member role
const { error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId)

// Update member status
const { error } = await supabase
  .from('profiles')
  .update({ status: 'active' })
  .eq('id', userId)
```

### Content Management APIs
```javascript
// Get content
const { data } = await supabase
  .from('site_content')
  .select('*')
  .eq('page', 'home')

// Update content
const { error } = await supabase
  .from('site_content')
  .update({ content: 'New content' })
  .eq('id', contentId)

// Create new content
const { error } = await supabase
  .from('site_content')
  .insert({
    page: 'about',
    section: 'mission',
    content_type: 'text',
    content: 'Our mission...'
  })
```

### Activity Logging
```javascript
// Log admin action
const { error } = await supabase
  .from('admin_activity_log')
  .insert({
    action: 'Updated member role',
    target_type: 'member',
    target_id: userId,
    details: { new_role: 'admin' }
  })
```

## 🔍 Troubleshooting

### Common Issues

**Problem**: Can't access admin dashboard
- **Solution**: Ensure user has admin or super_admin role

**Problem**: Database permissions error
- **Solution**: Verify RLS policies are set up correctly

**Problem**: Content not updating
- **Solution**: Check content management permissions and cache

**Problem**: Setup script fails
- **Solution**: Ensure database tables are created first

### Support
For additional help, check:
1. Supabase dashboard logs
2. Browser console for errors
3. Network tab for API responses
4. Admin activity log for recent changes

## 🚀 Future Enhancements

Planned features:
- [ ] Event management system
- [ ] Announcement publishing
- [ ] File upload management
- [ ] Email notification system
- [ ] Advanced member analytics
- [ ] Bulk import/export tools
- [ ] Content workflow approval
- [ ] Multi-language support

---

**🎵 Global Mission Wind Band Admin System v1.0**