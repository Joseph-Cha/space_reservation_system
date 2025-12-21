import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isDateBookableForDepartment, getBookingWindowInfo } from '../constants'
import HelpModal from '../components/HelpModal'
import './Calendar.css'

function Calendar() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentUser, setCurrentUser] = useState(null)
  const [showHelpModal, setShowHelpModal] = useState(false)

  useEffect(() => {
    // 로그인 확인
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/login')
      return
    }
    setCurrentUser(user)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleAdminClick = () => {
    navigate('/admin')
  }

  const handleMyReservationsClick = () => {
    navigate('/my-reservations')
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const days = []
  // 빈 셀 추가 (월의 첫날 이전)
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  // 날짜 추가
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const handleDateClick = (day) => {
    if (!day) return

    const selectedDate = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 관리자가 아닌 경우에만 예약 가능 날짜 확인
    if (currentUser.role !== 'admin') {
      if (!isDateBookableForDepartment(selectedDate, currentUser.department)) {
        return // Date is disabled, do nothing
      }
    } else {
      // 관리자는 과거 날짜만 제한
      if (selectedDate < today) {
        return
      }
    }

    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    navigate(`/reservation/${dateString}`)
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isUnavailable = (day) => {
    if (!day) return false

    // 관리자는 과거 날짜만 비활성화
    if (currentUser.role === 'admin') {
      const selectedDate = new Date(year, month, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate < today
    }

    // 일반 사용자는 부서별 예약 가능 날짜 확인
    const selectedDate = new Date(year, month, day)
    return !isDateBookableForDepartment(selectedDate, currentUser.department)
  }

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  if (!currentUser) {
    return null
  }

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <div className="header-content">
          <div className="header-title">
            <h1>장소 예약 시스템</h1>
            <button onClick={() => setShowHelpModal(true)} className="help-button">
              ?
            </button>
          </div>
          <div className="user-info">
            <span>{currentUser.name}님 환영합니다</span>
            <button onClick={handleMyReservationsClick} className="my-reservations-button">
              내 예약
            </button>
            {currentUser.role === 'admin' && (
              <button onClick={handleAdminClick} className="admin-button">
                관리자
              </button>
            )}
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="calendar-main">
        <div className="calendar-card">
          <div className="calendar-controls">
            <button onClick={handlePrevMonth} className="nav-button">
              ← 이전
            </button>
            <h2 className="calendar-title">
              {year}년 {monthNames[month]}
            </h2>
            <button onClick={handleNextMonth} className="nav-button">
              다음 →
            </button>
          </div>

          <div className="calendar-grid">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}

            {days.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${
                  isUnavailable(day) ? 'unavailable' : ''
                }`}
                onClick={() => handleDateClick(day)}
              >
                {day && <span className="day-number">{day}</span>}
              </div>
            ))}
          </div>

          <div className="calendar-info">
            <p>예약을 원하시는 날짜를 선택해주세요</p>
            <p className="info-note">
              * {currentUser.role === 'admin'
                  ? '관리자는 모든 날짜에 예약이 가능합니다'
                  : getBookingWindowInfo(currentUser.department)}
            </p>
          </div>
        </div>
      </main>

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  )
}

export default Calendar
