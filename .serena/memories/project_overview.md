# Space Reservation System (장소 예약 시스템)

## Purpose
A web application for managing and reserving shared spaces like meeting rooms and common areas within an organization. Users can book spaces in 30-minute time slots with email-based authentication.

## Current Status
Frontend-only implementation using localStorage for data persistence (no backend yet).

## Tech Stack
- **Frontend**: React 19.1.1 with Vite 7.1.7
- **Routing**: React Router DOM v7.9.5
- **Data Storage**: localStorage (temporary)
- **Styling**: Plain CSS with component-scoped stylesheets
- **Linting**: ESLint 9.x with React hooks plugins

## Project Structure
```
space_reservation_system/
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route-level components
│   │   │   ├── SignUp.jsx, Login.jsx, EmailVerification.jsx
│   │   │   ├── Calendar.jsx, Reservation.jsx
│   │   │   ├── Admin.jsx, MyReservations.jsx
│   │   ├── components/      # Reusable components
│   │   │   ├── ReservationModal.jsx
│   │   │   └── HelpModal.jsx
│   │   ├── constants.js     # Shared constants
│   │   ├── App.jsx          # Route configuration
│   │   └── main.jsx         # App entry
│   ├── package.json
│   └── vite.config.js
├── CLAUDE.md                # Development guide
└── README.md
```

## Key Features
- 11 reservable spaces (Vision On, 월드비전홀, etc.)
- 7 department categories with color coding
- Operating hours: 07:00 - 22:00 (30-min slots)
- Admin dashboard for user management
- Multi-slot booking support

## Admin Account
- Email: admin@test.com
- Password: Admin1234
