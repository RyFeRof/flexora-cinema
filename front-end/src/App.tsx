import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login/login"
import RegisterPage from "./pages/register/register"
import ProtectedRoutes from "./components/protectedRoutes/protectedRoutes"
import Cinema from './pages/cinema/cinema'
import Player from './pages/player/player'
import AdminLayout from "./layouts/adminLayout"
import AddFilmPage from "./pages/admin/adminFilmPage"
import CatalogPage from "./pages/admin/catalogPage"
import ReferenceDataPage from "./pages/admin/referenceDataPage"
import MembersPage from "./pages/admin/membersPage"
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

        {/* старый черновой роут ведёт в новую админку */}
        <Route path="/add" element={<Navigate to="/admin/films/new" replace />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="films" replace />} />
          <Route path="films" element={<CatalogPage />} />
          <Route path="films/new" element={<AddFilmPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="references" element={<ReferenceDataPage />} />
        </Route>
      </Route>
    </Routes>
  )
}