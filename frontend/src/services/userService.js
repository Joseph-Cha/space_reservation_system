import { supabase } from '../lib/supabase'

export const userService = {
  // 로그인
  async login(userId, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: { message: '등록되지 않은 사용자 ID입니다' } }
      }
      return { data: null, error }
    }

    if (data.password !== password) {
      return { data: null, error: { message: '비밀번호가 일치하지 않습니다' } }
    }

    return { data, error: null }
  },

  // 회원가입
  async signUp(userData) {
    // 중복 확인
    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userData.userId)
      .single()

    if (existing) {
      return { data: null, error: { message: '이미 사용 중인 사용자 ID입니다' } }
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: userData.userId,
        password: userData.password,
        name: userData.name,
        department: userData.department,
        role: 'user'
      })
      .select()
      .single()

    return { data, error }
  },

  // 모든 사용자 조회 (관리자용)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    return { data: data || [], error }
  },

  // 사용자 생성 (관리자용)
  async createUser(userData) {
    // 중복 확인
    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userData.userId)
      .single()

    if (existing) {
      return { data: null, error: { message: '이미 사용 중인 사용자 ID입니다' } }
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: userData.userId,
        password: userData.password,
        name: userData.name,
        department: userData.department,
        role: userData.role || 'user'
      })
      .select()
      .single()

    return { data, error }
  },

  // 사용자 수정
  async updateUser(id, userData) {
    const updateData = {
      name: userData.name,
      department: userData.department,
      updated_at: new Date().toISOString()
    }

    // 비밀번호가 제공된 경우에만 업데이트
    if (userData.password) {
      updateData.password = userData.password
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // 사용자 삭제
  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    return { error }
  },

  // ID로 사용자 조회
  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  // user_id로 사용자 조회
  async getUserByUserId(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  }
}
