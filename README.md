# D & M Schedule

A shared schedule and task management app for D & M.

## Features

- **Schedule**: Weekly schedule grid for both users, side by side
- **Calendar**: Monthly calendar view for 2026 with events
- **Budget**: Split budget tracking for D and M
- **Groceries**: Shared grocery list with quantity support
- **Password Protection**: Secure access with shared password

## Getting Started

### Running Locally

1. Open `test/run.bat` or run:
   ```bash
   cd docs
   npx serve -p 3000
   ```

2. Open http://localhost:3000 in your browser

### First-Time Setup

1. Enter a shared password (minimum 5 characters, must include letters and numbers)
2. Enter an email address for password recovery
3. Click Continue

## Usage

### Switching Users

Click the user toggle button in the top-right corner to switch between D and M. The active user's schedule is editable; the other user's schedule is visible but read-only.

### Schedule

- Click an empty cell to add an event
- Click a filled cell to edit or delete an event
- Click and drag to select multiple cells, then click "Apply" to add an event to all selected cells

### Calendar

- Click any day to add an event
- Click an existing event to edit or delete it
- Events are color-coded by user (blue for D, pink for M)

### Budget

- Add items with name and cost
- Click on any item to edit inline
- Click the X to delete an item
- View totals for each user

### Groceries

- Add items with optional quantity (e.g., "2x Milk")
- Click the circle to mark as complete
- Click the X to delete an item

## Password Recovery

If you forget your password:

1. Click "Forgot Password?"
2. Enter your registered email
3. Check your email for a 6-digit code
4. Enter the code and a new password

## Install as App

This is a Progressive Web App (PWA). When you visit the site on a mobile device or desktop, you can install it for offline access:

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
