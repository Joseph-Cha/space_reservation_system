// 장소 목록
export const SPACES = [
  '월드비전홀',
  '순보금자리',
  '푸른초장',
  '쉴만한 물가',
  '넘치는 잔',
  'Vision Factory 1',
  'Vision Factory 2',
  'Vision Factory 3',
  'Vision Factory 4',
  'Vision Factory 5'
]

// 시간 슬롯 생성 (07:00 ~ 21:30, 30분 단위)
export const TIME_SLOTS = []
for (let hour = 7; hour < 22; hour++) {
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:00`)
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:30`)
}

// 소속/부서 목록
export const DEPARTMENTS = [
  '교역자',
  '비전브릿지',
  'CAM',
  '프뉴마',
  '가스펠',
  '카리스',
  '기타'
]

// 소속별 색상 (자동 할당)
export const DEPARTMENT_COLORS = {
  '교역자': '#FF6B6B',      // 빨강
  '비전브릿지': '#4ECDC4',  // 청록
  'CAM': '#45B7D1',         // 파랑
  '프뉴마': '#96CEB4',      // 녹색
  '가스펠': '#FFEAA7',      // 노랑
  '카리스': '#DDA15E',      // 주황
  '기타': '#B19CD9'         // 보라
}

// 유틸리티 함수: 날짜 포맷 (YYYY-MM-DD → YYYY년 MM월 DD일)
export const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-')
  return `${year}년 ${month}월 ${day}일`
}

// 유틸리티 함수: 시간 범위 포맷 (시작 시간 → 시작 ~ 종료)
export const formatTimeRange = (startTime) => {
  const startIndex = TIME_SLOTS.indexOf(startTime)
  const endTime = TIME_SLOTS[startIndex + 1] || '22:00'
  return `${startTime} ~ ${endTime}`
}

// 유틸리티 함수: 관리자 권한 확인
export const isAdmin = (user) => {
  return user && user.role === 'admin'
}

// 유틸리티 함수: 예약 소유자 확인
export const isReservationOwner = (reservation, user) => {
  return reservation && user && reservation.userId === user.userId
}

/**
 * HEX 색상을 어둡게 만들기
 * @param {string} hexColor - HEX 색상 코드 (예: '#FF6B6B')
 * @param {number} percent - 어둡게 할 비율 (0-100, 기본값 30)
 * @returns {string} - 어두운 HEX 색상
 */
export const darkenColor = (hexColor, percent = 30) => {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const factor = 1 - (percent / 100)
  const newR = Math.round(r * factor)
  const newG = Math.round(g * factor)
  const newB = Math.round(b * factor)

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * 배경색의 밝기를 계산하여 적절한 텍스트 색상 반환
 * @param {string} hexColor - HEX 색상 코드 (예: '#FF6B6B')
 * @returns {object} - { primary, secondary, tertiary } 텍스트 색상들
 */
export const getContrastTextColors = (hexColor) => {
  // HEX를 RGB로 변환
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // 상대적 휘도(luminance) 계산 (WCAG 공식)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // 밝기에 따라 텍스트 색상 결정
  if (luminance > 0.5) {
    // 밝은 배경 -> 어두운 글자
    return {
      primary: '#1a1a1a',    // 가장 진한 색 (담당자명)
      secondary: '#333333',   // 중간 색 (예약 목적)
      tertiary: '#555555'     // 가장 밝은 색 (시간)
    }
  } else {
    // 어두운 배경 -> 밝은 글자
    return {
      primary: '#ffffff',     // 가장 밝은 색 (담당자명)
      secondary: '#e0e0e0',   // 중간 색 (예약 목적)
      tertiary: '#cccccc'     // 가장 어두운 색 (시간)
    }
  }
}

/**
 * Finds the nth occurrence of a day of week in a given month
 * @param {number} year - Full year (2025)
 * @param {number} month - Month (0-11)
 * @param {number} dayOfWeek - Day (0=Sunday, 3=Wednesday)
 * @param {number} occurrence - Which occurrence (2 or 3)
 * @returns {Date|null} - The date or null if doesn't exist
 */
export const getNthDayOfMonth = (year, month, dayOfWeek, occurrence) => {
  let date = new Date(year, month, 1)
  let count = 0

  while (date.getMonth() === month) {
    if (date.getDay() === dayOfWeek) {
      count++
      if (count === occurrence) {
        return date
      }
    }
    date.setDate(date.getDate() + 1)
  }

  return null // Doesn't exist in this month
}

/**
 * Gets the unlock date for a department in a specific month
 * Returns the date when the NEXT month becomes bookable
 */
export const getUnlockDateForDepartment = (department, year, month) => {
  const unlockRules = {
    '교역자': { day: 0, occurrence: 2 },        // 2nd Sunday
    '비전브릿지': { day: 0, occurrence: 3 },    // 3rd Sunday
    '프뉴마': { day: 0, occurrence: 3 },
    '가스펠': { day: 0, occurrence: 3 },
    '카리스': { day: 0, occurrence: 3 },
    'CAM': { day: 0, occurrence: 3 },
    '기타': { day: 3, occurrence: 3 }           // 3rd Wednesday
  }

  const rule = unlockRules[department]

  // If department not found, default to 3rd Sunday rule
  if (!rule) {
    return getNthDayOfMonth(year, month, 0, 3)
  }

  return getNthDayOfMonth(year, month, rule.day, rule.occurrence)
}

/**
 * Checks if a specific date is bookable for a department
 * Logic: A date in month M is bookable if:
 * 1. It's not in the past
 * 2. The unlock date in month M-1 has passed (or it's current month)
 */
export const isDateBookableForDepartment = (targetDate, userDepartment, today = new Date()) => {
  // Normalize times
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  const now = new Date(today)
  now.setHours(0, 0, 0, 0)

  // Past dates are never bookable
  if (target < now) {
    return false
  }

  const targetYear = target.getFullYear()
  const targetMonth = target.getMonth()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Current month is always bookable (except past dates)
  if (targetYear === currentYear && targetMonth === currentMonth) {
    return true
  }

  // For future months, check if unlock date has passed
  // The unlock date is in the previous month
  let prevYear = targetYear
  let prevMonth = targetMonth - 1
  if (prevMonth < 0) {
    prevMonth = 11
    prevYear -= 1
  }

  const unlockDate = getUnlockDateForDepartment(userDepartment, prevYear, prevMonth)

  // If unlock date doesn't exist (rare edge case), allow booking
  if (!unlockDate) {
    return true
  }

  // Check if today >= unlock date
  return now >= unlockDate
}

/**
 * Gets user-friendly message about booking window
 */
export const getBookingWindowInfo = (department) => {
  const rules = {
    '교역자': '매월 2번째 일요일',
    '비전브릿지': '매월 3번째 일요일',
    '프뉴마': '매월 3번째 일요일',
    '가스펠': '매월 3번째 일요일',
    '카리스': '매월 3번째 일요일',
    'CAM': '매월 3번째 일요일',
    '기타': '매월 3번째 수요일'
  }
  const rule = rules[department] || '매월 3번째 일요일'
  return `${rule}에 다음 달 예약이 오픈됩니다`
}
