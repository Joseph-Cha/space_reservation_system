import { supabase } from '../lib/supabase'

export const reservationService = {
  // 날짜별 예약 조회
  async getByDate(date) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', date)
      .order('start_time', { ascending: true })

    return { data: data || [], error }
  },

  // 사용자별 예약 조회
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    return { data: data || [], error }
  },

  // 모든 예약 조회 (관리자용)
  async getAll() {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    return { data: data || [], error }
  },

  // 예약 생성
  async create(reservationData) {
    // 중복 검사
    const conflictCheck = await this.checkConflict(
      reservationData.date,
      reservationData.space,
      reservationData.start_time,
      reservationData.end_time
    )

    if (conflictCheck.hasConflict) {
      return {
        data: null,
        error: {
          message: `해당 시간대에 이미 예약이 있습니다: ${conflictCheck.conflictingTimes.join(', ')}`
        }
      }
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        user_id: reservationData.user_id,
        date: reservationData.date,
        space: reservationData.space,
        start_time: reservationData.start_time,
        end_time: reservationData.end_time,
        purpose: reservationData.purpose,
        name: reservationData.name,
        department: reservationData.department,
        is_provisional: reservationData.is_provisional || false
      })
      .select()
      .single()

    // DB 에러를 사용자 친화적인 메시지로 변환
    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique_reservation')) {
        return {
          data: null,
          error: {
            message: '해당 시간대에 이미 다른 예약이 존재합니다. 다른 시간대를 선택해주세요.'
          }
        }
      }
      return { data: null, error: { message: '예약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' } }
    }

    return { data, error }
  },

  // 예약 수정
  async update(id, reservationData) {
    // 중복 검사 (자기 자신 제외)
    const conflictCheck = await this.checkConflict(
      reservationData.date,
      reservationData.space,
      reservationData.start_time,
      reservationData.end_time,
      id
    )

    if (conflictCheck.hasConflict) {
      return {
        data: null,
        error: {
          message: `해당 시간대에 이미 예약이 있습니다: ${conflictCheck.conflictingTimes.join(', ')}`
        }
      }
    }

    const { data, error } = await supabase
      .from('reservations')
      .update({
        start_time: reservationData.start_time,
        end_time: reservationData.end_time,
        purpose: reservationData.purpose,
        name: reservationData.name,
        department: reservationData.department,
        is_provisional: reservationData.is_provisional || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // 예약 삭제
  async delete(id) {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)

    return { error }
  },

  // 중복 검사
  async checkConflict(date, space, startTime, endTime, excludeId = null) {
    let query = supabase
      .from('reservations')
      .select('start_time, end_time')
      .eq('date', date)
      .eq('space', space)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error || !data) {
      return { hasConflict: false, conflictingTimes: [] }
    }

    // 시간을 HH:MM 형식으로 정규화하는 함수
    const normalizeTime = (time) => {
      if (!time) return ''
      return time.substring(0, 5) // "HH:MM:SS" -> "HH:MM"
    }

    // 시간 겹침 검사
    const conflictingTimes = []
    const newStart = normalizeTime(startTime)
    const newEnd = normalizeTime(endTime)

    data.forEach(reservation => {
      const existStart = normalizeTime(reservation.start_time)
      const existEnd = normalizeTime(reservation.end_time)

      // 시간이 겹치는 경우: (newStart < existEnd) AND (newEnd > existStart)
      // 경계값은 겹치지 않음 (13:00 끝나는 예약과 13:00 시작하는 예약은 OK)
      if (newStart < existEnd && newEnd > existStart) {
        conflictingTimes.push(`${existStart} ~ ${existEnd}`)
      }
    })

    return {
      hasConflict: conflictingTimes.length > 0,
      conflictingTimes
    }
  },

  // ID로 예약 조회
  async getById(id) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }
}
