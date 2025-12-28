import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { DEPARTMENTS } from '../constants'
import { userService } from '../services/userService'
import './SignUp.css'

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    department: '',
    customDepartment: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password) => {
    // 최소 8자, 영문+숫자 조합
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    return re.test(password)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // "기타" 소속이 아닌 경우 customDepartment 초기화
    if (name === 'department' && value !== '기타') {
      setFormData(prev => ({
        ...prev,
        customDepartment: ''
      }))
    }

    // 실시간 유효성 검증
    const newErrors = { ...errors }

    if (name === 'userId') {
      if (value && value.length < 3) {
        newErrors.userId = '사용자 ID는 최소 3자 이상이어야 합니다'
      } else {
        delete newErrors.userId
      }
    }

    if (name === 'password') {
      if (value && !validatePassword(value)) {
        newErrors.password = '비밀번호는 최소 8자 이상, 영문과 숫자를 포함해야 합니다'
      } else {
        delete newErrors.password
      }

      if (formData.passwordConfirm && value !== formData.passwordConfirm) {
        newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
      } else {
        delete newErrors.passwordConfirm
      }
    }

    if (name === 'passwordConfirm') {
      if (value && value !== formData.password) {
        newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
      } else {
        delete newErrors.passwordConfirm
      }
    }

    setErrors(newErrors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 최종 유효성 검증
    const newErrors = {}

    if (!formData.userId) {
      newErrors.userId = '사용자 ID를 입력해주세요'
    } else if (formData.userId.length < 3) {
      newErrors.userId = '사용자 ID는 최소 3자 이상이어야 합니다'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = '비밀번호는 최소 8자 이상, 영문과 숫자를 포함해야 합니다'
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요'
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    }

    if (!formData.name) {
      newErrors.name = '담당자명을 입력해주세요'
    }

    if (!formData.department) {
      newErrors.department = '소속/부서를 입력해주세요'
    }

    if (formData.department === '기타' && !formData.customDepartment.trim()) {
      newErrors.customDepartment = '소속명을 입력해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      // 최종 소속명 결정
      const finalDepartment = formData.department === '기타'
        ? formData.customDepartment.trim()
        : formData.department

      // Supabase에 사용자 등록
      const { data, error } = await userService.signUp({
        userId: formData.userId,
        password: formData.password,
        name: formData.name,
        department: finalDepartment
      })

      if (error) {
        setErrors({ userId: error.message })
        setIsLoading(false)
        return
      }

      alert('회원가입이 완료되었습니다. 로그인해주세요.')
      navigate('/login')
    } catch (err) {
      console.error('SignUp error:', err)
      setErrors({ userId: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' })
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>회원가입</h1>
        <p className="signup-subtitle">장소 예약 시스템</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="userId">사용자 ID *</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="사용자 ID (최소 3자)"
              className={errors.userId ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.userId && <span className="error-message">{errors.userId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="최소 8자 이상, 영문+숫자"
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인 *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력해주세요"
              className={errors.passwordConfirm ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.passwordConfirm && <span className="error-message">{errors.passwordConfirm}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">담당자명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              className={errors.name ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department">소속/부서 *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="">선택하세요</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <span className="error-message">{errors.department}</span>}
          </div>

          {formData.department === '기타' && (
            <div className="form-group">
              <label htmlFor="customDepartment">소속명 입력 *</label>
              <input
                type="text"
                id="customDepartment"
                name="customDepartment"
                value={formData.customDepartment}
                onChange={handleChange}
                placeholder="소속명을 입력하세요"
                className={errors.customDepartment ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.customDepartment && <span className="error-message">{errors.customDepartment}</span>}
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="login-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp
