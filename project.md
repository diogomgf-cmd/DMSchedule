# D & M Schedule - Technical Documentation

## Overview

A shared 2-user PWA with real-time sync via Firebase Firestore. Features 5 tabs: Schedule, Calendar, Budget, Groceries, and Gym. Mobile-first with adaptive desktop UI.

## Tech Stack

- **Frontend**: Vanilla HTML5, ES6 JavaScript
- **Styling**: Tailwind CSS (via CDN) + Custom CSS
- **Icons**: Lucide Icons
- **Database**: Firebase Firestore
- **PWA**: Service Worker + Manifest.json
- **Email**: EmailJS for password reset codes

## Project Structure

```
DMSchedule/
├── docs/                       # GitHub Pages deployment folder
│   ├── index.html              # Main SPA entry point
│   ├── main.js                 # App initialization
│   ├── config/
│   │   ├── emailjs.js         # EmailJS credentials
│   │   └── firebase.js        # Firebase configuration
│   ├── core/
│   │   ├── budget.js          # Budget data manager
│   │   ├── calendar.js        # Calendar data manager
│   │   ├── gym.js             # Gym data manager
│   │   ├── grocery.js         # Grocery data manager
│   │   ├── schedule.js        # Schedule data manager
│   │   └── state.js           # Application state
│   ├── css/
│   │   └── style.css          # Custom styles (responsive)
│   ├── data/
│   │   └── firestore.js       # Firestore data layer
│   ├── services/
│   │   ├── auth.js            # Authentication service
│   │   └── notifications.js   # Notification service
│   ├── static/
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js              # Service worker
│   ├── ui/
│   │   ├── auth-ui.js         # Password/auth UI handling
│   │   ├── modals.js          # Modal management + config
│   │   ├── tabs.js            # Tab navigation
│   │   └── grids/
│   │       ├── budget.js      # Budget grid rendering
│   │       ├── calendar.js    # Calendar grid rendering
│   │       ├── gym.js         # Gym grid rendering
│   │       ├── grocery.js     # Grocery list rendering
│   │       └── schedule.js    # Schedule grid rendering
│   └── utils/
│       ├── constants.js        # App constants
│       └── validators.js      # Validation helpers
├── test/
│   └── run.bat               # Local server launcher
├── backups/                  # Previous versions backup
├── project.md                # This file
└── README.md                 # User documentation
```

## Architecture Pattern

Clean Architecture with layered separation:

- **core/**: Business logic and data managers
- **data/**: Data access layer (Firestore)
- **services/**: External service integrations (Auth, Notifications)
- **ui/**: Presentation layer (components, grids, modals)
- **utils/**: Shared utilities and constants
- **config/**: Application configuration

## Features

### Tabs

1. **Schedule** - Weekly grid (Mon-Sun) with drag-to-select, multi-cell edit
2. **Calendar** - 2026 monthly view with color-coded events
3. **Budget** - Split view (D/M) with inline editing
4. **Groceries** - Shared checklist with quantity support
5. **Gym** - User-based workouts with exercises (drag to reorder)

### Adaptive UI

- **Mobile (<1024px)**: Bottom navigation bar, full-width content
- **Desktop (≥1024px)**: Sidebar navigation, centered content, larger cells

### Security

- Password protection with SHA-256 hashing
- Shared password between D & M (stored in Firestore)
- EmailJS verification codes for password reset

## Firebase Collections

| Collection | Fields |
|------------|--------|
| schedule_D | title, day, time, user="D" |
| schedule_M | title, day, time, user="M" |
| events | title, date, time, user |
| budget_D | item, cost |
| budget_M | item, cost |
| groceries | name, quantity, completed |
| gym_D | name, order, exercises[] |
| gym_M | name, order, exercises[] |
| settings/auth | passwordHash, email, updatedAt |

### Gym Document Structure

```javascript
{
  name: "Push Day",
  order: 0,
  exercises: [
    {
      id: "uuid",
      name: "Bench Press",
      duration: { minutes: 0, seconds: 45 },
      repetitions: { reps: 12, increment: 2 },
      weight: { starting: 60, increment: 5 }
    }
  ]
}
```

## Firestore Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Local Development

1. Double-click `test/run.bat` to start server
2. Open http://localhost:3000
3. Changes to files update automatically

Or manually:
```bash
cd docs
npx serve -p 3000
```

## Deployment to GitHub Pages

1. Push to GitHub:
```bash
git add .
git commit -m "Update"
git push
```

2. Enable Pages:
   - Repo Settings → Pages
   - Branch: main
   - Folder: / (root)

3. Make repo **Public** (required for free Pages)

## Security Configuration

### Firebase (Google Cloud Console)
- Restrict API key to HTTP referrers: `your-username.github.io/*`, `localhost/*`
- API restrictions: Cloud Firestore API only
- Firestore Security Rules: Open access (rely on API key restrictions)

### EmailJS Dashboard
- Template uses dynamic variables: `{{to_email}}`, `{{code}}`
- Rate limited to 200 emails/month (free tier)

## Module Responsibilities

### Core Managers
- **state.js**: Centralized application state (currentUser, currentTab, selectedCells)
- **schedule.js**: Schedule CRUD operations and data synchronization
- **calendar.js**: Calendar event management
- **budget.js**: Budget item management per user
- **grocery.js**: Grocery list management
- **gym.js**: Workout and exercise management

### Services
- **auth.js**: Password hashing, login, password reset flow
- **notifications.js**: Browser notification permissions

### UI Components
- **tabs.js**: Tab navigation between all 5 tabs
- **auth-ui.js**: Password overlay, login, reset flow UI
- **modals.js**: Dynamic modal content with ModalConfig for CRUD
- **grids/**: Rendering logic for each data type

### Data Layer
- **firestore.js**: All Firestore subscriptions and mutations with batch support

## Version History
