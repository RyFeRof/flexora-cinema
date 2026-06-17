import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { setAccessToken } from "./api"
import Cinema from "./pages/cinema/cinema"
import Player from "./pages/player/player"
import Add from "./pages/add/add"
import Login from "./pages/login/login"
import RegisterPage from "./pages/register/register"

export default function App() {
  const [ready, setReady] = useState(false) // ждём пока проверим сессию
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const tryRestoreSession = async () => {
      try {
        const { data } = await axios.post(
          "/api/refresh",
          {},
          { withCredentials: true }
        )
        setAccessToken(data.access_token)
        setAuthed(true)
      } catch {
        // не залогинен — ок
        setAuthed(false)
      } finally {
        setReady(true) // в любом случае приложение готово
      }
    }

    tryRestoreSession()
  }, [])

  if (!ready) return <div className="text-white">Загрузка...</div>

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setAuthed(true)} />} />
      <Route path="/" element={authed ? <Cinema /> : <Navigate to="/login" />} />
      <Route path="/watch" element={authed ? <Player /> : <Navigate to="/login" />} />
      <Route path="/add" element={authed ? <Add /> : <Navigate to="/login" />} />
      <Route path="/register" element={<RegisterPage onRegister={() => setAuthed(true)}></RegisterPage>}></Route>
    </Routes>
  )
}