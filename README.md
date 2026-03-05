# D & M Schedule

A shared schedule and task management app for D & M with real-time sync.

## Features

- **Schedule**: Weekly grid for both users with drag-to-select
- **Calendar**: Monthly calendar for 2026 with color-coded events
- **Budget**: Split budget tracking for D and M
- **Groceries**: Shared grocery list with quantity support
- **Gym**: User-based workout plans with exercises
- **Password Protection**: Secure access with shared password
- **Installable**: Works offline as a PWA

## Getting Started

### Running Locally

1. Open `test/run.bat` or run:
   ```bash
   cd docs
   npx serve -p 3000
   ```

2. Open http://localhost:3000

### First-Time Setup

1. Enter a shared password (minimum 5 characters, must include letters and numbers)
2. Enter an email address for password recovery
3. Click Continue

## Usage

### Switching Users

Click the user toggle in the top-right corner to switch between D and M. The active user's data is editable; the other user's is visible but read-only.

### Schedule

- Click an empty cell to add an event
- Click a filled cell to edit or delete
- Drag to select multiple cells, then click "Apply" to add an event to all

### Calendar

- Click any day to add an event
- Click an event to edit or delete
- Events are color-coded by user (blue for D, pink for M)

### Budget

- Add items with name and cost
- Click an item to edit inline
- Click the X to delete
- View totals for each user

### Groceries

- Add items with optional quantity (e.g., "2x Milk")
- Click the circle to mark complete
- Click the X to delete

### Gym

- Add workout plans (e.g., "Push Day", "Pull Day")
- Add exercises with name, duration, reps, and weight
- Drag to reorder exercises within a workout
- Drag workouts to reorder them

## Password Recovery

1. Click "Forgot Password?"
2. Enter your registered email
3. Check your email for a 6-digit code
4. Enter the code and set a new password

## Install as App

This is a Progressive Web App (PWA):

- **Chrome/Edge**: Click the install icon in the address bar
- **Safari (iOS)**: Tap Share → Add to Home Screen
- **Firefox**: Click the + icon in the address bar

## Tech Stack

- HTML5, JavaScript (ES6+)
- Tailwind CSS
- Lucide Icons
- Firebase Firestore
- EmailJS

## Support

For technical issues or feature requests, contact the developer.
