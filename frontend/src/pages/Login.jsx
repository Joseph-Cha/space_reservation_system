import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.userId) {
      setError('사용자 ID를 입력해주세요')
      return
    }

    if (!formData.password) {
      setError('비밀번호를 입력해주세요')
      return
    }

    // 사용자 확인
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.userId === formData.userId)

    if (!user) {
      setError('등록되지 않은 사용자 ID입니다')
      return
    }

    if (user.password !== formData.password) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    // 유효기간 검사 (관리자 제외)
    if (user.role !== 'admin') {
      const createdAt = new Date(user.createdAt)
      const expirationDate = new Date(createdAt)
      expirationDate.setFullYear(expirationDate.getFullYear() + 1)

      const now = new Date()

      if (now > expirationDate) {
        const expiredDateStr = expirationDate.toLocaleDateString('ko-KR')
        setError(`계정 유효기간이 만료되었습니다. (만료일: ${expiredDateStr}) 관리자에게 문의하세요.`)
        return
      }
    }

    // 로그인 성공
    localStorage.setItem('currentUser', JSON.stringify(user))
    navigate('/calendar')
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
            />
          </div>

          <button type="submit" className="submit-button">
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
