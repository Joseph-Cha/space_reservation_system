import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SPACES, TIME_SLOTS, DEPARTMENTS, DEPARTMENT_COLORS, formatDate, formatTimeRange, isDateBookableForDepartment, getContrastTextColors, darkenColor } from '../constants'
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

  useEffect(() => {
    // 로그인 확인
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (!user) {
      navigate('/login')
      return
    }

    // 관리자가 아닌 경우에만 날짜 검증
    if (user.role !== 'admin') {
      // Validate date is bookable for user's department
      const [year, month, day] = date.split('-').map(Number)
      const targetDate = new Date(year, month - 1, day)

      if (!isDateBookableForDepartment(targetDate, user.department)) {
        navigate('/calendar')
        return
      }
    }

    setCurrentUser(user)

    // 예약 데이터 로드
    loadReservations()
  }, [navigate, date])

  const loadReservations = () => {
    const allReservations = JSON.parse(localStorage.getItem('reservations') || '{}')
    const dateReservations = allReservations[date] || {}
    setReservations(dateReservations)
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

      // Check if same reservation (match by userId, purpose, and startTime)
      if (checkReservation &&
          checkReservation.userId === reservation.userId &&
          checkReservation.purpose === reservation.purpose &&
          checkReservation.startTime === reservation.startTime) {

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
      const canEdit = currentUser.role === 'admin' || reservation.userId === currentUser.userId

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

  const handleReservationSubmit = (reservationData) => {
    if (isEditMode) {
      handleUpdateReservation(reservationData)
    } else {
      handleCreateReservation(reservationData)
    }
  }

  const handleCreateReservation = (reservationData) => {
    const allReservations = JSON.parse(localStorage.getItem('reservations') || '{}')
    if (!allReservations[date]) {
      allReservations[date] = {}
    }

    // 시작 시간부터 종료 시간까지 모든 슬롯 예약
    const startIndex = TIME_SLOTS.indexOf(selectedSlot.time)
    const endIndex = TIME_SLOTS.indexOf(reservationData.endTime)

    // 중복 예약 검사
    const conflictingSlots = []
    for (let i = startIndex; i < endIndex; i++) {
      const slotKey = `${selectedSlot.space}-${TIME_SLOTS[i]}`
      if (allReservations[date][slotKey]) {
        conflictingSlots.push(TIME_SLOTS[i])
      }
    }

    if (conflictingSlots.length > 0) {
      const conflictTimes = conflictingSlots.join(', ')
      alert(`선택한 시간대에 이미 예약이 있습니다.\n중복 시간: ${conflictTimes}`)
      return
    }

    for (let i = startIndex; i < endIndex; i++) {
      const slotKey = `${selectedSlot.space}-${TIME_SLOTS[i]}`
      allReservations[date][slotKey] = {
        ...reservationData,
        userId: currentUser.userId,
        space: selectedSlot.space,
        time: TIME_SLOTS[i],
        isStart: i === startIndex
      }
    }

    localStorage.setItem('reservations', JSON.stringify(allReservations))

    // 화면 갱신
    loadReservations()
    setShowModal(false)
    setSelectedSlot(null)
  }

  const handleUpdateReservation = (reservationData) => {
    const allReservations = JSON.parse(localStorage.getItem('reservations') || '{}')

    // 기존 예약의 슬롯 키들 수집 (충돌 검사에서 제외)
    const oldSlotKeys = new Set()
    const oldStartIndex = TIME_SLOTS.indexOf(editingReservation.startTime)
    const oldEndIndex = TIME_SLOTS.indexOf(editingReservation.endTime)
    for (let i = oldStartIndex; i < oldEndIndex; i++) {
      oldSlotKeys.add(`${selectedSlot.space}-${TIME_SLOTS[i]}`)
    }

    // 새 예약 범위 계산
    const newStartIndex = TIME_SLOTS.indexOf(reservationData.startTime)
    const newEndIndex = TIME_SLOTS.indexOf(reservationData.endTime)

    // 중복 예약 검사 (기존 예약 슬롯 제외)
    const conflictingSlots = []
    for (let i = newStartIndex; i < newEndIndex; i++) {
      const slotKey = `${selectedSlot.space}-${TIME_SLOTS[i]}`
      // 기존 예약의 슬롯이 아닌 곳에 이미 예약이 있으면 충돌
      if (!oldSlotKeys.has(slotKey) && allReservations[date][slotKey]) {
        conflictingSlots.push(TIME_SLOTS[i])
      }
    }

    if (conflictingSlots.length > 0) {
      const conflictTimes = conflictingSlots.join(', ')
      alert(`선택한 시간대에 이미 예약이 있습니다.\n중복 시간: ${conflictTimes}`)
      return
    }

    // 기존 예약 삭제
    for (let i = oldStartIndex; i < oldEndIndex; i++) {
      const slotKey = `${selectedSlot.space}-${TIME_SLOTS[i]}`
      delete allReservations[date][slotKey]
    }

    // 새 예약 추가
    for (let i = newStartIndex; i < newEndIndex; i++) {
      const slotKey = `${selectedSlot.space}-${TIME_SLOTS[i]}`
      allReservations[date][slotKey] = {
        ...reservationData,
        userId: editingReservation.userId,
        space: selectedSlot.space,
        time: TIME_SLOTS[i],
        isStart: i === newStartIndex
      }
    }

    localStorage.setItem('reservations', JSON.stringify(allReservations))

    // 화면 갱신
    loadReservations()
    setShowModal(false)
    setSelectedSlot(null)
    setIsEditMode(false)
    setEditingReservation(null)
  }

  const handleDeleteReservation = () => {
    if (!window.confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      return
    }

    const allReservations = JSON.parse(localStorage.getItem('reservations') || '{}')

    // 예약 슬롯 삭제
    const startIndex = TIME_SLOTS.indexOf(editingReservation.startTime)
    const endIndex = TIME_SLOTS.indexOf(editingReservation.endTime)
    for (let i = startIndex; i < endIndex; i++) {
      const slotKey = `${selectedSlot.space}-${TIME_SLOTS[i]}`
      delete allReservations[date][slotKey]
    }

    localStorage.setItem('reservations', JSON.stringify(allReservations))

    // 화면 갱신
    loadReservations()
    setShowModal(false)
    setSelectedSlot(null)
    setIsEditMode(false)
    setEditingReservation(null)
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
                            isReserved && reservationInfo && (currentUser.role === 'admin' || reservationInfo.userId === currentUser.userId) ? 'editable' : ''
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
