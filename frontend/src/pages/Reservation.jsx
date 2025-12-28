import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SPACES, TIME_SLOTS, DEPARTMENTS, DEPARTMENT_COLORS, formatDate, formatTimeRange, isDateBookableForDepartment, getContrastTextColors, darkenColor, isWithinBookingWindow } from '../constants'
import { reservationService } from '../services/reservationService'
import { reservationsToSlots, normalizeTime } from '../utils/reservationUtils'
import ReservationModal from '../components/ReservationModal'
import './Reservation.css'

function Reservation() {
  const navigate = useNavigate()
  const { date } = useParams()
  const [currentUser, setCurrentUser] = useState(null)
  const [reservations, setReservations] = useState({})
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 로그인 확인
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/login')
      return
    }

    const [year, month, day] = date.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day)

    // 3개월 이내 체크 (모든 사용자에게 적용)
    if (!isWithinBookingWindow(targetDate)) {
      navigate('/calendar')
      return
    }

    // 관리자가 아닌 경우에만 날짜 검증
    if (user.role !== 'admin') {
      // Validate date is bookable for user's department
      if (!isDateBookableForDepartment(targetDate, user.department)) {
        navigate('/calendar')
        return
      }
    }

    setCurrentUser(user)

    // 예약 데이터 로드
    loadReservations()
  }, [navigate, date])

  const loadReservations = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await reservationService.getByDate(date)

      if (error) {
        console.error('Failed to load reservations:', error)
        setReservations({})
      } else {
        // DB 예약 데이터를 슬롯 형식으로 변환
        const slots = reservationsToSlots(data)
        setReservations(slots)
      }
    } catch (err) {
      console.error('Load reservations error:', err)
      setReservations({})
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

  const handleMyReservationsClick = () => {
    navigate('/my-reservations')
  }

  const handleAdminClick = () => {
    navigate('/admin')
  }

  const findReservationStart = (space, time, reservation) => {
    // If already the start, return it
    if (reservation.isStart) {
      return { space, time, reservation }
    }

    // Search backward to find the start
    const currentIndex = TIME_SLOTS.indexOf(time)

    for (let i = currentIndex - 1; i >= 0; i--) {
      const checkTime = TIME_SLOTS[i]
      const key = `${space}-${checkTime}`
      const checkReservation = reservations[key]

      // Check if same reservation (match by id)
      if (checkReservation && checkReservation.id === reservation.id) {
        if (checkReservation.isStart) {
          return { space, time: checkTime, reservation: checkReservation }
        }
      } else {
        // Different reservation or empty - stop searching
        break
      }
    }

    // Fallback (shouldn't happen)
    return { space, time, reservation }
  }

  const handleSlotClick = (space, time) => {
    const key = `${space}-${time}`
    const reservation = reservations[key]

    if (reservation) {
      // 이미 예약된 슬롯 - 수정 권한 확인
      const canEdit = currentUser.role === 'admin' || reservation.oderId === currentUser.id

      if (canEdit) {
        // Find the start of this reservation
        const { space: startSpace, time: startTime, reservation: startReservation } =
          findReservationStart(space, time, reservation)

        // Open modal with start reservation data
        setEditingReservation(startReservation)
        setSelectedSlot({ space: startSpace, time: startTime })
        setIsEditMode(true)
        setShowModal(true)
      }
      return
    }

    // 새 예약
    setIsEditMode(false)
    setEditingReservation(null)
    setSelectedSlot({ space, time })
    setShowModal(true)
  }

  const handleReservationSubmit = async (reservationData) => {
    if (isEditMode) {
      await handleUpdateReservation(reservationData)
    } else {
      await handleCreateReservation(reservationData)
    }
  }

  const handleCreateReservation = async (reservationData) => {
    try {
      const { data, error } = await reservationService.create({
        user_id: currentUser.id,
        date: date,
        space: selectedSlot.space,
        start_time: reservationData.startTime,
        end_time: reservationData.endTime,
        purpose: reservationData.purpose,
        name: reservationData.name,
        department: reservationData.department
      })

      if (error) {
        alert(error.message)
        return
      }

      // 화면 갱신
      await loadReservations()
      setShowModal(false)
      setSelectedSlot(null)
    } catch (err) {
      console.error('Create reservation error:', err)
      alert('예약 생성 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateReservation = async (reservationData) => {
    try {
      const { data, error } = await reservationService.update(editingReservation.id, {
        date: date,
        space: selectedSlot.space,
        start_time: reservationData.startTime,
        end_time: reservationData.endTime,
        purpose: reservationData.purpose,
        name: reservationData.name,
        department: reservationData.department
      })

      if (error) {
        alert(error.message)
        return
      }

      // 화면 갱신
      await loadReservations()
      setShowModal(false)
      setSelectedSlot(null)
      setIsEditMode(false)
      setEditingReservation(null)
    } catch (err) {
      console.error('Update reservation error:', err)
      alert('예약 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteReservation = async () => {
    if (!window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { error } = await reservationService.delete(editingReservation.id)

      if (error) {
        alert('예약 삭제 중 오류가 발생했습니다.')
        return
      }

      // 화면 갱신
      await loadReservations()
      setShowModal(false)
      setSelectedSlot(null)
      setIsEditMode(false)
      setEditingReservation(null)
    } catch (err) {
      console.error('Delete reservation error:', err)
      alert('예약 삭제 중 오류가 발생했습니다.')
    }
  }

  const isSlotReserved = (space, time) => {
    const key = `${space}-${time}`
    return !!reservations[key]
  }

  const getReservationInfo = (space, time) => {
    const key = `${space}-${time}`
    return reservations[key]
  }


  if (!currentUser) {
    return null
  }

  return (
    <div className="reservation-container">
      <header className="reservation-header">
        <div className="header-content">
          <h1>장소 예약</h1>
          <div className="user-info">
            <span>{currentUser.name}님</span>
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
        <div className="reservation-legend">
          <div className="legend-item">
            <span className="legend-box available"></span>
            <span>예약 가능</span>
          </div>
          {DEPARTMENTS.map(dept => (
            <div key={dept} className="legend-item">
              <span
                className="legend-box"
                style={{ backgroundColor: DEPARTMENT_COLORS[dept] }}
              ></span>
              <span>{dept}</span>
            </div>
          ))}
        </div>
      </header>

      <main className="reservation-main">
        <div className="reservation-card">
          <div className="reservation-header-section">
            <button onClick={handleBackToCalendar} className="back-button">
              ← 캘린더로 돌아가기
            </button>
            <h2 className="date-title">{formatDate(date)}</h2>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <p>예약 정보를 불러오는 중...</p>
            </div>
          ) : (
            <>
            <p className="scroll-hint">← 좌우로 스크롤하여 모든 장소를 확인하세요 →</p>
            <div className="table-container">
              <table className="reservation-table">
                <thead>
                  <tr>
                    <th className="time-header">시간 / 장소</th>
                    {SPACES.map(space => (
                      <th key={space}>
                        {space.startsWith('Vision Factory')
                          ? <>Vision<br/>Factory {space.split(' ')[2]}</>
                          : space}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(time => (
                    <tr key={time}>
                      <td className="time-cell">{formatTimeRange(time)}</td>
                      {SPACES.map(space => {
                        const isReserved = isSlotReserved(space, time)
                        const reservationInfo = getReservationInfo(space, time)

                        // 연속 예약 블록의 시작/끝 여부 확인
                        const currentTimeIndex = TIME_SLOTS.indexOf(time)
                        const nextTime = TIME_SLOTS[currentTimeIndex + 1]
                        const isFirst = reservationInfo?.isStart
                        const isLast = reservationInfo && nextTime === reservationInfo.endTime

                        // 테두리 스타일 계산 (외곽에만 테두리)
                        const getBorderStyle = () => {
                          if (!isReserved || !reservationInfo) return {}
                          const borderColor = darkenColor(DEPARTMENT_COLORS[reservationInfo.department] || '#B19CD9', 30)
                          return {
                            backgroundColor: DEPARTMENT_COLORS[reservationInfo.department] || '#B19CD9',
                            borderLeft: `2px solid ${borderColor}`,
                            borderRight: `2px solid ${borderColor}`,
                            borderTop: isFirst ? `2px solid ${borderColor}` : 'none',
                            borderBottom: isLast ? `2px solid ${borderColor}` : 'none'
                          }
                        }

                        return (
                          <td
                            key={`${space}-${time}`}
                            className={`slot-cell ${isReserved ? 'reserved' : 'available'} ${
                              isReserved && reservationInfo && (currentUser.role === 'admin' || reservationInfo.oderId === currentUser.id) ? 'editable' : ''
                            }`}
                            style={getBorderStyle()}
                            onClick={() => handleSlotClick(space, time)}
                          >
                            {isReserved && reservationInfo && (() => {
                              const bgColor = DEPARTMENT_COLORS[reservationInfo.department] || '#B19CD9'
                              const textColors = getContrastTextColors(bgColor)

                              return (
                                <div className="reservation-info">
                                  {reservationInfo.isStart && (
                                    <>
                                      <div
                                        className="reservation-name"
                                        style={{ color: textColors.primary }}
                                      >
                                        {reservationInfo.name}
                                      </div>
                                      <div
                                        className="reservation-purpose"
                                        style={{ color: textColors.secondary }}
                                      >
                                        {reservationInfo.purpose}
                                      </div>
                                      <div
                                        className="reservation-time"
                                        style={{ color: textColors.tertiary }}
                                      >
                                        {reservationInfo.startTime} - {reservationInfo.endTime}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )
                            })()}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </main>

      {showModal && (
        <ReservationModal
          space={selectedSlot.space}
          date={date}
          time={selectedSlot.time}
          currentUser={currentUser}
          isEditMode={isEditMode}
          editingReservation={editingReservation}
          onClose={() => {
            setShowModal(false)
            setSelectedSlot(null)
            setIsEditMode(false)
            setEditingReservation(null)
          }}
          onSubmit={handleReservationSubmit}
          onDelete={handleDeleteReservation}
        />
      )}
    </div>
  )
}

export default Reservation
