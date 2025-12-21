import { useState, useEffect } from 'react'
import { TIME_SLOTS, DEPARTMENTS, formatDate } from '../constants'
import './ReservationModal.css'

function ReservationModal({ space, date, time, currentUser, isEditMode, editingReservation, onClose, onSubmit, onDelete }) {
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    department: currentUser.department || '',
    purpose: '',
    startTime: time,
    endTime: ''
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
        endTime: editingReservation.endTime
      })
    } else {
      // 생성 모드: 기본 종료 시간 설정 (시작 시간 + 30분)
      const startIndex = TIME_SLOTS.indexOf(time)
      if (startIndex < TIME_SLOTS.length - 1) {
        setFormData(prev => ({
          ...prev,
          endTime: TIME_SLOTS[startIndex + 1]
        }))
      }
    }
  }, [time, isEditMode, editingReservation])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const startIndex = TIME_SLOTS.indexOf(formData.startTime)
      const endIndex = TIME_SLOTS.indexOf(formData.endTime)

      if (startIndex >= endIndex) {
        newErrors.endTime = '종료 시간은 시작 시간보다 이후여야 합니다'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }


  // 시작 시간 이후의 시간만 선택 가능하도록 필터링
  const getAvailableEndTimes = () => {
    const startIndex = TIME_SLOTS.indexOf(formData.startTime)
    return TIME_SLOTS.filter((_, index) => index > startIndex)
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
