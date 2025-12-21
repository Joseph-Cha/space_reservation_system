import { useEffect } from 'react'
import './HelpModal.css'

function HelpModal({ onClose }) {
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

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>도움말</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="help-modal-body">
          <section className="help-section">
            <h3>예약 시스템 이용 안내</h3>
            <p>
              장소 예약 시스템은 공용 공간의 효율적인 사용을 위해 운영됩니다.
              예약은 30분 단위로 가능하며, 운영 시간은 07:00 ~ 22:00입니다.
            </p>
          </section>

          <section className="help-section">
            <h3>소속별 예약 오픈 일정</h3>
            <div className="schedule-table">
              <table>
                <thead>
                  <tr>
                    <th>소속</th>
                    <th>다음 달 예약 오픈일</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>교역자</td>
                    <td>매월 2번째 일요일</td>
                  </tr>
                  <tr>
                    <td>비전브릿지, CAM, 프뉴마, 가스펠, 카리스</td>
                    <td>매월 3번째 일요일</td>
                  </tr>
                  <tr>
                    <td>기타</td>
                    <td>매월 3번째 수요일</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="schedule-note">
              * 현재 달의 예약은 항상 가능합니다.
            </p>
          </section>

          <section className="help-section">
            <h3>예약 방법</h3>
            <ol>
              <li>캘린더에서 예약하고자 하는 날짜를 선택합니다.</li>
              <li>예약 가능한 시간대(녹색)를 클릭합니다.</li>
              <li>예약 정보를 입력하고 "예약하기" 버튼을 클릭합니다.</li>
            </ol>
          </section>

          <section className="help-section">
            <h3>예약 수정/취소</h3>
            <p>
              본인이 등록한 예약은 "내 예약" 메뉴에서 수정하거나 삭제할 수 있습니다.
              예약된 시간대를 클릭하여 직접 수정/삭제도 가능합니다.
            </p>
          </section>

          <section className="help-section contact-section">
            <h3>문의처</h3>
            <p>
              시스템 관련 문의사항이 있으시면 아래 담당자에게 연락해 주세요.
            </p>
            <div className="contact-info">
              <span className="contact-label">담당자:</span>
              <span className="contact-value">차동훈</span>
            </div>
            <div className="contact-info">
              <span className="contact-label">이메일:</span>
              <a href="mailto:joseph.c@kakao.com" className="contact-email">
                joseph.c@kakao.com
              </a>
            </div>
          </section>
        </div>

        <div className="help-modal-footer">
          <button onClick={onClose} className="confirm-button">
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default HelpModal
