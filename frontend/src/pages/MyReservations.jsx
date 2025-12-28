import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEPARTMENT_COLORS, formatDate } from '../constants'
import { reservationService } from '../services/reservationService'
import { normalizeTime } from '../utils/reservationUtils'
import './MyReservations.css'

function MyReservations() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [myReservations, setMyReservations] = useState([])
  const [pastReservations, setPastReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  const loadMyReservations = async (user) => {
    setIsLoading(true)
    try {
      let data, error

      // 관리자는 모든 예약, 일반 사용자는 본인 예약만
      if (user.role === 'admin') {
        const result = await reservationService.getAll()
        data = result.data
        error = result.error
      } else {
        const result = await reservationService.getByUserId(user.id)
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('Failed to load reservations:', error)
        setMyReservations([])
        setPastReservations([])
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const current = []
      const past = []

      data.forEach(reservation => {
        const dateObj = new Date(reservation.date)
        const formattedReservation = {
          id: reservation.id,
          date: reservation.date,
          space: reservation.space,
          startTime: normalizeTime(reservation.start_time),
          endTime: normalizeTime(reservation.end_time),
          purpose: reservation.purpose,
          name: reservation.name,
          department: reservation.department,
          oderId: reservation.user_id
        }

        if (dateObj >= today) {
          current.push(formattedReservation)
        } else {
          past.push(formattedReservation)
        }
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
    } catch (err) {
      console.error('Load reservations error:', err)
      setMyReservations([])
      setPastReservations([])
    } finally {
      setIsLoading(false)
    }
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

  const handleDelete = async (reservation) => {
    if (!window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await reservationService.delete(reservation.id)

      if (error) {
        alert('예약 삭제 중 오류가 발생했습니다.')
        return
      }

      await loadMyReservations(currentUser)
    } catch (err) {
      console.error('Delete reservation error:', err)
      alert('예약 삭제 중 오류가 발생했습니다.')
    }
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
          {isLoading ? (
            <div className="loading-container">
              <p>예약 정보를 불러오는 중...</p>
            </div>
          ) : (
            <>
              <section className="reservations-section">
                <h2>현재 예약 ({myReservations.length}개)</h2>
                {myReservations.length === 0 ? (
                  <p className="empty-message">예약 내역이 없습니다.</p>
                ) : (
                  <div className="reservations-list">
                    {myReservations.map((reservation) => (
                      <div
                        key={reservation.id}
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
                    {pastReservations.map((reservation) => (
                      <div
                        key={reservation.id}
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default MyReservations
