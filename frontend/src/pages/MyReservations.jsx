import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEPARTMENT_COLORS, formatDate } from '../constants'
import './MyReservations.css'

function MyReservations() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [myReservations, setMyReservations] = useState([])
  const [pastReservations, setPastReservations] = useState([])

  useEffect(() => {
    // 로그인 확인
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/login')
      return
    }
    setCurrentUser(user)
    loadMyReservations(user)
  }, [navigate])

  const loadMyReservations = (user) => {
    const allReservations = JSON.parse(localStorage.getItem('reservations') || '{}')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const current = []
    const past = []

    // 모든 날짜의 예약을 검색
    Object.keys(allReservations).forEach(date => {
      const dateObj = new Date(date)
      const reservationsOnDate = allReservations[date]

      Object.keys(reservationsOnDate).forEach(key => {
        const reservation = reservationsOnDate[key]

        // 시작 슬롯만 수집 (중복 방지)
        // 관리자는 모든 예약, 일반 사용자는 본인 예약만
        const isRelevantReservation = user.role === 'admin' || reservation.userId === user.userId

        if (reservation.isStart && isRelevantReservation) {
          const reservationWithDate = {
            ...reservation,
            date,
            key
          }

          if (dateObj >= today) {
            current.push(reservationWithDate)
          } else {
            past.push(reservationWithDate)
          }
        }
      })
    })

    // 날짜순 정렬
    current.sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })

    past.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date)
      if (dateCompare !== 0) return dateCompare
      return b.startTime.localeCompare(a.startTime)
    })

    setMyReservations(current)
    setPastReservations(past)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  const handleBackToCalendar = () => {
    navigate('/calendar')
  }

  const handleEdit = (reservation) => {
    navigate(`/reservation/${reservation.date}`)
  }

  const handleDelete = (reservation) => {
    if (!window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return
    }

    const allReservations = JSON.parse(localStorage.getItem('reservations') || '{}')
    const dateReservations = allReservations[reservation.date]

    if (!dateReservations) return

    // 해당 예약의 모든 슬롯 찾아서 삭제
    Object.keys(dateReservations).forEach(key => {
      const res = dateReservations[key]
      if (res.startTime === reservation.startTime &&
          res.endTime === reservation.endTime &&
          res.space === reservation.space &&
          res.userId === reservation.userId) {
        delete dateReservations[key]
      }
    })

    localStorage.setItem('reservations', JSON.stringify(allReservations))
    loadMyReservations(currentUser)
  }

  const handleAdminClick = () => {
    navigate('/admin')
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="my-reservations-container">
      <header className="my-reservations-header">
        <div className="header-content">
          <h1>{currentUser.role === 'admin' ? '전체 예약 관리' : '내 예약 관리'}</h1>
          <div className="user-info">
            <span>{currentUser.name}님</span>
            {currentUser.role === 'admin' && (
              <button onClick={handleAdminClick} className="admin-button">
                관리자
              </button>
            )}
            <button onClick={handleBackToCalendar} className="calendar-button">
              캘린더
            </button>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="my-reservations-main">
        <div className="my-reservations-card">
          <section className="reservations-section">
            <h2>현재 예약 ({myReservations.length}개)</h2>
            {myReservations.length === 0 ? (
              <p className="empty-message">예약 내역이 없습니다.</p>
            ) : (
              <div className="reservations-list">
                {myReservations.map((reservation, index) => (
                  <div
                    key={index}
                    className="reservation-item"
                    style={{
                      borderLeftColor: DEPARTMENT_COLORS[reservation.department] || '#B19CD9'
                    }}
                  >
                    <div className="reservation-item-header">
                      <div className="reservation-date">{formatDate(reservation.date)}</div>
                      <div className="reservation-actions">
                        <button
                          onClick={() => handleEdit(reservation)}
                          className="edit-btn"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(reservation)}
                          className="delete-btn"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="reservation-item-body">
                      <div className="reservation-detail">
                        <span className="detail-label">장소:</span>
                        <span className="detail-value">{reservation.space}</span>
                      </div>
                      <div className="reservation-detail">
                        <span className="detail-label">시간:</span>
                        <span className="detail-value">
                          {reservation.startTime} - {reservation.endTime}
                        </span>
                      </div>
                      <div className="reservation-detail">
                        <span className="detail-label">목적:</span>
                        <span className="detail-value">{reservation.purpose}</span>
                      </div>
                      <div className="reservation-detail">
                        <span className="detail-label">소속:</span>
                        <span
                          className="detail-value department-badge"
                          style={{
                            backgroundColor: DEPARTMENT_COLORS[reservation.department] || '#B19CD9'
                          }}
                        >
                          {reservation.department}
                        </span>
                      </div>
                      {currentUser.role === 'admin' && (
                        <div className="reservation-detail">
                          <span className="detail-label">예약자:</span>
                          <span className="detail-value">{reservation.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="reservations-section past-section">
            <h2>지난 예약 ({pastReservations.length}개)</h2>
            {pastReservations.length === 0 ? (
              <p className="empty-message">지난 예약 내역이 없습니다.</p>
            ) : (
              <div className="reservations-list">
                {pastReservations.map((reservation, index) => (
                  <div
                    key={index}
                    className="reservation-item past-item"
                    style={{
                      borderLeftColor: DEPARTMENT_COLORS[reservation.department] || '#B19CD9'
                    }}
                  >
                    <div className="reservation-item-header">
                      <div className="reservation-date">{formatDate(reservation.date)}</div>
                    </div>
                    <div className="reservation-item-body">
                      <div className="reservation-detail">
                        <span className="detail-label">장소:</span>
                        <span className="detail-value">{reservation.space}</span>
                      </div>
                      <div className="reservation-detail">
                        <span className="detail-label">시간:</span>
                        <span className="detail-value">
                          {reservation.startTime} - {reservation.endTime}
                        </span>
                      </div>
                      <div className="reservation-detail">
                        <span className="detail-label">목적:</span>
                        <span className="detail-value">{reservation.purpose}</span>
                      </div>
                      <div className="reservation-detail">
                        <span className="detail-label">소속:</span>
                        <span
                          className="detail-value department-badge"
                          style={{
                            backgroundColor: DEPARTMENT_COLORS[reservation.department] || '#B19CD9'
                          }}
                        >
                          {reservation.department}
                        </span>
                      </div>
                      {currentUser.role === 'admin' && (
                        <div className="reservation-detail">
                          <span className="detail-label">예약자:</span>
                          <span className="detail-value">{reservation.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MyReservations
