# Task Completion Checklist

## Before Committing
1. **Build Check**: Run `cd frontend && npm run build` - must succeed
2. **Lint Check**: Run `npm run lint` - fix any errors
3. **Manual Test**: Test affected functionality in browser

## Git Commit Format
```
<type>: <subject in Korean>

<optional body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Commit Types
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `style`: UI/스타일 변경 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `docs`: 문서 수정
- `chore`: 기타 변경사항 (빌드 설정 등)

## Example Commit
```bash
git add -A && git commit -m "$(cat <<'EOF'
feat: 도움말 모달 추가

- 예약 시스템 이용 안내
- 소속별 예약 오픈 일정 표시

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Deployment
- Netlify auto-deploys from master branch
- Config in `netlify.toml`
