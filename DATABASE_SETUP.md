# Database Setup Guide

## Overview

This application uses Supabase as the primary data source with localStorage as backup for offline functionality. All data is automatically synced between Supabase and local storage.

## Current Database Status

✅ **Database is populated and ready to use**

- Categories: 44 entries
- Suppliers: 16 entries
- Items: 212 entries
- Settings: 1 entry

## How Data Loading Works

1. **Primary Source**: Supabase database
2. **Fallback**: localStorage (for offline use)
3. **Sync**: Automatic bidirectional sync

### Data Loading Flow

```
App Starts
    ↓
Load from Supabase (priority)
    ↓
Save to localStorage (backup)
    ↓
Use data in app
    ↓
Changes sync back to Supabase
```

## Database Tables

### Items
- id, name, khmer_name, category, supplier
- tags, unit_tag, unit_price, variant_tags
- last_ordered, order_count

### Categories
- id, name, emoji, main_category

### Suppliers
- id, name, contact, payment_method, order_type
- default_payment_method, default_order_type

### Tags
- id, name, color, category

### Pending Orders
- id, supplier, items, status, store_tag
- order_type, payment_method, contact_person
- notes, invoice_url, amount
- is_received, is_paid, completed_at

### Current Order
- Single row storing the active order
- items (jsonb), order_type, payment_method
- manager, store

### Settings
- Single row storing app preferences
- default_supplier, order_template, autosave

## Offline Functionality

The app includes an offline queue that:
- Stores changes when offline
- Automatically syncs when connection is restored
- Maintains data integrity

## PWA Features

The app is now a Progressive Web App with:
- Service Worker for offline functionality
- Manifest for installability
- Cache-first strategy for static assets
- Network-first for API calls

## Manual Data Population

If you need to repopulate the database:

1. The items are already in the database (212 items from import)
2. Categories, suppliers, and settings have been populated
3. To add more data, use the populate script:

```bash
npm run populate-db
```

Or use SQL directly:
```sql
-- Run scripts/populate-data.sql
```

## Syncing Data

The app automatically syncs data, but you can also:

1. **Manual Sync**: Use the sync button in the UI
2. **Automatic**: Changes sync immediately when online
3. **Queue Processing**: Offline changes sync when connection returns

## Troubleshooting

### Data Not Loading
1. Check internet connection
2. Verify Supabase credentials in `.env`
3. Check browser console for errors
4. Clear localStorage and reload

### Sync Issues
1. Check network tab in DevTools
2. Verify RLS policies allow access
3. Check offline queue: `offlineQueue.getQueue()`

### Database Access
All tables use open RLS policies (`USING (true)`) for development.
For production, implement proper authentication and RLS policies.
