# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Space Reservation System** (장소 예약 시스템) - a web application for managing and reserving shared spaces like meeting rooms and common areas within an organization. The system implements email-based authentication with verification codes and allows authorized users to book spaces in 30-minute time slots.

**Current Status**: Frontend-only implementation using localStorage for data persistence (no backend yet).

## Architecture

### Tech Stack
- **Frontend**: React 19.1.1 with Vite 7.1.7
- **Routing**: React Router DOM v7.9.5
- **Data Storage**: localStorage (temporary, backend planned)
- **Styling**: Plain CSS with component-scoped stylesheets

### Project Structure
```
space_reservation_system/
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route-level components
│   │   │   ├── SignUp.jsx           # User registration with dept dropdown
│   │   │   ├── EmailVerification.jsx  # 6-digit verification code
│   │   │   ├── Login.jsx            # User authentication
│   │   │   ├── Calendar.jsx         # Date selection (main view)
│   │   │   ├── Reservation.jsx      # Space/time table with edit/delete
│   │   │   ├── Admin.jsx            # Admin dashboard for user management
│   │   │   └── MyReservations.jsx   # User's reservation list
│   │   ├── components/      # Reusable components
│   │   │   └── ReservationModal.jsx  # Create/Edit reservation modal
│   │   ├── constants.js     # Shared constants (SPACES, TIME_SLOTS, DEPARTMENTS, COLORS)
│   │   ├── App.jsx          # Route configuration
│   │   └── main.jsx         # App entry + admin account initialization
│   ├── package.json
│   └── vite.config.js
├── PRD.md                   # Full product requirements (Korean)
├── 기획 문서.md              # Initial planning document (Korean)
└── 남은 작업 리스트.md       # Completed task list (Korean)
```

## Key Data Models

### User Object (localStorage: 'users')
```javascript
{
  email: string,              // Unique identifier
  password: string,           // Plain text (NOT hashed - security issue)
  name: string,
  department: string,         // One of: 교역자, 비전브릿지, CAM, 프뉴마, 가스펠, 카리스, 기타
  isEmailVerified: boolean,
  role: 'user' | 'admin',
  createdAt: string (ISO)
}
```

### Reservation Object (localStorage: 'reservations')
```javascript
{
  [date]: {                   // YYYY-MM-DD
    [space-time]: {           // e.g., "vision on-07:00"
      userEmail: string,      // Owner's email for edit/delete permissions
      name: string,
      department: string,     // Used for color coding
      purpose: string,
      startTime: string,      // HH:MM format
      endTime: string,        // HH:MM format
      space: string,
      time: string,
      isStart: boolean        // True only for first slot in range
    }
  }
}
```

### CurrentUser (localStorage: 'currentUser')
Stores the logged-in user object. Set during login, removed on logout.

## Business Rules

### Supported Spaces (11 total)
1. vision on
2. 월드비전홀
3. 순보금자리
4. 푸른초장
5. 쉴만한 물가
6. 넘치는 잔
7. Vision Factory 1-5

### Departments (7 categories with color coding)
- 교역자 (Red: #FF6B6B)
- 비전브릿지 (Teal: #4ECDC4)
- CAM (Blue: #45B7D1)
- 프뉴마 (Green: #96CEB4)
- 가스펠 (Yellow: #FFEAA7)
- 카리스 (Orange: #DDA15E)
- 기타 (Purple: #B19CD9)

### Time Constraints
- **Operating Hours**: 07:00 - 22:00
- **Time Slot**: 30-minute increments
- **Total Slots**: 30 slots per day (7:00, 7:30, 8:00... 21:30)
- **Booking Range**: Cannot book past dates (enforced in Calendar view)
- **Time Display**: Shows as ranges (e.g., "07:00 ~ 07:30")

### Reservation Logic
- **Multi-slot booking**: A single reservation from 9:00-11:00 creates separate entries for 9:00, 9:30, 10:00, 10:30 (but only displays info on the first slot)
- **Department-based colors**: Each reservation is color-coded by department
- **Edit permissions**: Users can edit/delete own reservations; admins can edit/delete any
- **Editable indicator**: Hover effect on reservations you can edit

## Development Commands

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Authentication Flow

### Registration (SignUp.jsx → EmailVerification.jsx)
1. User enters email, password, name, department
2. System validates email format and password rules (8+ chars, letters + numbers)
3. **Email verification code is NOT sent** (no backend/SMTP configured)
4. User is redirected to verification screen
5. User enters 6-digit code (validation exists but no actual code generation)
6. On success, user object created with `isEmailVerified: true`

### Login (Login.jsx → Calendar.jsx)
1. User enters email + password
2. System checks localStorage for matching user
3. Validates `isEmailVerified === true`
4. Sets `currentUser` in localStorage
5. Redirects to /calendar

### Admin Features
- **Email**: admin@test.com
- **Password**: Admin1234
- **Auto-created**: Generated in main.jsx on app initialization
- **Admin Dashboard** (`/admin`):
  - View all registered users
  - Create new user accounts (bypasses email verification)
  - Users created by admin have `isEmailVerified: true` automatically
- **Admin Permissions**:
  - Can edit/delete any reservation (not just own)
  - Access to admin dashboard page

## Known Issues & Technical Debt

1. **Security Vulnerabilities**:
   - Passwords stored in plain text (should use bcrypt/argon2)
   - No HTTPS enforcement mentioned
   - No CSRF protection
   - Email verification codes not actually generated/sent

2. **Data Persistence**:
   - All data in localStorage (lost on cache clear)
   - No backend API yet
   - No real email service integrated

3. **Validation Gaps**:
   - Reservation overlap not checked properly
   - No server-side validation
   - Race conditions possible (concurrent bookings)

4. **Remaining Features** (documented in PRD.md):
   - Password reset
   - Recurring bookings
   - Email notifications
   - Calendar view in My Reservations page

## Future Backend Integration

According to PRD.md Section 13, planned stack:
- **Backend**: Node.js (Express) or Python (Django/Flask)
- **Database**: PostgreSQL or MySQL
- **Email Service**: SMTP (Gmail, AWS SES, SendGrid)
- **Auth**: JWT or Session-based
- **Password Hashing**: bcrypt or argon2

When implementing backend:
- Migrate localStorage data models to database schema (see PRD.md Section 9)
- Implement proper transaction locking for concurrent reservations
- Add email verification code generation with 5-minute expiry
- Implement proper password hashing

## Design Patterns

- **Page-level routing**: Each route maps to a page component in `src/pages/`
- **Component composition**: ReservationModal is reusable across contexts
- **Local state management**: Uses React hooks (no Redux/Context API)
- **Prop drilling**: User data passed down through props
- **CSS co-location**: Each component has matching .css file

## Important Constants

Located in `constants.js` (centralized):
```javascript
export const SPACES = [...11 space names...]
export const TIME_SLOTS = [...30 time slots from 07:00-21:30...]
export const DEPARTMENTS = ['교역자', '비전브릿지', 'CAM', '프뉴마', '가스펠', '카리스', '기타']
export const DEPARTMENT_COLORS = { /* department -> hex color mapping */ }

// Utility functions
export const formatDate = (dateString) => { /* YYYY-MM-DD → YYYY년 MM월 DD일 */ }
export const formatTimeRange = (startTime) => { /* 07:00 → 07:00 ~ 07:30 */ }
export const isAdmin = (user) => { /* Check admin role */ }
export const isReservationOwner = (reservation, user) => { /* Check ownership */ }
```

## Testing Notes

- No test framework configured
- Manual testing required
- Test with admin account: admin@test.com / Admin1234
- Check localStorage in browser DevTools for debugging

## Recent Improvements (November 2025)

Completed enhancements from `남은 작업 리스트.md`:
1. ✅ Admin user creation feature with dashboard
2. ✅ Reduced calendar size (max-width: 900px)
3. ✅ Department dropdown in SignUp and ReservationModal
4. ✅ Unified button sizes in modals
5. ✅ Time display as ranges (07:00 ~ 07:30)
6. ✅ Department-based color system for reservations
7. ✅ Edit/delete functionality for own reservations
8. ✅ Admin can edit/delete any reservation
9. ✅ My Reservations page (`/my-reservations`) with current and past bookings

## Navigation Structure

- **Calendar** (`/calendar`): Main entry point with date selection
  - Header buttons: "내 예약", "관리자" (admin only), "로그아웃"
- **Reservation** (`/reservation/:date`): Space/time table for selected date
  - Header buttons: "내 예약", "로그아웃"
  - Click available slot → create reservation
  - Click owned reservation → edit/delete modal
- **My Reservations** (`/my-reservations`): User's booking list
  - Current reservations (editable/deletable)
  - Past reservations (read-only)
  - Header buttons: "캘린더", "관리자" (admin only), "로그아웃"
- **Admin** (`/admin`): User management (admin only)
  - Create user accounts
  - View all users with status
  - Header buttons: "캘린더", "로그아웃"

## PRD Reference

Full requirements documented in `PRD.md` (Korean). Key sections:
- Section 5: Functional requirements with REQ-### identifiers
- Section 6: Non-functional requirements (performance, security, UX)
- Section 9: Data model specifications
- Section 15: Timeline estimates (9-week project)
