import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEPARTMENTS } from '../constants'
import './Admin.css'

function Admin() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    department: '',
    customDepartment: ''
  })
  const [editFormData, setEditFormData] = useState({
    userId: '',
    password: '',
    name: '',
    department: '',
    customDepartment: ''
  })
  const [errors, setErrors] = useState({})
  const [editErrors, setEditErrors] = useState({})

  useEffect(() => {
    // 관리자 권한 확인
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user || user.role !== 'admin') {
      alert('관리자만 접근 가능합니다.')
      navigate('/calendar')
      return
    }
    setCurrentUser(user)
    loadUsers()
  }, [navigate])

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(allUsers)
  }

  const validatePassword = (password) => {
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

    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // 유효성 검증
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

    if (!formData.name) {
      newErrors.name = '담당자명을 입력해주세요'
    }

    if (!formData.department) {
      newErrors.department = '소속/부서를 선택해주세요'
    }

    if (formData.department === '기타' && !formData.customDepartment.trim()) {
      newErrors.customDepartment = '소속명을 입력해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // 중복 확인
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
    if (allUsers.find(u => u.userId === formData.userId)) {
      setErrors({ userId: '이미 사용 중인 사용자 ID입니다' })
      return
    }

    // 최종 소속명 결정
    const finalDepartment = formData.department === '기타'
      ? formData.customDepartment.trim()
      : formData.department

    // 새 사용자 생성
    const newUser = {
      userId: formData.userId,
      password: formData.password,
      name: formData.name,
      department: finalDepartment,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    allUsers.push(newUser)
    localStorage.setItem('users', JSON.stringify(allUsers))

    // 폼 초기화 및 목록 갱신
    setFormData({ userId: '', password: '', name: '', department: '', customDepartment: '' })
    setShowCreateForm(false)
    setErrors({})
    loadUsers()
    alert('사용자가 성공적으로 생성되었습니다.')
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleBackToCalendar = () => {
    navigate('/calendar')
  }

  // 사용자 수정 모달 열기
  const handleEditUser = (user) => {
    setEditingUser(user)
    // 부서가 DEPARTMENTS에 있으면 그대로, 아니면 '기타'로 설정
    const isKnownDept = DEPARTMENTS.includes(user.department)
    setEditFormData({
      userId: user.userId,
      password: '',
      name: user.name,
      department: isKnownDept ? user.department : '기타',
      customDepartment: isKnownDept ? '' : user.department
    })
    setEditErrors({})
    setShowEditModal(true)
  }

  // 수정 폼 입력 핸들러
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'department' && value !== '기타') {
      setEditFormData(prev => ({
        ...prev,
        customDepartment: ''
      }))
    }

    setEditErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  // 사용자 수정 제출
  const handleEditSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}

    if (!editFormData.name) {
      newErrors.name = '담당자명을 입력해주세요'
    }

    if (!editFormData.department) {
      newErrors.department = '소속/부서를 선택해주세요'
    }

    if (editFormData.department === '기타' && !editFormData.customDepartment.trim()) {
      newErrors.customDepartment = '소속명을 입력해주세요'
    }

    // 비밀번호가 입력된 경우에만 검증
    if (editFormData.password && !validatePassword(editFormData.password)) {
      newErrors.password = '비밀번호는 최소 8자 이상, 영문과 숫자를 포함해야 합니다'
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors)
      return
    }

    const finalDepartment = editFormData.department === '기타'
      ? editFormData.customDepartment.trim()
      : editFormData.department

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const userIndex = allUsers.findIndex(u => u.userId === editingUser.userId)

    if (userIndex !== -1) {
      allUsers[userIndex] = {
        ...allUsers[userIndex],
        name: editFormData.name,
        department: finalDepartment,
        ...(editFormData.password && { password: editFormData.password })
      }
      localStorage.setItem('users', JSON.stringify(allUsers))
    }

    setShowEditModal(false)
    setEditingUser(null)
    setEditFormData({ userId: '', password: '', name: '', department: '', customDepartment: '' })
    loadUsers()
    alert('사용자 정보가 수정되었습니다.')
  }

  // 사용자 삭제
  const handleDeleteUser = (user) => {
    if (user.role === 'admin') {
      alert('관리자 계정은 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm(`'${user.name}' 사용자를 삭제하시겠습니까?`)) {
      return
    }

    const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const filteredUsers = allUsers.filter(u => u.userId !== user.userId)
    localStorage.setItem('users', JSON.stringify(filteredUsers))
    loadUsers()
    alert('사용자가 삭제되었습니다.')
  }

  // 만료일 계산 함수
  const getExpirationDate = (createdAt) => {
    const created = new Date(createdAt)
    const expiration = new Date(created)
    expiration.setFullYear(expiration.getFullYear() + 1)
    return expiration
  }

  // 만료 여부 확인
  const isExpired = (user) => {
    if (user.role === 'admin') return false
    const expirationDate = getExpirationDate(user.createdAt)
    return new Date() > expirationDate
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1>관리자 대시보드</h1>
          <div className="user-info">
            <span>{currentUser.name}님 (관리자)</span>
            <button onClick={handleBackToCalendar} className="calendar-button">
              캘린더
            </button>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-card">
          <div className="card-header">
            <h2>사용자 관리</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="create-button"
            >
              {showCreateForm ? '취소' : '+ 사용자 생성'}
            </button>
          </div>

          {showCreateForm && (
            <div className="create-form-container">
              <h3>새 사용자 생성</h3>
              <form onSubmit={handleSubmit} className="create-form">
                <div className="form-row">
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
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>
                </div>

                <div className="form-row">
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
                    >
                      <option value="">선택하세요</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <span className="error-message">{errors.department}</span>}
                  </div>
                </div>

                {formData.department === '기타' && (
                  <div className="form-row">
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
                      />
                      {errors.customDepartment && <span className="error-message">{errors.customDepartment}</span>}
                    </div>
                  </div>
                )}

                <button type="submit" className="submit-button">
                  사용자 생성
                </button>
              </form>
            </div>
          )}

          <div className="users-list">
            <h3>등록된 사용자 목록 ({users.length}명)</h3>
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>사용자 ID</th>
                    <th>담당자명</th>
                    <th>소속</th>
                    <th>권한</th>
                    <th>가입일</th>
                    <th>만료일</th>
                    <th>상태</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const expirationDate = getExpirationDate(user.createdAt)
                    const expired = isExpired(user)

                    return (
                      <tr key={user.userId}>
                        <td>{user.userId}</td>
                        <td>{user.name}</td>
                        <td>{user.department}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? '관리자' : '일반'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          {user.role === 'admin'
                            ? '-'
                            : expirationDate.toLocaleDateString()}
                        </td>
                        <td>
                          {user.role === 'admin' ? (
                            <span className="status-badge active">-</span>
                          ) : (
                            <span className={`status-badge ${expired ? 'expired' : 'active'}`}>
                              {expired ? '만료됨' : '활성'}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="edit-button"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="delete-button"
                              disabled={user.role === 'admin'}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>사용자 정보 수정</h3>
              <button className="close-button" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="editUserId">사용자 ID</label>
                <input
                  type="text"
                  id="editUserId"
                  value={editFormData.userId}
                  readOnly
                  disabled
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="editPassword">비밀번호</label>
                <input
                  type="password"
                  id="editPassword"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditChange}
                  placeholder="변경 시에만 입력 (최소 8자, 영문+숫자)"
                  className={editErrors.password ? 'error' : ''}
                />
                {editErrors.password && <span className="error-message">{editErrors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="editName">담당자명 *</label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="홍길동"
                  className={editErrors.name ? 'error' : ''}
                />
                {editErrors.name && <span className="error-message">{editErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="editDepartment">소속/부서 *</label>
                <select
                  id="editDepartment"
                  name="department"
                  value={editFormData.department}
                  onChange={handleEditChange}
                  className={editErrors.department ? 'error' : ''}
                >
                  <option value="">선택하세요</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {editErrors.department && <span className="error-message">{editErrors.department}</span>}
              </div>

              {editFormData.department === '기타' && (
                <div className="form-group">
                  <label htmlFor="editCustomDepartment">소속명 입력 *</label>
                  <input
                    type="text"
                    id="editCustomDepartment"
                    name="customDepartment"
                    value={editFormData.customDepartment}
                    onChange={handleEditChange}
                    placeholder="소속명을 입력하세요"
                    className={editErrors.customDepartment ? 'error' : ''}
                  />
                  {editErrors.customDepartment && <span className="error-message">{editErrors.customDepartment}</span>}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-button">
                  취소
                </button>
                <button type="submit" className="submit-button">
                  수정하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
