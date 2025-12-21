import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// 초기 관리자 계정 생성
const initializeAdminAccount = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')

  // 관리자 계정이 없으면 생성
  const adminExists = users.find(u => u.userId === 'admin')

  if (!adminExists) {
    users.push({
      userId: 'admin',
      password: 'Admin1234',
      name: '관리자',
      department: '관리팀',
      role: 'admin',
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('users', JSON.stringify(users))
    console.log('✅ 관리자 계정이 생성되었습니다.')
    console.log('사용자 ID: admin')
    console.log('비밀번호: Admin1234')
  }
}

// 앱 시작 시 관리자 계정 초기화
initializeAdminAccount()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
