import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Calendar from './pages/Calendar'
import Reservation from './pages/Reservation'
import Admin from './pages/Admin'
import MyReservations from './pages/MyReservations'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/reservation/:date" element={<Reservation />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/my-reservations" element={<MyReservations />} />
      </Routes>
    </div>
  )
}

export default App
