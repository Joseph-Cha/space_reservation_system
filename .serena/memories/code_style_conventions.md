# Code Style and Conventions

## File Naming
- React components: PascalCase (e.g., `ReservationModal.jsx`)
- CSS files: Match component name (e.g., `ReservationModal.css`)
- Utility files: camelCase (e.g., `constants.js`)

## Component Structure
- Page components in `src/pages/`
- Reusable components in `src/components/`
- Each component has matching .css file

## JavaScript/React Conventions
- ES6+ syntax (arrow functions, destructuring)
- React hooks for state management
- No TypeScript (plain JavaScript with .jsx extension)
- ESLint with React hooks plugin

## CSS Conventions
- Component-scoped CSS files
- Plain CSS (no preprocessors)
- Class naming: kebab-case

## Imports Order
1. React/external libraries
2. Components
3. Constants/utilities
4. CSS files

## Language
- UI text: Korean (한국어)
- Code/comments: English or Korean
- Commit messages: Korean with conventional commit type prefix

## Constants
All shared constants in `src/constants.js`:
- SPACES, TIME_SLOTS, DEPARTMENTS
- DEPARTMENT_COLORS
- Utility functions: formatDate, formatTimeRange, isAdmin, etc.
