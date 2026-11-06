export type Session = {
  token: string
  role: string
  username: string
  userId?: number
}

export type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
  role: string
  user: {
    id: number
    username: string
    email: string
  }
}

export type HotelRoom = {
  id: number
  room_number: string
  room_type_id?: number
  operational_status?: string
  cleaning_status?: string
  technical_status?: string
  room_types?: {
    type_name: string
    base_price: number | string
    capacity: number
  } | null
}

export type PublicRoomType = {
  id: number
  type_name: string
  base_price: number | string
  capacity: number
  description?: string | null
}

export type Booking = {
  id: number
  status: string
  expected_checkin: string
  expected_checkout: string
  customers?: {
    full_name: string
  } | null
  booking_details?: Array<{
    rooms?: {
      room_number: string
    } | null
  }>
}

const SESSION_KEY = 'maison-hotel-session'
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const API_URL = configuredApiUrl ? configuredApiUrl.replace(/\/$/, '') : 'http://localhost:3000'

export function getStoredSession(): Session | null {
  try {
    const serialized = localStorage.getItem(SESSION_KEY)
    if (!serialized) return null
    const value = JSON.parse(serialized) as Partial<Session>
    if (typeof value.token !== 'string' || typeof value.role !== 'string' || typeof value.username !== 'string') {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return value as Session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export async function apiRequest<T>(
  path: string,
  session: Session | null,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  if (session) headers.set('Authorization', `Bearer ${session.token}`)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new Error(`Không thể kết nối backend tại ${API_URL}. Hãy kiểm tra server và cấu hình VITE_API_URL.`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const body: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : `Yêu cầu thất bại (HTTP ${response.status})`
    if (response.status === 401 && session) {
      saveSession(null)
      window.dispatchEvent(new CustomEvent('maison-session-expired'))
    }
    throw new Error(message)
  }

  return body as T
}
