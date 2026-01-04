import { useState, useEffect } from 'react'
import { TIME_SLOTS, END_TIME_SLOTS, DEPARTMENTS, formatDate } from '../constants'
import './ReservationModal.css'

function ReservationModal({ space, date, time, currentUser, isEditMode, editingReservation, onClose, onSubmit, onDelete }) {
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    department: currentUser.department || '',
    purpose: '',
    startTime: time,
    endTime: '',
    isProvisional: false
  })
  const [errors, setErrors] = useState({})

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (isEditMode && editingReservation) {
      // 수정 모드: 기존 데이터 로드
      setFormData({
        name: editingReservation.name,
        department: editingReservation.department,
        purpose: editingReservation.purpose,
        startTime: editingReservation.startTime,
        endTime: editingReservation.endTime,
        isProvisional: editingReservation.isProvisional || false
      })
    } else {
      // 생성 모드: formData 완전 초기화 (이전 데이터 잔류 방지)
      const startIndex = TIME_SLOTS.indexOf(time)
      setFormData({
        name: currentUser.name || '',
        department: currentUser.department || '',
        purpose: '', // 목적 초기화
        startTime: time,
        endTime: startIndex < TIME_SLOTS.length - 1 ? TIME_SLOTS[startIndex + 1] : '',
        isProvisional: false
      })
    }
  }, [time, isEditMode, editingReservation, currentUser])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // 유효성 검증
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '담당자명을 입력해주세요'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = '예약 목적을 입력해주세요'
    }

    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 선택해주세요'
    }

    if (!formData.endTime) {
      newErrors.endTime = '종료 시간을 선택해주세요'
    }

    if (formData.startTime && formData.endTime) {
      // 시간 문자열 비교 (HH:MM 형식이므로 문자열 비교 가능)
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = '종료 시간은 시작 시간보다 이후여야 합니다'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }


  // 시작 시간 이후의 시간만 선택 가능하도록 필터링 (22:00 포함)
  const getAvailableEndTimes = () => {
    const startIndex = TIME_SLOTS.indexOf(formData.startTime)
    // END_TIME_SLOTS는 TIME_SLOTS.slice(1) + '22:00' 이므로
    // startIndex에 해당하는 END_TIME_SLOTS 이후의 시간만 반환
    return END_TIME_SLOTS.filter((_, index) => index >= startIndex)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? '예약 정보 수정' : '예약 정보 입력'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-info">
          <div className="info-item">
            <span className="info-label">날짜:</span>
            <span className="info-value">{formatDate(date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">장소:</span>
            <span className="info-value">{space}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">담당자명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department">소속/부서</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              readOnly
              disabled
              className="readonly-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">예약 목적 *</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="예약 목적을 입력하세요"
              rows="3"
              className={errors.purpose ? 'error' : ''}
            />
            {errors.purpose && <span className="error-message">{errors.purpose}</span>}
          </div>

          <div className="time-group">
            <div className="form-group">
              <label htmlFor="startTime">시작 시간 *</label>
              <select
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? 'error' : ''}
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.startTime && <span className="error-message">{errors.startTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">종료 시간 *</label>
              <select
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? 'error' : ''}
              >
                <option value="">선택하세요</option>
                {getAvailableEndTimes().map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.endTime && <span className="error-message">{errors.endTime}</span>}
            </div>
          </div>

          <div className="form-group provisional-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isProvisional"
                checked={formData.isProvisional}
                onChange={handleChange}
              />
              <span className="checkbox-text">가예약으로 등록</span>
            </label>
            {formData.isProvisional && (
              <div className="provisional-notice">
                <span className="notice-icon">ℹ️</span>
                <span className="notice-text">
                  가예약은 확정된 예약이 아닙니다. 해당 장소에 대해 각 선교회의 연락을 통해
                  예약이 변경될 수 있습니다.
                </span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            {isEditMode && onDelete && (
              <button type="button" onClick={onDelete} className="delete-button">
                삭제
              </button>
            )}
            <button type="button" onClick={onClose} className="cancel-button">
              취소
            </button>
            <button type="submit" className="submit-button">
              {isEditMode ? '수정하기' : '예약하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationModal
