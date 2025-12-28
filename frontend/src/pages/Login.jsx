import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userService } from '../services/userService'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.userId) {
      setError('사용자 ID를 입력해주세요')
      return
    }

    if (!formData.password) {
      setError('비밀번호를 입력해주세요')
      return
    }

    setIsLoading(true)

    try {
      // Supabase에서 사용자 확인
      const { data: user, error: loginError } = await userService.login(
        formData.userId,
        formData.password
      )

      if (loginError) {
        setError(loginError.message)
        setIsLoading(false)
        return
      }

      // 유효기간 검사 (관리자 제외)
      if (user.role !== 'admin') {
        const createdAt = new Date(user.created_at)
        const expirationDate = new Date(createdAt)
        expirationDate.setFullYear(expirationDate.getFullYear() + 1)

        const now = new Date()

        if (now > expirationDate) {
          const expiredDateStr = expirationDate.toLocaleDateString('ko-KR')
          setError(`계정 유효기간이 만료되었습니다. (만료일: ${expiredDateStr}) 관리자에게 문의하세요.`)
          setIsLoading(false)
          return
        }
      }

      // 로그인 성공 - 세션 저장 (localStorage에 currentUser 저장)
      // DB의 컬럼명을 프론트엔드 형식으로 변환
      const sessionUser = {
        id: user.id,
        oderId: user.user_id,
        name: user.name,
        department: user.department,
        role: user.role,
        createdAt: user.created_at
      }
      localStorage.setItem('currentUser', JSON.stringify(sessionUser))
      navigate('/calendar')
    } catch (err) {
      console.error('Login error:', err)
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>로그인</h1>
        <p className="login-subtitle">장소 예약 시스템</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="userId">사용자 ID</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="사용자 ID를 입력하세요"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
