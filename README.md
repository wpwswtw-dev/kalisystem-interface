# Kalisystem Interface

## Overview

Kalisystem is a restaurant ordering and inventory management system built with React, TypeScript, and Supabase.

## Features

- 📦 Inventory management with 212+ items
- 🏪 Multi-supplier ordering system
- 📱 Progressive Web App (installable on mobile/desktop)
- 🔄 Offline-first with automatic sync
- 🎯 Order tracking and management
- 📊 Category-based organization

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui, Tailwind CSS
- **State**: React Context API
- **PWA**: Service Worker, Web App Manifest

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (`.env`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Database

The database is already populated with:
- 44 categories
- 16 suppliers
- 212 items
- Settings

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed information.

## PWA Installation

The app can be installed as a PWA:
- **Desktop**: Look for the install button in your browser's address bar
- **Mobile**: Use "Add to Home Screen" from your browser menu

## Architecture

- **Data Source**: Supabase (primary) → localStorage (backup/offline)
- **Sync**: Automatic bidirectional sync with offline queue
- **Offline**: Full functionality with queued sync when online

## Development

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run populate-db` - Populate database with default data
