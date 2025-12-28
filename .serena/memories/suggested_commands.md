# Suggested Commands

## Development Commands
All commands should be run from the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Git Commands
```bash
# Check status
git status

# Stage all changes
git add -A

# Commit with message (Korean commit messages preferred)
git commit -m "feat: 기능 설명"

# Push to remote
git push
```

## Utility Commands (Darwin/macOS)
```bash
# List files
ls -la

# Find files
find . -name "*.jsx"

# Search in files
grep -r "pattern" --include="*.jsx"
```

## Testing
- No test framework configured yet
- Manual testing required
- Test with admin account: admin@test.com / Admin1234
- Use browser DevTools > Application > localStorage for debugging
