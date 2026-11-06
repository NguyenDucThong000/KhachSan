import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import {
  apiRequest,
  getStoredSession,
  saveSession,
  type Booking,
  type HotelRoom,
  type LoginResponse,
  type PublicRoomType,
  type Session,
} from './api'

type Role = 'Customer' | 'Receptionist' | 'Manager' | 'Admin'
type PageId = 'overview' | 'rooms' | 'bookings' | 'guests' | 'leave' | 'operations' | 'reports' | 'accounts' | 'activity' | 'settings'

type NavigationItem = {
  id: PageId
  label: string
  icon: string
  group: string
}

type RegistrationPayload = {
  username: string
  password: string
  email: string
  full_name: string
  phone: string
  cccd_passport: string
}

const navigation: Record<Role, NavigationItem[]> = {
  Customer: [
    { id: 'overview', label: 'Tổng quan', icon: 'grid', group: 'CỦA BẠN' },
    { id: 'rooms', label: 'Khám phá phòng', icon: 'bed', group: 'LƯU TRÚ' },
    { id: 'bookings', label: 'Đặt phòng của tôi', icon: 'calendar', group: 'LƯU TRÚ' },
  ],
  Receptionist: [
    { id: 'overview', label: 'Tổng quan', icon: 'grid', group: 'LỄ TÂN' },
    { id: 'rooms', label: 'Sơ đồ phòng', icon: 'bed', group: 'NGHIỆP VỤ' },
    { id: 'bookings', label: 'Đặt phòng', icon: 'calendar', group: 'NGHIỆP VỤ' },
    { id: 'guests', label: 'Khách hàng', icon: 'users', group: 'NGHIỆP VỤ' },
    { id: 'operations', label: 'Buồng phòng', icon: 'sparkle', group: 'VẬN HÀNH' },
  ],
  Manager: [
    { id: 'overview', label: 'Tổng quan', icon: 'grid', group: 'QUẢN LÝ' },
    { id: 'reports', label: 'Báo cáo', icon: 'chart', group: 'KINH DOANH' },
    { id: 'rooms', label: 'Phòng & trạng thái', icon: 'bed', group: 'VẬN HÀNH' },
    { id: 'bookings', label: 'Đặt phòng', icon: 'calendar', group: 'VẬN HÀNH' },
    { id: 'guests', label: 'Khách hàng', icon: 'users', group: 'VẬN HÀNH' },
    { id: 'leave', label: 'Nghỉ phép nhân viên', icon: 'clock', group: 'NHÂN SỰ' },
    { id: 'operations', label: 'Bảo trì', icon: 'wrench', group: 'VẬN HÀNH' },
  ],
  Admin: [
    { id: 'overview', label: 'Tổng quan', icon: 'grid', group: 'HỆ THỐNG' },
    { id: 'accounts', label: 'Tài khoản', icon: 'users', group: 'QUẢN TRỊ' },
    { id: 'activity', label: 'Nhật ký hoạt động', icon: 'clock', group: 'QUẢN TRỊ' },
    { id: 'settings', label: 'Cấu hình', icon: 'settings', group: 'QUẢN TRỊ' },
    { id: 'rooms', label: 'Phòng khách sạn', icon: 'bed', group: 'DỮ LIỆU' },
    { id: 'guests', label: 'Khách hàng', icon: 'users', group: 'DỮ LIỆU' },
    { id: 'leave', label: 'Nghỉ phép nhân viên', icon: 'clock', group: 'NHÂN SỰ' },
    { id: 'reports', label: 'Báo cáo', icon: 'chart', group: 'DỮ LIỆU' },
  ],
}

const roleLabels: Record<Role, string> = {
  Customer: 'Khách hàng',
  Receptionist: 'Lễ tân',
  Manager: 'Quản lý',
  Admin: 'Quản trị viên',
}

function normalizeRole(role?: string): Role | null {
  const roleNames: Record<string, Role> = {
    admin: 'Admin',
    manager: 'Manager',
    receptionist: 'Receptionist',
    customer: 'Customer',
  }
  return role ? roleNames[role.trim().toLowerCase()] ?? null : null
}

const formatMoney = (value: number | string | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0))

const formatDate = (value?: string) =>
  value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'

function Icon({ name, size = 19 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    bed: 'M3 18v-7m0 3h18v4M5 14V9a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v5m0-3h5a3 3 0 0 1 3 3v1',
    calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6-7.5a4 4 0 0 1 0 7.8M20 15a4 4 0 0 1 2 3.5V21',
    sparkle: 'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z',
    chart: 'M3 3v18h18M8 15l4-4 4 3 5-7',
    wrench: 'M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 12l-3-3 3.7-2.7z',
    clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2m9-9h-2M5 12H3m15.4-6.4-1.4 1.4M7 17l-1.4 1.4m12.8 0L17 17M7 7 5.6 5.6',
    search: 'm20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',
    arrow: 'M5 12h14m-7-7 7 7-7 7',
    plus: 'M12 5v14m-7-7h14',
    logout: 'M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6',
    close: 'M18 6 6 18M6 6l12 12',
    check: 'm5 12 4 4L19 6',
    menu: 'M4 6h16M4 12h16M4 18h16',
    pin: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7.5 9.6a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.6 2z',
    leaf: 'M20 4c-9 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-6 10-16zM5 19c3-4 6-7 11-10',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] ?? paths.grid} />
    </svg>
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(() => getStoredSession())
  const role = normalizeRole(session?.role)
  const isDemo = !session
  const [page, setPage] = useState<PageId>('overview')
  const [rooms, setRooms] = useState<HotelRoom[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [publicRoomTypes, setPublicRoomTypes] = useState<PublicRoomType[]>([])
  const [report, setReport] = useState<Record<string, unknown> | null>(null)
  const [revenue30d, setRevenue30d] = useState<number | null>(null)
  const [revenueDaily, setRevenueDaily] = useState<Array<{ date: string; revenue: number }>>([])
  const [loginOpen, setLoginOpen] = useState(false)
  const [startWithRegistration, setStartWithRegistration] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [busy, setBusy] = useState(false)
  const [apiError, setApiError] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchDates, setSearchDates] = useState({ checkin: '', checkout: '' })
  const [roomSearchDone, setRoomSearchDone] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const items = role ? navigation[role] : []
  const currentPageLabel = items.find((item) => item.id === page)?.label ?? 'Tổng quan'

  const loadData = useCallback(async () => {
    if (!session) return
    const requests: Promise<void>[] = [
      apiRequest<HotelRoom[]>('/rooms', session).then(setRooms),
    ]
    if (role === 'Customer') {
      requests.push(apiRequest<Booking[]>('/my/bookings', session).then(setBookings))
    } else {
      requests.push(apiRequest<Booking[]>('/bookings?limit=50', session).then(setBookings))
    }
    if (role === 'Manager' || role === 'Admin') {
      requests.push(apiRequest<Record<string, unknown>>('/reports/occupancy', session).then(setReport))
      const end = new Date()
      const start = new Date(end)
      start.setDate(start.getDate() - 29)
      const from = start.toISOString().slice(0, 10)
      const to = end.toISOString().slice(0, 10)
      requests.push(apiRequest<{ total: number; daily: Array<{ date: string; revenue: number }> }>(`/reports/revenue?from=${from}&to=${to}`, session).then((result) => {
        setRevenue30d(result.total)
        setRevenueDaily(result.daily)
      }))
    }
    const results = await Promise.allSettled(requests)
    const errors = results.flatMap((result) => result.status === 'rejected' ? [result.reason instanceof Error ? result.reason.message : 'Không tải được dữ liệu'] : [])
    if (errors.length) setApiError(errors.join(' · '))
    else setApiError('')
  }, [role, session])

  useEffect(() => {
    if (!session) return
    let active = true
    void Promise.resolve().then(() => {
      if (active) return loadData()
      return undefined
    })
    return () => { active = false }
  }, [loadData, session])

  useEffect(() => {
    if (session) return
    let active = true
    void Promise.resolve().then(async () => {
      try {
        const result = await apiRequest<PublicRoomType[]>('/public/room-types', null)
        if (active) setPublicRoomTypes(result)
      } catch (error) {
        if (active) setApiError(error instanceof Error ? error.message : 'Không tải được danh sách hạng phòng')
      }
    })
    return () => { active = false }
  }, [session])

  useEffect(() => {
    const handleExpiredSession = () => {
      setSession(null)
      setPage('overview')
      setRooms([])
      setBookings([])
      setReport(null)
      setRevenue30d(null)
      setRevenueDaily([])
      setApiError('')
      setPage('overview')
      setNotice('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }
    window.addEventListener('maison-session-expired', handleExpiredSession)
    return () => window.removeEventListener('maison-session-expired', handleExpiredSession)
  }, [])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const roomCounts = useMemo(() => ({
    total: rooms.length,
    available: rooms.filter((room) => room.operational_status === 'AVAILABLE' && room.technical_status === 'NORMAL').length,
    occupied: rooms.filter((room) => room.operational_status === 'OCCUPIED').length,
    maintenance: rooms.filter((room) => room.technical_status !== 'NORMAL').length,
  }), [rooms])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setLoginError('')
    try {
      const result = await apiRequest<LoginResponse>('/auth/login', null, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const normalizedRole = normalizeRole(result.role)
      if (!normalizedRole) throw new Error('Tài khoản có vai trò chưa được hỗ trợ.')
      const nextSession = { token: result.access_token, role: normalizedRole, username: result.user.username, userId: result.user.id }
      saveSession(nextSession)
      setSession(nextSession)
      setPage('overview')
      setRooms([])
      setBookings([])
      setReport(null)
      setRevenue30d(null)
      setRevenueDaily([])
      setApiError('')
      setLoginOpen(false)
      setPassword('')
      setNotice(`Xin chào ${result.user.username}`)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Không thể đăng nhập')
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async (data: RegistrationPayload) => {
    setBusy(true)
    setLoginError('')
    try {
      await apiRequest<{ id: number; username: string; email: string }>('/auth/register', null, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setUsername(data.username)
      setPassword('')
      setLoginOpen(false)
      setNotice('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Không thể tạo tài khoản')
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = () => {
    saveSession(null)
    setSession(null)
    setRooms([])
    setBookings([])
    setReport(null)
    setRevenue30d(null)
    setRevenueDaily([])
    setPage('overview')
    setNotice('Đã đăng xuất.')
  }

  const requestAccess = () => {
    if (!session) openLogin()
    else setNotice('Biểu mẫu thao tác này chưa được kết nối trong bản giao diện đầu tiên.')
  }

  const openLogin = () => {
    setStartWithRegistration(false)
    setLoginOpen(true)
  }

  const openRegistration = () => {
    setStartWithRegistration(true)
    setLoginOpen(true)
  }

  const searchAvailableRooms = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!searchDates.checkin || !searchDates.checkout) {
      setNotice('Vui lòng chọn ngày nhận và trả phòng.')
      return
    }
    if (new Date(searchDates.checkout) <= new Date(searchDates.checkin)) {
      setNotice('Ngày trả phòng phải sau ngày nhận phòng.')
      return
    }
    try {
      const endpoint = session ? '/rooms/availability' : '/public/rooms/availability'
      const result = await apiRequest<HotelRoom[]>(`${endpoint}?checkin=${encodeURIComponent(searchDates.checkin)}&checkout=${encodeURIComponent(searchDates.checkout)}`, session)
      setRooms(result)
      setRoomSearchDone(true)
      setApiError('')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Không thể tìm phòng')
    }
  }

  const confirmBooking = async (bookingId: number) => {
    if (!session) {
      setNotice('Đăng nhập bằng tài khoản nhân viên để xác nhận đặt phòng.')
      setLoginOpen(true)
      return
    }
    try {
      await apiRequest(`/bookings/${bookingId}/confirm`, session, { method: 'PATCH' })
      setNotice(`Đã xác nhận đặt phòng #${bookingId}`)
      await loadData()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Không thể xác nhận đặt phòng')
    }
  }

  const cancelBooking = async (bookingId: number) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đặt phòng #${bookingId}?`)) return
    if (!session) {
      setNotice('Đăng nhập để quản lý đặt phòng của bạn.')
      setLoginOpen(true)
      return
    }
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, session, { method: 'PATCH' })
      setNotice(`Đã hủy đặt phòng #${bookingId}`)
      await loadData()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Không thể hủy đặt phòng')
    }
  }

  const navTo = (id: PageId) => {
    setPage(id)
    setMobileNavOpen(false)
    if (id === 'overview') {
      setRoomSearchDone(false)
    }
    if (session && id === 'accounts') void fetchResource('/users')
    if (session && id === 'activity') void fetchResource('/activity-logs')
  }

  const [resourceRows, setResourceRows] = useState<Record<string, unknown>[]>([])
  const [resourceLabel, setResourceLabel] = useState('')
  const fetchResource = async (resource: string) => {
    if (!session) {
      setResourceRows([])
      setResourceLabel(resource)
      return
    }
    try {
      const result = await apiRequest<Record<string, unknown>[]>(resource, session)
      setResourceRows(result)
      setResourceLabel(resource)
      setApiError('')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : `Không thể tải ${resource}`)
    }
  }

  const updateRoomCleaning = async (room: HotelRoom) => {
    if (!session) {
      setNotice('Đăng nhập bằng tài khoản nhân viên để cập nhật tình trạng phòng.')
      setLoginOpen(true)
      return
    }
    const cleaning_status = room.cleaning_status === 'CLEAN' ? 'DIRTY' : 'CLEAN'
    try {
      await apiRequest(`/rooms/${room.id}/status`, session, {
        method: 'PATCH',
        body: JSON.stringify({ cleaning_status }),
      })
      setNotice(`Đã cập nhật phòng ${room.room_number}`)
      await loadData()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Không thể cập nhật phòng')
    }
  }

  const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  if (!session || !role) {
    return (
      <>
        <PublicLanding
          roomTypes={publicRoomTypes}
          availableRooms={roomSearchDone ? rooms : []}
          searchDates={searchDates}
          setSearchDates={setSearchDates}
          onSearch={searchAvailableRooms}
          onLogin={openLogin}
          onRegister={openRegistration}
          apiError={apiError}
        />
        {loginOpen && (
          <LoginDialog
            busy={busy}
            error={loginError}
            initialRegister={startWithRegistration}
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            onSubmit={handleLogin}
            onRegister={handleRegister}
            onClose={() => setLoginOpen(false)}
          />
        )}
        {notice && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{notice}<button onClick={() => setNotice('')} aria-label="Đóng"><Icon name="close" size={16} /></button></div>}
      </>
    )
  }

  return (
    <div className={`app-shell ${role === 'Customer' ? 'customer-shell' : 'staff-shell'}`}>
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Đóng menu" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); navTo('overview') }}>
          <span className="brand-mark"><span /></span>
          <span className="brand-copy"><strong>MAISON</strong><small>HOTEL & RESIDENCE</small></span>
        </a>
        <div className="sidebar-hotel">
          <span className="hotel-monogram">M</span>
          <span><strong>Maison Riverside</strong><small>Đà Nẵng, Việt Nam</small></span>
          <span className="online-dot" />
        </div>
        <nav className="side-nav" aria-label="Điều hướng chính">
          {groupNavigation(items).map(([group, groupItems]) => (
            <div className="nav-group" key={group}>
              <span className="nav-group-label">{group}</span>
              {groupItems.map((item) => (
                <button key={item.id} className={`nav-item ${page === item.id ? 'nav-item-active' : ''}`} onClick={() => navTo(item.id)}>
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.id === 'bookings' && role !== 'Customer' && <span className="nav-count">3</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">?</span>
            <strong>Cần hỗ trợ?</strong>
            <p>Đội ngũ Maison luôn sẵn sàng giúp bạn.</p>
            <button onClick={() => setNotice('Bộ phận hỗ trợ: (0236) 355 8888')}>Liên hệ hỗ trợ <Icon name="arrow" size={14} /></button>
          </div>
          <div className="profile-row">
            <div className="avatar avatar-olive">{session.username.slice(0, 1).toUpperCase()}</div>
            <div className="profile-copy"><strong>{session.username}</strong><small>{roleLabels[role]}</small></div>
            <button className="icon-button profile-action" aria-label="Đăng xuất" onClick={handleLogout}><Icon name="logout" /></button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Mở menu" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumbs"><span>Maison Riverside</span><i>/</i><strong>{page === 'overview' ? 'Tổng quan' : currentPageLabel}</strong></div>
          <div className="topbar-actions">
            <div className="today-label"><span className="today-dot" />{today}</div>
            <button className="icon-button notification-button" aria-label="Thông báo" onClick={() => setNotice('Bạn đã xem các thông báo mới nhất.')}><Icon name="bell" /><span /></button>
            <span className="topbar-divider" />
            <button className="topbar-user" onClick={handleLogout}><span className="avatar avatar-small">{session.username.slice(0, 1).toUpperCase()}</span><span>{session.username}</span><Icon name="logout" size={15} /></button>
          </div>
        </header>

        <div className="content-area">
          {apiError && <div className="api-error" role="alert"><strong>Chưa tải được dữ liệu từ backend.</strong><span>{apiError}</span><button onClick={() => void loadData()}>Thử lại</button></div>}
          {page === 'overview' && role === 'Customer' && <CustomerOverview greetingName={`${getTimeGreeting()}, ${session?.username ?? 'Minh Anh'}`} bookings={bookings} rooms={rooms} searchDates={searchDates} setSearchDates={setSearchDates} onSearch={searchAvailableRooms} onNavigate={navTo} onCancel={cancelBooking} isDemo={isDemo} />}
          {page === 'overview' && role !== 'Customer' && <StaffOverview role={role} rooms={rooms} bookings={bookings} counts={roomCounts} onNavigate={navTo} onConfirm={confirmBooking} isDemo={isDemo} report={report} revenue30d={revenue30d} />}
          {page === 'rooms' && <RoomsPage rooms={rooms} role={role} searched={roomSearchDone} session={session} onUpdate={updateRoomCleaning} onRefresh={loadData} onLogin={requestAccess} />}
          {page === 'bookings' && <BookingsPage bookings={bookings} role={role} onConfirm={confirmBooking} onCancel={cancelBooking} isDemo={isDemo} />}
          {page === 'guests' && <GuestsPage session={session} onLogin={requestAccess} />}
          {page === 'leave' && <LeaveRequestsPage session={session} />}
          {page === 'operations' && <OperationsPage role={role} isDemo={isDemo} session={session} onLogin={requestAccess} />}
          {page === 'reports' && <ReportsPage isDemo={isDemo} report={report} revenue30d={revenue30d} revenueDaily={revenueDaily} rooms={rooms} bookings={bookings} />}
          {page === 'accounts' && <ResourcePage title="Tài khoản người dùng" description="Quản lý quyền truy cập và tài khoản nhân sự." rows={resourceRows} resource={resourceLabel} isDemo={isDemo} onLogin={requestAccess} />}
          {page === 'activity' && <ResourcePage title="Nhật ký hoạt động" description="Theo dõi các thao tác được thực hiện trên hệ thống." rows={resourceRows} resource={resourceLabel} isDemo={isDemo} onLogin={requestAccess} />}
          {page === 'settings' && <SettingsPage isDemo={isDemo} onLogin={requestAccess} />}
          <footer className="page-footer"><span>© 2026 Maison Riverside</span><span>Made for moments that matter <span className="footer-heart">✦</span></span></footer>
        </div>
      </main>
      {notice && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{notice}<button onClick={() => setNotice('')} aria-label="Đóng"><Icon name="close" size={16} /></button></div>}
      {loginOpen && <LoginDialog busy={busy} error={loginError} initialRegister={startWithRegistration} username={username} password={password} setUsername={setUsername} setPassword={setPassword} onSubmit={handleLogin} onRegister={handleRegister} onClose={() => setLoginOpen(false)} />}
    </div>
  )
}

function groupNavigation(items: NavigationItem[]) {
  return items.reduce<[string, NavigationItem[]][]>((groups, item) => {
    const existing = groups.find(([group]) => group === item.group)
    if (existing) existing[1].push(item)
    else groups.push([item.group, [item]])
    return groups
  }, [])
}

function getGreeting(role: Role) {
  if (role === 'Customer') return 'Chào buổi sáng, Minh Anh'
  if (role === 'Receptionist') return 'Xin chào, Lễ tân'
  if (role === 'Manager') return 'Toàn cảnh khách sạn'
  return 'Trung tâm quản trị'
}

function getTimeGreeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
}

function CustomerOverview({ greetingName, bookings, rooms, searchDates, setSearchDates, onSearch, onNavigate, onCancel, isDemo }: {
  greetingName: string
  bookings: Booking[]
  rooms: HotelRoom[]
  searchDates: { checkin: string; checkout: string }
  setSearchDates: (value: { checkin: string; checkout: string }) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
  onNavigate: (id: PageId) => void
  onCancel: (id: number) => void
  isDemo: boolean
}) {
  const featured = rooms.filter((room) => room.technical_status === 'NORMAL').slice(0, 3)
  return (
    <>
      <div className="page-heading customer-heading">
        <div><span className="eyebrow">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()}</span><h1>{greetingName}</h1><p>Một kỳ nghỉ thật đẹp đang chờ bạn ở Maison Riverside.</p></div>
        <span className="member-chip"><span>✦</span> MAISON MEMBER <strong>{isDemo ? 'GOLD' : 'WELCOME'}</strong></span>
      </div>
      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="hero-kicker"><span /> YOUR NEXT ESCAPE</span>
          <h2>Chạm vào nhịp<br />thở của <em>sông Hàn.</em></h2>
          <p>Không gian nghỉ dưỡng tinh tế, nơi mỗi khoảnh khắc đều thuộc về riêng bạn.</p>
          <button className="button button-light" onClick={() => onNavigate('rooms')}>Khám phá phòng <Icon name="arrow" size={17} /></button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-sun" /><div className="hero-river" /><div className="hero-building building-one"><i /><i /><i /><i /></div><div className="hero-building building-two"><i /><i /><i /></div>
          <span className="hero-art-label">16° 03' 00.0" N<br />108° 13' 00.0" E</span>
        </div>
        <span className="hero-index">01 <i /> 03</span>
      </section>
      <form className="booking-search" onSubmit={onSearch}>
        <div className="search-intro"><span className="search-icon"><Icon name="calendar" /></span><span><strong>Lên kế hoạch nghỉ dưỡng</strong><small>Tìm không gian phù hợp với bạn</small></span></div>
        <label className="date-field"><small>NHẬN PHÒNG</small><input type="date" value={searchDates.checkin} onChange={(event) => setSearchDates({ ...searchDates, checkin: event.target.value })} /></label>
        <span className="date-separator" />
        <label className="date-field"><small>TRẢ PHÒNG</small><input type="date" value={searchDates.checkout} onChange={(event) => setSearchDates({ ...searchDates, checkout: event.target.value })} /></label>
        <button className="button button-primary search-submit" type="submit">Tìm phòng <Icon name="arrow" size={17} /></button>
      </form>
      <div className="section-heading"><div><span className="eyebrow">MAISON MOMENTS</span><h2>{isDemo ? 'Một kỳ nghỉ dành riêng cho bạn' : 'Không gian đang chờ bạn'}</h2></div><button className="text-link" onClick={() => onNavigate('rooms')}>Xem tất cả <Icon name="arrow" size={16} /></button></div>
      <div className="room-card-grid">
        {featured.length ? featured.map((room, index) => <RoomCard key={room.id} room={room} variant={index} onClick={() => onNavigate('rooms')} />) : <EmptyState title="Chưa có phòng để hiển thị" detail="Đăng nhập hoặc thử tải lại để xem danh sách phòng." />}
      </div>
      <div className="section-heading upcoming-heading"><div><span className="eyebrow">YOUR JOURNEY</span><h2>Kỳ nghỉ sắp tới</h2></div><button className="text-link" onClick={() => onNavigate('bookings')}>Tất cả đặt phòng <Icon name="arrow" size={16} /></button></div>
      {bookings.length ? <div className="upcoming-card">
        <div className="upcoming-date"><span>{new Intl.DateTimeFormat('vi-VN', { month: 'short' }).format(new Date(bookings[0].expected_checkin))}</span><strong>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit' }).format(new Date(bookings[0].expected_checkin))}</strong><small>{new Date(bookings[0].expected_checkin).getFullYear()}</small></div>
        <div className="upcoming-details"><span className="status-pill status-confirmed">{bookings[0].status === 'Confirmed' ? 'ĐÃ XÁC NHẬN' : bookings[0].status === 'Pending' ? 'CHỜ XÁC NHẬN' : bookings[0].status}</span><h3>{bookings[0].booking_details?.[0]?.rooms?.room_number ? `Phòng ${bookings[0].booking_details[0].rooms.room_number}` : 'Kỳ nghỉ tại Maison Riverside'}</h3><p>{formatDate(bookings[0].expected_checkin)} <span>→</span> {formatDate(bookings[0].expected_checkout)} <i /> Mã đặt phòng #{bookings[0].id}</p></div>
        {(bookings[0].status === 'Pending' || bookings[0].status === 'Confirmed') && <button className="button button-outline button-small" onClick={() => onCancel(bookings[0].id)}>Hủy đặt phòng</button>}
      </div> : <EmptyState title="Chưa có đặt phòng sắp tới" detail="Tìm phòng và lên kế hoạch cho kỳ nghỉ tiếp theo của bạn." action="Khám phá phòng" onAction={() => onNavigate('rooms')} />}
    </>
  )
}

function RoomCard({ room, variant, onClick }: { room: HotelRoom; variant: number; onClick: () => void }) {
  const type = room.room_types?.type_name ?? 'Phòng nghỉ Maison'
  const artClass = ['room-art-one', 'room-art-two', 'room-art-three'][variant % 3]
  return (
    <button className="room-card" onClick={onClick}>
      <div className={`room-card-art ${artClass}`}><span className="room-card-tag">MAISON SIGNATURE</span><span className="room-card-number">0{variant + 1}</span><div className="room-art-window"><span /></div></div>
      <div className="room-card-copy"><div><span className="room-type">{type.toUpperCase()}</span><h3>{room.room_types?.type_name ?? 'Phòng nghỉ tinh tế'}</h3></div><span className="room-card-arrow"><Icon name="arrow" size={17} /></span><div className="room-card-meta"><span><Icon name="users" size={15} /> {room.room_types?.capacity ?? 2} khách</span><span><strong>{formatMoney(room.room_types?.base_price)}</strong> / đêm</span></div></div>
    </button>
  )
}

function StaffOverview({ role, rooms, bookings, counts, onNavigate, onConfirm, isDemo, report, revenue30d }: {
  role: Role
  rooms: HotelRoom[]
  bookings: Booking[]
  counts: { total: number; available: number; occupied: number; maintenance: number }
  onNavigate: (id: PageId) => void
  onConfirm: (id: number) => void
  isDemo: boolean
  report: Record<string, unknown> | null
  revenue30d: number | null
}) {
  const isFrontDesk = role === 'Receptionist'
  const today = new Date().toDateString()
  const arrivalsToday = bookings.filter((booking) => new Date(booking.expected_checkin).toDateString() === today).length
  const metrics = isFrontDesk
    ? [{ label: 'Phòng đang hoạt động', value: `${counts.occupied} / ${counts.total}`, change: 'Tình trạng hiện tại', icon: 'bed', tone: 'sage' }, { label: 'Nhận phòng hôm nay', value: String(isDemo ? 8 : arrivalsToday).padStart(2, '0'), change: 'Theo lịch đặt phòng', icon: 'calendar', tone: 'blue' }, { label: 'Chờ xác nhận', value: String(isDemo ? 3 : bookings.filter((booking) => booking.status === 'Pending').length).padStart(2, '0'), change: 'Cần xử lý', icon: 'clock', tone: 'amber' }]
    : role === 'Manager'
      ? [{ label: 'Tổng số phòng', value: String(counts.total).padStart(2, '0'), change: `${counts.available} phòng sẵn sàng`, icon: 'bed', tone: 'sage' }, { label: 'Đang lưu trú', value: String(counts.occupied).padStart(2, '0'), change: 'Tình trạng hiện tại', icon: 'users', tone: 'blue' }, { label: 'Bảo trì', value: String(counts.maintenance).padStart(2, '0'), change: 'Phòng cần theo dõi', icon: 'wrench', tone: 'amber' }]
      : [{ label: 'Tài khoản hệ thống', value: isDemo ? '24' : '—', change: 'Tài khoản đã đăng ký', icon: 'users', tone: 'sage' }, { label: 'Phòng khách sạn', value: String(counts.total).padStart(2, '0'), change: `${counts.available} phòng sẵn sàng`, icon: 'bed', tone: 'blue' }, { label: 'Sự kiện hôm nay', value: isDemo ? '18' : '—', change: 'Hoạt động hệ thống', icon: 'clock', tone: 'amber' }]
  const summaryValue = isFrontDesk ? String(isDemo ? 8 : arrivalsToday).padStart(2, '0') : isDemo ? role === 'Manager' ? '128.450.000 ₫' : '86.200.000 ₫' : revenue30d === null ? '—' : formatMoney(revenue30d)
  return (
    <>
      <div className="page-heading staff-heading"><div><span className="eyebrow">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase()}</span><h1>{getGreeting(role)}</h1><p>{role === 'Receptionist' ? 'Đây là những gì đang diễn ra tại sảnh hôm nay.' : role === 'Manager' ? 'Theo dõi hiệu quả vận hành và kinh doanh trong ngày.' : 'Quản lý tổng thể hoạt động và người dùng hệ thống.'}</p></div><button className="button button-primary" onClick={() => onNavigate(isFrontDesk ? 'bookings' : role === 'Manager' ? 'reports' : 'accounts')}><Icon name={isFrontDesk ? 'plus' : role === 'Manager' ? 'chart' : 'users'} size={17} />{isFrontDesk ? 'Tạo đặt phòng' : role === 'Manager' ? 'Xem báo cáo' : 'Quản lý tài khoản'}</button></div>
      <section className="staff-welcome">
        <div><span className="hero-kicker"><span /> {isFrontDesk ? 'FRONT DESK OVERVIEW' : role === 'Manager' ? 'HOTEL PERFORMANCE' : 'SYSTEM OVERVIEW'}</span><h2>{isFrontDesk ? <>Sảnh đón khách<br /><em>đang nhộn nhịp.</em></> : role === 'Manager' ? <>Vận hành tốt,<br /><em>trải nghiệm tốt hơn.</em></> : <>Mọi thứ trong tầm<br /><em>kiểm soát của bạn.</em></>}</h2><p>{isFrontDesk ? 'Hãy bắt đầu ngày mới với nụ cười và một tách cà phê.' : 'Một góc nhìn rõ ràng cho những quyết định sáng suốt.'}</p></div>
        <div className="staff-welcome-stat"><span>{isFrontDesk ? 'KHÁCH NHẬN PHÒNG HÔM NAY' : 'DOANH THU 30 NGÀY'}</span><strong>{summaryValue}</strong><small>{isFrontDesk ? 'Theo lịch nhận phòng hôm nay' : isDemo ? <><b>↑ 12,8%</b> so với tuần trước</> : 'Tổng thanh toán đã ghi nhận'}</small><div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
        <span className="staff-decor-circle" />
      </section>
      <div className="metric-grid">
        {metrics.map((metric) => <div className="metric-card" key={metric.label}><span className={`metric-icon ${metric.tone}`}><Icon name={metric.icon} size={19} /></span><span className="metric-label">{metric.label}</span><strong>{metric.value}</strong><small>{metric.change}</small></div>)}
      </div>
      <div className="dashboard-columns">
        <section className="panel room-status-panel"><div className="panel-heading"><div><span className="eyebrow">{isFrontDesk ? 'LIVE FLOOR STATUS' : 'ROOM OVERVIEW'}</span><h2>Tình trạng phòng</h2></div><button className="text-link" onClick={() => onNavigate('rooms')}>Sơ đồ phòng <Icon name="arrow" size={15} /></button></div><div className="room-legend"><span><i className="legend-available" /> Sẵn sàng</span><span><i className="legend-occupied" /> Đang ở</span><span><i className="legend-maintenance" /> Bảo trì</span></div><div className="room-status-grid">{rooms.slice(0, 8).map((room) => <RoomTile room={room} key={room.id} />)}</div>{!rooms.length && <EmptyState title="Chưa có dữ liệu phòng" detail={isDemo ? 'Hãy đăng nhập để xem dữ liệu thực.' : 'Kiểm tra kết nối backend và thử tải lại.'} />}</section>
        <section className="panel arrival-panel"><div className="panel-heading"><div><span className="eyebrow">{isFrontDesk ? 'TODAY AT THE DESK' : 'BOOKING PIPELINE'}</span><h2>{isFrontDesk ? 'Đặt phòng gần đây' : 'Đơn mới nhất'}</h2></div><button className="icon-button subtle-icon" aria-label="Xem đặt phòng" onClick={() => onNavigate('bookings')}><Icon name="arrow" size={17} /></button></div><div className="arrival-list">{bookings.slice(0, 3).map((booking) => <div className="arrival-row" key={booking.id}><div className="arrival-avatar">{(booking.customers?.full_name ?? 'K').slice(0, 1)}</div><div className="arrival-info"><strong>{booking.customers?.full_name ?? `Đặt phòng #${booking.id}`}</strong><small>#{booking.id} <i /> Phòng {booking.booking_details?.[0]?.rooms?.room_number ?? '—'}</small></div><span className={`status-dot-label ${booking.status === 'Confirmed' ? 'text-green' : 'text-amber'}`}><i />{booking.status === 'Confirmed' ? 'Đã xác nhận' : booking.status === 'Pending' ? 'Chờ duyệt' : booking.status}</span>{booking.status === 'Pending' && <button className="approve-button" aria-label="Xác nhận" onClick={() => onConfirm(booking.id)}><Icon name="check" size={15} /></button>}</div>)}</div><button className="panel-bottom-link" onClick={() => onNavigate('bookings')}>Xem tất cả đặt phòng <Icon name="arrow" size={15} /></button></section>
      </div>
      <div className="quick-actions"><span className="eyebrow">LỐI TẮT</span><div><button onClick={() => onNavigate(isFrontDesk ? 'guests' : 'rooms')}><span className="quick-action-icon"><Icon name={isFrontDesk ? 'users' : 'bed'} /></span><span><strong>{isFrontDesk ? 'Tra cứu khách hàng' : 'Quản lý phòng'}</strong><small>{isFrontDesk ? 'Tìm hồ sơ khách lưu trú' : 'Cập nhật trạng thái phòng'}</small></span><Icon name="arrow" size={16} /></button><button onClick={() => onNavigate(isFrontDesk ? 'operations' : role === 'Manager' ? 'reports' : 'activity')}><span className="quick-action-icon"><Icon name={isFrontDesk ? 'sparkle' : role === 'Manager' ? 'chart' : 'clock'} /></span><span><strong>{isFrontDesk ? 'Danh sách buồng phòng' : role === 'Manager' ? 'Phân tích doanh thu' : 'Nhật ký hệ thống'}</strong><small>{isFrontDesk ? 'Theo dõi yêu cầu dọn phòng' : 'Xem thông tin chi tiết'}</small></span><Icon name="arrow" size={16} /></button></div></div>
      {!isDemo && report && <span className="sr-only">Báo cáo đã tải: {JSON.stringify(report)}</span>}
    </>
  )
}

function RoomTile({ room }: { room: HotelRoom }) {
  const status = room.technical_status !== 'NORMAL' ? 'maintenance' : room.operational_status === 'OCCUPIED' ? 'occupied' : room.cleaning_status !== 'CLEAN' ? 'dirty' : 'available'
  const statusLabel = status === 'maintenance' ? 'Bảo trì' : status === 'occupied' ? 'Đang ở' : status === 'dirty' ? 'Chờ dọn' : 'Sẵn sàng'
  return <div className={`room-tile tile-${status}`}><span className="room-tile-number">{room.room_number}</span><span className="room-tile-status"><i />{statusLabel}</span></div>
}

type RoomDraft = {
  id?: number
  room_number: string
  room_type_id: string
  operational_status: string
  cleaning_status: string
  technical_status: string
}

function RoomsPage({ rooms, role, searched, session, onUpdate, onRefresh, onLogin }: {
  rooms: HotelRoom[]
  role: Role
  searched: boolean
  session: Session | null
  onUpdate: (room: HotelRoom) => void
  onRefresh: () => Promise<void>
  onLogin: () => void
}) {
  const [roomTypes, setRoomTypes] = useState<PublicRoomType[]>([])
  const [draft, setDraft] = useState<RoomDraft | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const canManage = role === 'Manager' || role === 'Admin'

  useEffect(() => {
    if (!session || !canManage) return
    apiRequest<PublicRoomType[]>('/room-types', session).then(setRoomTypes).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Không tải được loại phòng')
    })
  }, [canManage, session])

  const startCreate = () => {
    setError('')
    setDraft({
      room_number: '',
      room_type_id: roomTypes[0] ? String(roomTypes[0].id) : '',
      operational_status: 'AVAILABLE',
      cleaning_status: 'CLEAN',
      technical_status: 'NORMAL',
    })
  }

  const startEdit = (room: HotelRoom) => {
    setError('')
    setDraft({
      id: room.id,
      room_number: room.room_number,
      room_type_id: String(room.room_type_id ?? ''),
      operational_status: room.operational_status ?? 'AVAILABLE',
      cleaning_status: room.cleaning_status ?? 'CLEAN',
      technical_status: room.technical_status ?? 'NORMAL',
    })
  }

  const saveRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !draft) return
    setBusy(true)
    setError('')
    try {
      const body = {
        room_number: draft.room_number.trim(),
        room_type_id: Number(draft.room_type_id),
        operational_status: draft.operational_status,
        cleaning_status: draft.cleaning_status,
        technical_status: draft.technical_status,
      }
      await apiRequest(draft.id ? `/rooms/${draft.id}` : '/rooms', session, {
        method: draft.id ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      })
      setDraft(null)
      await onRefresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không lưu được phòng')
    } finally {
      setBusy(false)
    }
  }

  const deleteRoom = async (room: HotelRoom) => {
    if (!session || !window.confirm(`Xóa phòng ${room.room_number}? Chỉ phòng chưa có lịch sử nghiệp vụ mới xóa được.`)) return
    setError('')
    try {
      await apiRequest(`/rooms/${room.id}`, session, { method: 'DELETE' })
      await onRefresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không xóa được phòng')
    }
  }

  return (
    <>
      <div className="page-heading staff-heading"><div><span className="eyebrow">MAISON RIVERSIDE · INVENTORY</span><h1>{role === 'Customer' ? 'Khám phá không gian nghỉ dưỡng' : 'Sơ đồ phòng khách sạn'}</h1><p>{searched ? 'Kết quả phòng theo khoảng ngày bạn đã chọn.' : canManage ? 'Thêm, chỉnh sửa phòng và quản lý đầy đủ trạng thái vận hành.' : 'Theo dõi trạng thái phòng và tình hình sẵn sàng trong ngày.'}</p></div>{canManage && <button className="button button-primary" onClick={startCreate}><Icon name="plus" size={17} />Thêm phòng</button>}</div>
      <div className="room-page-toolbar"><div className="room-legend"><span><i className="legend-available" /> Sẵn sàng</span><span><i className="legend-occupied" /> Đang ở</span><span><i className="legend-maintenance" /> Bảo trì</span><span><i className="legend-dirty" /> Chờ dọn</span></div><span className="result-count">{rooms.length} phòng</span></div>
      {error && <div className="api-error" role="alert">{error}</div>}
      {rooms.length ? <div className="room-list">{rooms.map((room) => <article className="room-list-card" key={room.id}><div className={`room-list-art room-art-${room.id % 3}`}><span>{room.room_types?.type_name ?? 'MAISON ROOM'}</span><span className="room-list-number">{room.room_number}</span></div><div className="room-list-main"><span className="eyebrow">ROOM {room.room_number}</span><h3>{room.room_types?.type_name ?? 'Phòng nghỉ'}</h3><p><Icon name="users" size={15} /> Sức chứa {room.room_types?.capacity ?? '—'} khách <i /> Tầng {room.room_number.slice(0, 1)}</p><div className="room-status-pills"><RoomTile room={room} /></div></div><div className="room-list-price"><span>GIÁ MỖI ĐÊM</span><strong>{formatMoney(room.room_types?.base_price)}</strong><small>Đã bao gồm thuế & phí</small>{canManage ? <div className="management-actions"><button className="button button-outline button-small" onClick={() => startEdit(room)}>Sửa phòng / trạng thái</button><button className="table-action subtle" onClick={() => void deleteRoom(room)}>Xóa phòng</button></div> : role === 'Customer' ? <button className="button button-primary button-small" onClick={onLogin}>Đặt phòng <Icon name="arrow" size={15} /></button> : <button className="button button-outline button-small" onClick={() => onUpdate(room)}>Đổi trạng thái dọn</button>}</div></article>)}</div> : <EmptyState title="Không tìm thấy phòng phù hợp" detail="Thử chọn khoảng ngày khác hoặc tải lại danh sách phòng." action="Thử lại" onAction={() => window.location.reload()} />}
      {draft && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null) }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="room-dialog-title"><button className="icon-button modal-close" type="button" aria-label="Đóng" onClick={() => setDraft(null)}><Icon name="close" /></button><span className="eyebrow">ROOM INVENTORY</span><h2 id="room-dialog-title">{draft.id ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h2><form className="management-form" onSubmit={saveRoom}><label>Số phòng<input required maxLength={10} value={draft.room_number} onChange={(event) => setDraft({ ...draft, room_number: event.target.value })} /></label><label>Loại phòng<select required value={draft.room_type_id} onChange={(event) => setDraft({ ...draft, room_type_id: event.target.value })}>{roomTypes.map((type) => <option key={type.id} value={type.id}>{type.type_name}</option>)}</select></label><label>Trạng thái vận hành<select value={draft.operational_status} onChange={(event) => setDraft({ ...draft, operational_status: event.target.value })}><option value="AVAILABLE">Sẵn sàng</option><option value="RESERVED">Đã đặt</option><option value="OCCUPIED">Đang ở</option></select></label><label>Trạng thái vệ sinh<select value={draft.cleaning_status} onChange={(event) => setDraft({ ...draft, cleaning_status: event.target.value })}><option value="CLEAN">Sạch</option><option value="DIRTY">Chờ dọn</option><option value="CLEANING">Đang dọn</option></select></label><label>Trạng thái kỹ thuật<select value={draft.technical_status} onChange={(event) => setDraft({ ...draft, technical_status: event.target.value })}><option value="NORMAL">Bình thường</option><option value="MAINTENANCE">Đang bảo trì</option><option value="OUT_OF_SERVICE">Ngừng phục vụ</option></select></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="management-form-actions"><button className="button button-outline" type="button" onClick={() => setDraft(null)}>Hủy</button><button className="button button-primary" disabled={busy || !roomTypes.length}>{busy ? 'Đang lưu…' : 'Lưu phòng'}</button></div></form></section></div>}
    </>
  )
}

function BookingsPage({ bookings, role, onConfirm, onCancel, isDemo }: { bookings: Booking[]; role: Role; onConfirm: (id: number) => void; onCancel: (id: number) => void; isDemo: boolean }) {
  return (
    <>
      <div className="page-heading staff-heading"><div><span className="eyebrow">{role === 'Customer' ? 'YOUR STAYS' : 'RESERVATION MANAGEMENT'}</span><h1>{role === 'Customer' ? 'Đặt phòng của tôi' : 'Quản lý đặt phòng'}</h1><p>{role === 'Customer' ? 'Những hành trình đáng nhớ của bạn, tất cả ở một nơi.' : 'Theo dõi, xác nhận và hỗ trợ các kỳ lưu trú.'}</p></div>{role === 'Customer' && <span className="member-chip"><span>✦</span> MAISON MEMBER <strong>GOLD</strong></span>}</div>
      <div className="booking-filter-row"><button className="filter-chip filter-active">Tất cả <span>{bookings.length}</span></button><button className="filter-chip">Sắp tới</button><button className="filter-chip">Đã hoàn thành</button><button className="filter-chip">Đã hủy</button><span className="filter-spacer" /><button className="button button-outline button-small"><Icon name="search" size={15} /> Tìm kiếm</button></div>
      <div className="booking-table-wrap"><table className="data-table"><thead><tr><th>MÃ ĐẶT PHÒNG</th><th>{role === 'Customer' ? 'PHÒNG NGHỈ' : 'KHÁCH HÀNG'}</th><th>NHẬN PHÒNG</th><th>TRẢ PHÒNG</th><th>TRẠNG THÁI</th><th /></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td><strong className="booking-id">#{booking.id}</strong></td><td><strong>{role === 'Customer' ? `Phòng ${booking.booking_details?.[0]?.rooms?.room_number ?? '—'}` : booking.customers?.full_name ?? 'Khách lưu trú'}</strong><small className="table-sub">{role === 'Customer' ? 'Maison Riverside' : `Phòng ${booking.booking_details?.[0]?.rooms?.room_number ?? '—'}`}</small></td><td>{formatDate(booking.expected_checkin)}</td><td>{formatDate(booking.expected_checkout)}</td><td><span className={`status-pill ${booking.status === 'Confirmed' ? 'status-confirmed' : booking.status === 'Pending' ? 'status-pending' : 'status-cancelled'}`}>{booking.status === 'Confirmed' ? 'Đã xác nhận' : booking.status === 'Pending' ? 'Chờ xác nhận' : booking.status}</span></td><td className="table-action-cell">{booking.status === 'Pending' && role !== 'Customer' && <button className="table-action" onClick={() => onConfirm(booking.id)}>Xác nhận</button>}{booking.status !== 'Cancelled' && role === 'Customer' && <button className="table-action subtle" onClick={() => onCancel(booking.id)}>Hủy</button>}</td></tr>)}</tbody></table>
        {!bookings.length && <EmptyState title="Chưa có đặt phòng nào" detail={isDemo ? 'Đăng nhập để xem lịch sử thật hoặc tiếp tục khám phá các phòng nghỉ.' : 'Các đặt phòng mới sẽ xuất hiện ở đây.'} />}
      </div>
      <div className="booking-footnote"><span><Icon name="clock" size={15} /> Cập nhật lần cuối: vừa xong</span>{isDemo && <span>Dữ liệu xem trước</span>}</div>
    </>
  )
}

function GuestsPage({ session, onLogin }: { session: Session | null; onLogin: () => void }) {
  const [query, setQuery] = useState('')
  const [guests, setGuests] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null)
  const [busy, setBusy] = useState(false)
  const canManage = session?.role === 'Manager' || session?.role === 'Admin'

  const loadGuests = useCallback(async (term: string) => {
    if (!session) return
    try {
      setError('')
      setGuests(await apiRequest<Record<string, unknown>[]>(`/customers?search=${encodeURIComponent(term)}`, session))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải khách hàng')
    }
  }, [session])

  useEffect(() => {
    if (!session) return
    let active = true
    void Promise.resolve().then(() => {
      if (active) return loadGuests('')
      return undefined
    })
    return () => { active = false }
  }, [loadGuests, session])

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) {
      onLogin()
      return
    }
    await loadGuests(query)
  }
  const saveGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !draft) return
    setBusy(true)
    setError('')
    try {
      const body = {
        full_name: String(draft.full_name ?? '').trim(),
        phone: String(draft.phone ?? '').trim(),
        cccd_passport: String(draft.cccd_passport ?? '').trim(),
        email: String(draft.email ?? '').trim() || null,
      }
      await apiRequest(draft.id ? `/customers/${draft.id}` : '/customers', session, {
        method: draft.id ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      })
      setDraft(null)
      await loadGuests(query)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không lưu được khách hàng')
    } finally {
      setBusy(false)
    }
  }

  const deleteGuest = async (guest: Record<string, unknown>) => {
    if (!session || !window.confirm(`Xóa hồ sơ khách ${String(guest.full_name ?? '')}? Khách có lịch sử đặt phòng sẽ được database bảo vệ.`)) return
    try {
      setError('')
      await apiRequest(`/customers/${guest.id}`, session, { method: 'DELETE' })
      await loadGuests(query)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không xóa được khách hàng')
    }
  }

  return <>
    <div className="page-heading staff-heading"><div><span className="eyebrow">GUEST RELATIONS</span><h1>Khách hàng</h1><p>Tìm kiếm và quản lý hồ sơ khách lưu trú tại Maison.</p></div>{canManage && <button className="button button-primary" onClick={() => { setError(''); setDraft({ full_name: '', phone: '', cccd_passport: '', email: '' }) }}><Icon name="plus" size={17} />Thêm khách hàng</button>}</div>
    <form className="guest-search" onSubmit={search}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, số điện thoại hoặc CCCD..." /><button className="button button-primary button-small">Tìm kiếm</button></form>
    {error && <div className="api-error" role="alert">{error}</div>}
    {guests.length > 0 && <div className="booking-table-wrap"><table className="data-table"><thead><tr><th>HỌ TÊN</th><th>EMAIL</th><th>SỐ ĐIỆN THOẠI</th><th>CCCD / HỘ CHIẾU</th>{canManage && <th>THAO TÁC</th>}</tr></thead><tbody>{guests.map((guest) => <tr key={String(guest.id)}><td><strong>{String(guest.full_name ?? '')}</strong></td><td>{String(guest.email ?? '—')}</td><td>{String(guest.phone ?? '—')}</td><td>{String(guest.cccd_passport ?? '—')}</td>{canManage && <td className="table-action-cell"><button className="table-action" onClick={() => { setError(''); setDraft({ ...guest }) }}>Sửa</button><button className="table-action subtle" onClick={() => void deleteGuest(guest)}>Xóa</button></td>}</tr>)}</tbody></table></div>}
    {!guests.length && <EmptyState title={query ? 'Không tìm thấy khách hàng' : 'Chưa có hồ sơ khách hàng'} detail={query ? 'Thử từ khóa khác để tìm hồ sơ khách.' : 'Hồ sơ khách hàng sẽ hiển thị tại đây.'} />}
    {draft && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null) }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="guest-dialog-title"><button className="icon-button modal-close" type="button" aria-label="Đóng" onClick={() => setDraft(null)}><Icon name="close" /></button><span className="eyebrow">GUEST RELATIONS</span><h2 id="guest-dialog-title">{draft.id ? 'Sửa hồ sơ khách' : 'Thêm khách hàng'}</h2><form className="management-form" onSubmit={saveGuest}><label>Họ và tên<input required maxLength={100} value={String(draft.full_name ?? '')} onChange={(event) => setDraft({ ...draft, full_name: event.target.value })} /></label><label>Số điện thoại<input required maxLength={15} value={String(draft.phone ?? '')} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><label>CCCD / Hộ chiếu<input required maxLength={50} value={String(draft.cccd_passport ?? '')} onChange={(event) => setDraft({ ...draft, cccd_passport: event.target.value })} /></label><label>Email<input type="email" maxLength={100} value={String(draft.email ?? '')} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="management-form-actions"><button className="button button-outline" type="button" onClick={() => setDraft(null)}>Hủy</button><button className="button button-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu khách hàng'}</button></div></form></section></div>}
  </>
}

type LeaveRequest = {
  id: number
  employee_id: number
  start_date: string
  end_date: string
  reason: string | null
  status: string | null
  approved_by: number | null
  created_at: string | null
}

type EmployeeRecord = {
  id: number
  user_id: number
  full_name: string
}

type LeaveDraft = {
  id?: number
  employee_id: string
  start_date: string
  end_date: string
  reason: string
  status: string
}

function LeaveRequestsPage({ session }: { session: Session }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [draft, setDraft] = useState<LeaveDraft | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError('')
      const [leaveRequests, staff] = await Promise.all([
        apiRequest<LeaveRequest[]>('/leave-requests', session),
        apiRequest<EmployeeRecord[]>('/employees', session),
      ])
      setRequests(leaveRequests)
      setEmployees(staff)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được dữ liệu nghỉ phép')
    }
  }, [session])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (active) return loadData()
      return undefined
    })
    return () => { active = false }
  }, [loadData])

  const saveRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      const original = requests.find((request) => request.id === draft.id)
      const body: Record<string, string | number | null> = {
        employee_id: Number(draft.employee_id),
        start_date: draft.start_date,
        end_date: draft.end_date,
        reason: draft.reason.trim() || null,
        status: draft.status,
      }
      if (draft.id && original?.status !== draft.status) {
        if (draft.status === 'Approved' || draft.status === 'Rejected') {
          const currentEmployee = employees.find((employee) => employee.user_id === session.userId)
          if (!currentEmployee) {
            throw new Error('Tài khoản quản lý cần có hồ sơ nhân viên để ghi nhận người duyệt.')
          }
          body.approved_by = currentEmployee.id
        } else {
          body.approved_by = null
        }
      }
      await apiRequest(draft.id ? `/leave-requests/${draft.id}` : '/leave-requests', session, {
        method: draft.id ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      })
      setDraft(null)
      await loadData()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không lưu được yêu cầu nghỉ phép')
    } finally {
      setBusy(false)
    }
  }

  const deleteRequest = async (request: LeaveRequest) => {
    if (!window.confirm(`Xóa yêu cầu nghỉ phép #${request.id}?`)) return
    try {
      setError('')
      await apiRequest(`/leave-requests/${request.id}`, session, { method: 'DELETE' })
      await loadData()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không xóa được yêu cầu')
    }
  }

  return <>
    <div className="page-heading staff-heading"><div><span className="eyebrow">PEOPLE & ATTENDANCE</span><h1>Nghỉ phép nhân viên</h1><p>Theo dõi yêu cầu, chỉnh sửa thời gian và phê duyệt nghỉ phép.</p></div><button className="button button-primary" onClick={() => { setError(''); setDraft({ employee_id: employees[0] ? String(employees[0].id) : '', start_date: '', end_date: '', reason: '', status: 'Pending' }) }}><Icon name="plus" size={17} />Tạo yêu cầu</button></div>
    {error && <div className="api-error" role="alert">{error}<button onClick={() => void loadData()}>Tải lại</button></div>}
    <div className="booking-table-wrap"><table className="data-table"><thead><tr><th>NHÂN VIÊN</th><th>TỪ NGÀY</th><th>ĐẾN NGÀY</th><th>LÝ DO</th><th>TRẠNG THÁI</th><th>NGƯỜI DUYỆT</th><th>THAO TÁC</th></tr></thead><tbody>{requests.map((request) => {
      const status = request.status ?? 'Pending'
      const employee = employees.find((entry) => entry.id === request.employee_id)
      const approver = employees.find((entry) => entry.id === request.approved_by)
      return <tr key={request.id}><td><strong>{employee?.full_name ?? `Nhân viên #${request.employee_id}`}</strong></td><td>{formatDate(request.start_date)}</td><td>{formatDate(request.end_date)}</td><td>{request.reason || '—'}</td><td><span className={`status-pill ${status === 'Approved' ? 'status-confirmed' : status === 'Rejected' ? 'status-cancelled' : 'status-pending'}`}>{status === 'Approved' ? 'Đã duyệt' : status === 'Rejected' ? 'Từ chối' : 'Chờ duyệt'}</span></td><td>{approver?.full_name ?? '—'}</td><td className="table-action-cell"><button className="table-action" onClick={() => { setError(''); setDraft({ id: request.id, employee_id: String(request.employee_id), start_date: request.start_date.slice(0, 10), end_date: request.end_date.slice(0, 10), reason: request.reason ?? '', status }) }}>Sửa / duyệt</button><button className="table-action subtle" onClick={() => void deleteRequest(request)}>Xóa</button></td></tr>
    })}</tbody></table>{!requests.length && <EmptyState title="Chưa có yêu cầu nghỉ phép" detail="Tạo yêu cầu mới để bắt đầu theo dõi nghỉ phép nhân viên." />}</div>
    {draft && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null) }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title"><button className="icon-button modal-close" type="button" aria-label="Đóng" onClick={() => setDraft(null)}><Icon name="close" /></button><span className="eyebrow">LEAVE REQUEST</span><h2 id="leave-dialog-title">{draft.id ? 'Cập nhật / duyệt nghỉ phép' : 'Tạo yêu cầu nghỉ phép'}</h2><form className="management-form" onSubmit={saveRequest}><label>Nhân viên<select required value={draft.employee_id} onChange={(event) => setDraft({ ...draft, employee_id: event.target.value })}>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label><div className="management-form-grid"><label>Từ ngày<input type="date" required value={draft.start_date} onChange={(event) => setDraft({ ...draft, start_date: event.target.value })} /></label><label>Đến ngày<input type="date" required min={draft.start_date || undefined} value={draft.end_date} onChange={(event) => setDraft({ ...draft, end_date: event.target.value })} /></label></div><label>Lý do<textarea rows={3} value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} /></label>{draft.id ? <label>Trạng thái<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}><option value="Pending">Chờ duyệt</option><option value="Approved">Đã duyệt</option><option value="Rejected">Từ chối</option></select></label> : <p className="leave-default-status">Yêu cầu mới sẽ được tạo ở trạng thái chờ duyệt.</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="management-form-actions"><button className="button button-outline" type="button" onClick={() => setDraft(null)}>Hủy</button><button className="button button-primary" disabled={busy || !employees.length}>{busy ? 'Đang lưu…' : 'Lưu yêu cầu'}</button></div></form></section></div>}
  </>
}

function OperationsPage({ role, isDemo, session, onLogin }: { role: Role; isDemo: boolean; session: Session | null; onLogin: () => void }) {
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (!session) return
    const endpoint = role === 'Manager' ? '/maintenance-requests' : '/housekeeping-tasks'
    apiRequest<Record<string, unknown>[]>(endpoint, session).then(setTasks).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Không thể tải công việc'))
  }, [role, session])
  const isMaintenance = role === 'Manager'
  return <><div className="page-heading staff-heading"><div><span className="eyebrow">HOTEL OPERATIONS</span><h1>{isMaintenance ? 'Theo dõi bảo trì' : 'Buồng phòng'}</h1><p>{isMaintenance ? 'Quản lý sự cố kỹ thuật và tình trạng thiết bị.' : 'Theo dõi tiến độ dọn dẹp và chuẩn bị phòng.'}</p></div><button className="button button-primary" onClick={onLogin}><Icon name="plus" size={17} />{isMaintenance ? 'Báo sự cố mới' : 'Tạo yêu cầu dọn phòng'}</button></div><div className="ops-summary"><div><span className="metric-icon amber"><Icon name={isMaintenance ? 'wrench' : 'sparkle'} /></span><strong>{isDemo ? '04' : String(tasks.length).padStart(2, '0')}</strong><small>{isMaintenance ? 'Yêu cầu cần xử lý' : 'Phòng cần dọn'}</small></div><div><span className="metric-icon sage"><Icon name="check" /></span><strong>{isDemo ? '12' : '—'}</strong><small>Hoàn tất hôm nay</small></div><div><span className="metric-icon blue"><Icon name="clock" /></span><strong>02</strong><small>Đang thực hiện</small></div></div>{error && <div className="api-error">{error}</div>}<div className="panel task-panel"><div className="panel-heading"><div><span className="eyebrow">WORK QUEUE</span><h2>{isMaintenance ? 'Yêu cầu gần đây' : 'Danh sách công việc'}</h2></div><button className="button button-outline button-small">Tất cả trạng thái</button></div>{tasks.length ? tasks.slice(0, 8).map((task) => <div className="task-row" key={String(task.id)}><span className={`task-symbol ${isMaintenance ? 'task-symbol-amber' : ''}`}><Icon name={isMaintenance ? 'wrench' : 'sparkle'} size={17} /></span><span><strong>{String(task.issue_description ?? task.notes ?? `Phòng ${task.room_id ?? '—'} · ${task.status ?? ''}`)}</strong><small>Phòng {String(task.room_id ?? '—')} <i /> {String(task.status ?? '')}</small></span><span className="status-pill status-pending">{String(task.status ?? 'Pending')}</span></div>) : isDemo ? <><div className="task-row"><span className="task-symbol"><Icon name="sparkle" size={17} /></span><span><strong>Chuẩn bị phòng 305 cho khách mới</strong><small>Phòng 305 <i /> Ưu tiên cao</small></span><span className="status-pill status-pending">Chờ xử lý</span></div><div className="task-row"><span className="task-symbol task-symbol-blue"><Icon name="sparkle" size={17} /></span><span><strong>Thay mới khăn tắm — phòng 208</strong><small>Phòng 208 <i /> Đã giao nhân viên</small></span><span className="status-pill status-confirmed">Đang thực hiện</span></div><div className="task-row"><span className="task-symbol task-symbol-amber"><Icon name="wrench" size={17} /></span><span><strong>Kiểm tra điều hòa — phòng 401</strong><small>Phòng 401 <i /> Bảo trì</small></span><span className="status-pill status-pending">Đang xử lý</span></div></> : <EmptyState title="Chưa có công việc nào" detail="Các yêu cầu mới sẽ hiển thị tại đây." />}</div></>
}

function ReportsPage({ isDemo, report, revenue30d, revenueDaily, rooms, bookings }: { isDemo: boolean; report: Record<string, unknown> | null; revenue30d: number | null; revenueDaily: Array<{ date: string; revenue: number }>; rooms: HotelRoom[]; bookings: Booking[] }) {
  const operational = Array.isArray(report?.operational) ? report.operational as Array<{ status: string; count: number }> : []
  const occupied = operational.find((entry) => entry.status === 'OCCUPIED')?.count ?? 0
  const occupancyRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0
  const demoValues = [38, 52, 45, 70, 56, 82, 63, 48, 76, 62, 90, 72, 58, 84, 66, 97, 72, 87, 60, 78]
  const actualMax = Math.max(1, ...revenueDaily.map((entry) => entry.revenue))
  const barValues = isDemo ? demoValues : revenueDaily.map((entry) => Math.max(6, Math.round((entry.revenue / actualMax) * 100)))
  return <>
    <div className="page-heading staff-heading"><div><span className="eyebrow">BUSINESS INTELLIGENCE</span><h1>Báo cáo & phân tích</h1><p>Theo dõi hiệu quả hoạt động và đưa ra quyết định chính xác.</p></div><button className="button button-outline"><Icon name="calendar" size={16} /> 30 ngày gần nhất</button></div>
    <div className="report-highlight"><div><span className="hero-kicker"><span /> REVENUE OVERVIEW</span><h2>Doanh thu vận hành<br /><em>30 ngày gần nhất.</em></h2><p>Dữ liệu tổng hợp từ các giao dịch thanh toán thực tế.</p><strong>{isDemo ? '2.846.500.000 ₫' : revenue30d === null ? '—' : formatMoney(revenue30d)}</strong></div><div className="report-bars">{barValues.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}{!isDemo && !revenueDaily.length && <span className="chart-empty">Chưa có thanh toán</span>}<div className="chart-months"><span>{isDemo ? '01 THG 10' : revenueDaily[0]?.date.slice(5) ?? '30 NGÀY TRƯỚC'}</span><span>{isDemo ? '15 THG 10' : 'THEO NGÀY'}</span><span>{isDemo ? '31 THG 10' : revenueDaily[revenueDaily.length - 1]?.date.slice(5) ?? 'HÔM NAY'}</span></div></div></div>
    <div className="metric-grid report-metrics">
      <div className="metric-card"><span className="metric-icon sage"><Icon name="bed" /></span><span className="metric-label">Tỷ lệ lấp đầy</span><strong>{isDemo ? '78,4%' : `${occupancyRate}%`}</strong><small>{isDemo ? '↑ 6,2% so với tháng trước' : `${occupied} phòng đang có khách`}</small></div>
      <div className="metric-card"><span className="metric-icon blue"><Icon name="calendar" /></span><span className="metric-label">Đặt phòng</span><strong>{isDemo ? '324' : bookings.length}</strong><small>Trong kỳ báo cáo</small></div>
      <div className="metric-card"><span className="metric-icon amber"><Icon name="users" /></span><span className="metric-label">Phòng sẵn sàng</span><strong>{isDemo ? '92%' : rooms.filter((room) => room.operational_status === 'AVAILABLE' && room.technical_status === 'NORMAL').length}</strong><small>{isDemo ? 'Điểm hài lòng khách' : 'Phòng có thể nhận khách'}</small></div>
    </div>
    <div className="panel report-note"><span className="metric-icon sage"><Icon name="chart" /></span><div><strong>Góc nhìn của quản lý</strong><p>{isDemo ? 'Cuối tuần tiếp tục là thời điểm có nhu cầu cao. Cân nhắc tối ưu giá phòng Suite và bổ sung nhân sự buồng phòng cho ca chiều.' : 'Số liệu thực được tải từ API backend trong 30 ngày gần nhất.'}</p></div><span className={`status-pill ${isDemo ? 'status-pending' : 'status-confirmed'}`}>{isDemo ? 'Dữ liệu mẫu' : 'Live data'}</span></div>
  </>
}

function ResourcePage({ title, description, rows, resource, isDemo, onLogin }: { title: string; description: string; rows: Record<string, unknown>[]; resource: string; isDemo: boolean; onLogin: () => void }) {
  const headings = resource === '/users' ? ['TÀI KHOẢN', 'EMAIL', 'VAI TRÒ', 'TRẠNG THÁI'] : ['NGƯỜI DÙNG', 'THAO TÁC', 'PHÂN HỆ', 'THỜI GIAN']
  return <><div className="page-heading staff-heading"><div><span className="eyebrow">SYSTEM ADMINISTRATION</span><h1>{title}</h1><p>{description}</p></div><button className="button button-primary" onClick={onLogin}><Icon name={resource === '/users' ? 'plus' : 'clock'} size={16} />{resource === '/users' ? 'Tạo tài khoản' : 'Làm mới nhật ký'}</button></div><div className="resource-stats"><div><span>{resource === '/users' ? 'TỔNG TÀI KHOẢN' : 'HOẠT ĐỘNG HÔM NAY'}</span><strong>{isDemo ? '24' : rows.length}</strong></div><div><span>{resource === '/users' ? 'ĐANG HOẠT ĐỘNG' : 'NGƯỜI DÙNG DUY NHẤT'}</span><strong>{isDemo ? '21' : '—'}</strong></div><div><span>{resource === '/users' ? 'ĐĂNG NHẬP GẦN NHẤT' : 'TRẠNG THÁI'}</span><strong>{isDemo ? '09:42' : 'Đang hoạt động'}</strong></div></div><div className="booking-table-wrap"><table className="data-table"><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.slice(0, 12).map((row, index) => <tr key={String(row.id ?? index)}>{resource === '/users' ? <><td><strong>{String(row.username ?? '—')}</strong><small className="table-sub">ID #{String(row.id)}</small></td><td>{String(row.email ?? '—')}</td><td>{String((row.roles as Record<string, unknown> | undefined)?.role_name ?? '—')}</td><td><span className="status-pill status-confirmed">{row.is_active ? 'Hoạt động' : 'Tạm khóa'}</span></td></> : <><td><strong>{String(row.user_id ?? '—')}</strong></td><td>{String(row.action ?? '—')}</td><td>{String(row.module ?? '—')}</td><td>{formatDate(String(row.created_at ?? ''))}</td></>}</tr>)}</tbody></table>{!rows.length && <EmptyState title={isDemo ? 'Bản xem trước quản trị' : 'Chưa có dữ liệu'} detail={isDemo ? 'Đăng nhập bằng tài khoản quản trị để xem dữ liệu hệ thống thật.' : 'Dữ liệu sẽ hiển thị sau khi có hoạt động.'} action={isDemo ? 'Đăng nhập quản trị' : undefined} onAction={onLogin} />}</div></>
}

function SettingsPage({ isDemo, onLogin }: { isDemo: boolean; onLogin: () => void }) {
  return <><div className="page-heading staff-heading"><div><span className="eyebrow">SYSTEM PREFERENCES</span><h1>Cấu hình hệ thống</h1><p>Thiết lập các thông tin vận hành cho khách sạn.</p></div><button className="button button-primary" onClick={onLogin}>Lưu thay đổi</button></div><div className="settings-layout"><div className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">GENERAL</span><h2>Thông tin khách sạn</h2></div></div><label>Tên khách sạn<input defaultValue="Maison Riverside" disabled={isDemo} /></label><label>Giờ nhận phòng<input defaultValue="14:00" disabled={isDemo} /></label><label>Giờ trả phòng<input defaultValue="12:00" disabled={isDemo} /></label><label>Tiền tệ<select defaultValue="VND" disabled={isDemo}><option value="VND">VND — Việt Nam Đồng</option></select></label></div><div className="settings-info"><span className="metric-icon blue"><Icon name="settings" /></span><h3>Cấu hình linh hoạt</h3><p>Điều chỉnh chính sách nhận trả phòng và thông tin cơ sở lưu trú tại một nơi.</p><span className="status-pill status-pending">{isDemo ? 'Chế độ xem trước' : 'Sẵn sàng cập nhật'}</span></div></div></>
}

function EmptyState({ title, detail, action, onAction }: { title: string; detail: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><span className="empty-state-icon"><Icon name="bed" size={21} /></span><strong>{title}</strong><p>{detail}</p>{action && onAction && <button className="text-link" onClick={onAction}>{action} <Icon name="arrow" size={15} /></button>}</div>
}

function PublicLanding({ roomTypes, availableRooms, searchDates, setSearchDates, onSearch, onLogin, onRegister, apiError }: {
  roomTypes: PublicRoomType[]
  availableRooms: HotelRoom[]
  searchDates: { checkin: string; checkout: string }
  setSearchDates: (value: { checkin: string; checkout: string }) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
  onLogin: () => void
  onRegister: () => void
  apiError: string
}) {
  const checkinMin = new Date().toLocaleDateString('sv-SE')
  const checkoutMin = searchDates.checkin || checkinMin
  return (
    <main className="public-site">
      <header className="public-header">
        <a className="public-brand" href="#home" aria-label="Maison Riverside - Trang chủ">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy"><strong>MAISON</strong><small>HOTEL & RESIDENCE</small></span>
        </a>
        <nav className="public-nav" aria-label="Điều hướng">
          <a href="#stay">Phòng nghỉ</a><a href="#experience">Trải nghiệm</a><a href="#location">Vị trí</a>
        </nav>
        <div className="public-header-actions">
          <button className="public-text-button" onClick={onLogin}>Đăng nhập</button>
          <button className="button button-primary public-header-cta" onClick={() => document.getElementById('public-search')?.scrollIntoView({ behavior: 'smooth' })}>Tìm phòng <Icon name="arrow" size={16} /></button>
        </div>
      </header>

      <section className="public-hero" id="home">
        <div className="public-hero-content">
          <span className="public-kicker"><Icon name="leaf" size={15} /> A RIVERSIDE RETREAT IN DA NANG</span>
          <h1>Chạm vào nhịp<br />thở của <em>sông Hàn.</em></h1>
          <p>Trở về với những ngày thật chậm, trong không gian nghỉ dưỡng tinh tế bên dòng sông của thành phố.</p>
          <a className="public-discover" href="#stay">Khám phá Maison <span><Icon name="arrow" size={16} /></span></a>
        </div>
        <div className="public-hero-art" aria-hidden="true">
          <span className="public-art-sun" /><span className="public-art-river" />
          <span className="public-art-tower public-tower-one"><i /><i /><i /><i /></span>
          <span className="public-art-tower public-tower-two"><i /><i /><i /></span>
          <span className="public-art-palm">✦</span>
          <span className="public-art-caption">16° 03' 00.0" N<br />108° 13' 00.0" E</span>
        </div>
        <div className="public-hero-foot"><span>ĐÀ NẴNG, VIỆT NAM</span><span>16° 03' 00.0" N &nbsp; 108° 13' 00.0" E</span><span>01 — 03</span></div>
      </section>

      <section className="public-search-wrap" id="public-search">
        <form className="public-search" onSubmit={onSearch}>
          <div className="public-search-title"><span className="public-search-icon"><Icon name="calendar" /></span><span><strong>Tìm kỳ nghỉ của bạn</strong><small>Chọn ngày để xem phòng còn trống</small></span></div>
          <label><small>NHẬN PHÒNG</small><input type="date" min={checkinMin} required value={searchDates.checkin} onChange={(event) => setSearchDates({ ...searchDates, checkin: event.target.value })} /></label>
          <span className="public-search-divider" />
          <label><small>TRẢ PHÒNG</small><input type="date" min={checkoutMin} required value={searchDates.checkout} onChange={(event) => setSearchDates({ ...searchDates, checkout: event.target.value })} /></label>
          <button className="button button-primary" type="submit"><Icon name="search" size={16} /> Kiểm tra phòng</button>
        </form>
        {apiError && <p className="public-error" role="alert">{apiError}</p>}
      </section>

      <section className="public-section public-stay" id="stay">
        <div className="public-section-heading"><div><span className="eyebrow">STAY A LITTLE LONGER</span><h2>Nơi nghỉ ngơi<br /><em>được nghĩ đến từng chi tiết.</em></h2></div><p>Mỗi căn phòng là một khoảng lặng dịu dàng, với tiện nghi chỉn chu và cảm hứng từ vẻ đẹp ven sông Đà Nẵng.</p></div>
        {availableRooms.length > 0 ? (
          <>
            <div className="public-results-heading"><strong>{availableRooms.length} phòng phù hợp</strong><span>{formatDate(searchDates.checkin)} → {formatDate(searchDates.checkout)}</span></div>
            <div className="public-room-grid">
              {availableRooms.map((room, index) => <article className="public-room-card" key={room.id}>
                <div className={`public-room-art public-room-art-${index % 3}`}><span>MAISON SIGNATURE</span><strong>{String(index + 1).padStart(2, '0')}</strong></div>
                <div className="public-room-card-copy"><span className="eyebrow">{room.room_types?.type_name ?? 'MAISON ROOM'}</span><h3>Phòng {room.room_number}</h3><p><span><Icon name="users" size={15} /> {room.room_types?.capacity ?? 2} khách</span><span>{formatMoney(room.room_types?.base_price)} / đêm</span></p><button className="text-link" onClick={onRegister}>Chọn phòng <Icon name="arrow" size={15} /></button></div>
              </article>)}
            </div>
          </>
        ) : (
          <>
            <div className="public-room-grid">
              {roomTypes.map((roomType, index) => <article className="public-room-card" key={roomType.id}>
                <div className={`public-room-art public-room-art-${index % 3}`}><span>MAISON SIGNATURE</span><strong>{String(index + 1).padStart(2, '0')}</strong></div>
                <div className="public-room-card-copy"><span className="eyebrow">ROOM COLLECTION</span><h3>{roomType.type_name}</h3><p><span><Icon name="users" size={15} /> Tối đa {roomType.capacity} khách</span><span>{formatMoney(roomType.base_price)} / đêm</span></p><small>{roomType.description || 'Không gian nghỉ dưỡng riêng tư, tiện nghi và tinh tế.'}</small><button className="text-link" onClick={() => document.getElementById('public-search')?.scrollIntoView({ behavior: 'smooth' })}>Kiểm tra ngày trống <Icon name="arrow" size={15} /></button></div>
              </article>)}
            </div>
            {!roomTypes.length && <div className="public-empty">{apiError ? 'Chưa thể tải danh sách hạng phòng. Vui lòng thử lại sau.' : 'Đang tải các hạng phòng Maison…'}</div>}
          </>
        )}
      </section>

      <section className="public-experience" id="experience">
        <div className="public-experience-art"><span className="experience-sun" /><span className="experience-window" /><span className="experience-vase">✦</span><span className="experience-art-note">A QUIET MOMENT<br />BY THE HAN RIVER</span></div>
        <div className="public-experience-copy"><span className="eyebrow">THE MAISON EXPERIENCE</span><h2>Không chỉ là<br /><em>một nơi để ở.</em></h2><p>Đó là một lời mời sống chậm lại — thức dậy cùng ánh nắng bên sông, tận hưởng sự chăm chút trong từng chi tiết và khám phá thành phố theo nhịp riêng của bạn.</p><div className="experience-features"><span><Icon name="leaf" size={17} /> Không gian an yên</span><span><Icon name="pin" size={17} /> Ngay bên sông Hàn</span><span><Icon name="sparkle" size={17} /> Dịch vụ tận tâm</span></div><button className="button button-primary" onClick={onRegister}>Bắt đầu hành trình <Icon name="arrow" size={16} /></button></div>
      </section>

      <section className="public-location" id="location"><span className="eyebrow">FIND YOUR WAY TO MAISON</span><h2>Gần với mọi điều<br /><em>khiến Đà Nẵng đặc biệt.</em></h2><p><Icon name="pin" size={17} /> Bên bờ sông Hàn, Đà Nẵng, Việt Nam</p><a href="tel:+842363558888"><Icon name="phone" size={16} /> (0236) 355 8888</a></section>

      <footer className="public-footer"><a className="public-brand" href="#home"><span className="brand-mark"><span /></span><span className="brand-copy"><strong>MAISON</strong><small>HOTEL & RESIDENCE</small></span></a><span>© 2026 Maison Riverside · Đà Nẵng, Việt Nam</span><button className="public-text-button" onClick={onLogin}>Dành cho thành viên <Icon name="arrow" size={14} /></button></footer>
    </main>
  )
}

function LoginDialog({ busy, error, initialRegister, username, password, setUsername, setPassword, onSubmit, onRegister, onClose }: {
  busy: boolean
  error: string
  initialRegister: boolean
  username: string
  password: string
  setUsername: (value: string) => void
  setPassword: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onRegister: (data: RegistrationPayload) => Promise<void>
  onClose: () => void
}) {
  const [registerMode, setRegisterMode] = useState(initialRegister)
  const [registration, setRegistration] = useState<RegistrationPayload>({ username: '', password: '', email: '', full_name: '', phone: '', cccd_passport: '' })
  const setField = (field: keyof RegistrationPayload, value: string) => setRegistration((current) => ({ ...current, [field]: value }))
  const submitRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onRegister(registration)
  }
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="login-modal" aria-labelledby="login-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button>
        <div className="login-emblem"><span className="brand-mark"><span /></span></div>
        <span className="eyebrow">{registerMode ? 'JOIN MAISON' : 'WELCOME BACK'}</span>
        <h2 id="login-title">{registerMode ? 'Tạo tài khoản khách hàng' : 'Chào mừng trở lại'}</h2>
        <p>{registerMode ? 'Đăng ký để quản lý kỳ nghỉ của bạn.' : 'Đăng nhập để tiếp tục với Maison Riverside.'}</p>
        {registerMode ? (
          <form onSubmit={submitRegistration}>
            <label htmlFor="register-name">Họ và tên</label><input id="register-name" autoComplete="name" value={registration.full_name} onChange={(event) => setField('full_name', event.target.value)} required maxLength={100} />
            <label htmlFor="register-username">Tên đăng nhập</label><input id="register-username" autoComplete="username" value={registration.username} onChange={(event) => setField('username', event.target.value)} required minLength={3} maxLength={50} />
            <label htmlFor="register-email">Email</label><input id="register-email" type="email" autoComplete="email" value={registration.email} onChange={(event) => setField('email', event.target.value)} required maxLength={100} />
            <div className="registration-split"><span><label htmlFor="register-phone">Số điện thoại</label><input id="register-phone" autoComplete="tel" value={registration.phone} onChange={(event) => setField('phone', event.target.value)} required minLength={6} maxLength={15} /></span><br></br><span><label htmlFor="register-document">CCCD / Hộ chiếu</label><input id="register-document" value={registration.cccd_passport} onChange={(event) => setField('cccd_passport', event.target.value)} required minLength={6} maxLength={50} /></span></div>
            <label htmlFor="register-password">Mật khẩu (ít nhất 10 ký tự)</label><input id="register-password" type="password" autoComplete="new-password" value={registration.password} onChange={(event) => setField('password', event.target.value)} required minLength={10} maxLength={72} />
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" disabled={busy}>{busy ? 'Đang tạo tài khoản…' : 'Đăng ký'} <Icon name="arrow" size={17} /></button>
            <div className="login-mode-switch">Đã có tài khoản? <button type="button" onClick={() => setRegisterMode(false)}>Đăng nhập</button></div>
          </form>
        ) : (
          <form onSubmit={onSubmit}>
            <label htmlFor="username">Tên đăng nhập</label><input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Nhập tên đăng nhập" required />
            <label htmlFor="password">Mật khẩu</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" required />
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'} <Icon name="arrow" size={17} /></button>
            <div className="login-mode-switch">Chưa có tài khoản? <button type="button" onClick={() => setRegisterMode(true)}>Đăng ký khách hàng</button></div>
          </form>
        )}
        <span className="login-secure"><span /> Kết nối bảo mật qua hệ thống khách sạn</span>
      </section>
    </div>
  )
}

export default App
