import { TIME_SLOTS } from '../constants'

/**
 * DB의 예약 단위 데이터를 UI의 30분 슬롯 형식으로 변환
 * @param {Array} reservations - DB에서 가져온 예약 배열
 * @returns {Object} - { "space-time": reservation } 형식의 슬롯 맵
 */
export const reservationsToSlots = (reservations) => {
  const slots = {}

  reservations.forEach(reservation => {
    const startTime = reservation.start_time.substring(0, 5) // "HH:MM:SS" -> "HH:MM"
    const endTime = reservation.end_time.substring(0, 5)

    const startIdx = TIME_SLOTS.indexOf(startTime)
    // 종료 시간이 22:00인 경우 TIME_SLOTS에 없으므로 특별 처리
    let endIdx = TIME_SLOTS.indexOf(endTime)
    if (endIdx === -1 && endTime === '22:00') {
      endIdx = TIME_SLOTS.length // 마지막 슬롯까지 포함
    }

    // 유효하지 않은 시간인 경우 스킵
    if (startIdx === -1 || endIdx === -1) {
      console.warn('Invalid time:', startTime, endTime)
      return
    }

    for (let i = startIdx; i < endIdx; i++) {
      const slotKey = `${reservation.space}-${TIME_SLOTS[i]}`
      slots[slotKey] = {
        id: reservation.id,
        oderId: reservation.user_id,
        name: reservation.name,
        department: reservation.department,
        purpose: reservation.purpose,
        startTime: startTime,
        endTime: endTime,
        space: reservation.space,
        time: TIME_SLOTS[i],
        isStart: i === startIdx,
        isProvisional: reservation.is_provisional || false,
        // 원본 데이터도 보존
        _original: reservation
      }
    }
  })

  return slots
}

/**
 * 시작 시간과 종료 시간 사이의 모든 슬롯 키 생성
 * @param {string} space - 장소명
 * @param {string} startTime - 시작 시간 (HH:MM)
 * @param {string} endTime - 종료 시간 (HH:MM)
 * @returns {Array} - 슬롯 키 배열
 */
export const getSlotKeys = (space, startTime, endTime) => {
  const startIdx = TIME_SLOTS.indexOf(startTime)
  const endIdx = TIME_SLOTS.indexOf(endTime)
  const keys = []

  for (let i = startIdx; i < endIdx; i++) {
    keys.push(`${space}-${TIME_SLOTS[i]}`)
  }

  return keys
}

/**
 * 시간 범위가 유효한지 검사
 * @param {string} startTime - 시작 시간 (HH:MM)
 * @param {string} endTime - 종료 시간 (HH:MM)
 * @returns {boolean}
 */
export const isValidTimeRange = (startTime, endTime) => {
  const startIdx = TIME_SLOTS.indexOf(startTime)
  const endIdx = TIME_SLOTS.indexOf(endTime)
  return startIdx !== -1 && endIdx !== -1 && startIdx < endIdx
}

/**
 * 특정 시간대에 해당하는 예약 찾기 (연속 예약의 시작 슬롯 정보 반환)
 * @param {Object} slots - 슬롯 맵
 * @param {string} space - 장소명
 * @param {string} time - 시간 (HH:MM)
 * @returns {Object|null} - 예약 정보 또는 null
 */
export const findReservationAtSlot = (slots, space, time) => {
  const slotKey = `${space}-${time}`
  return slots[slotKey] || null
}

/**
 * 예약의 모든 슬롯 수 계산
 * @param {string} startTime - 시작 시간 (HH:MM)
 * @param {string} endTime - 종료 시간 (HH:MM)
 * @returns {number} - 슬롯 수
 */
export const getSlotCount = (startTime, endTime) => {
  const startIdx = TIME_SLOTS.indexOf(startTime)
  const endIdx = TIME_SLOTS.indexOf(endTime)
  return endIdx - startIdx
}

/**
 * 시간 문자열 정규화 (HH:MM:SS -> HH:MM)
 * @param {string} time - 시간 문자열
 * @returns {string} - 정규화된 시간 문자열
 */
export const normalizeTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

/**
 * 예약 데이터를 UI 표시용으로 변환
 * @param {Object} reservation - DB 예약 데이터
 * @returns {Object} - UI용 예약 데이터
 */
export const formatReservationForUI = (reservation) => {
  return {
    id: reservation.id,
    oderId: reservation.user_id,
    name: reservation.name,
    department: reservation.department,
    purpose: reservation.purpose,
    startTime: normalizeTime(reservation.start_time),
    endTime: normalizeTime(reservation.end_time),
    space: reservation.space,
    date: reservation.date,
    createdAt: reservation.created_at,
    isProvisional: reservation.is_provisional || false
  }
}

/**
 * UI 데이터를 DB 저장용으로 변환
 * @param {Object} uiData - UI 폼 데이터
 * @param {string} oderId - 사용자 UUID
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @param {string} space - 장소명
 * @returns {Object} - DB 저장용 데이터
 */
export const formatReservationForDB = (uiData, oderId, date, space) => {
  return {
    user_id: oderId,
    date: date,
    space: space,
    start_time: uiData.startTime,
    end_time: uiData.endTime,
    purpose: uiData.purpose,
    name: uiData.name,
    department: uiData.department,
    is_provisional: uiData.isProvisional || false
  }
}
