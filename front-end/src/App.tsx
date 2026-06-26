import { Routes, Route } from "react-router-dom"
import Login from "./pages/login/login"
import RegisterPage from "./pages/register/register"
import ProtectedRoutes from "./components/protectedRoutes/protectedRoutes"
import Add from './pages/add/add'
import Cinema from './pages/cinema/cinema'
import Player from './pages/player/player'
import { useAuth } from "./context/authContext/context"

export default function App() {
  const { setAuthed } = useAuth() // Теперь это безопасно, так как App внутри Provider

  return (
    <Routes>
      {/* Публичные роуты */}
      <Route path="/login" element={<Login onLogin={() => setAuthed(true)} />} />
      <Route path="/register" element={<RegisterPage onRegister={() => setAuthed(true)} />} />

      {/* Защищенные роуты */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Cinema />} />
        <Route path="/watch" element={<Player />} />
        <Route path="/add" element={<Add />} />
      </Route>
    </Routes>
  )
}