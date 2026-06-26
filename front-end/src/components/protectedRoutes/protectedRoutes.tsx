import { Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { setAccessToken } from '../../api'
import { useAuth } from '../../context/authContext/context'

export default function ProtectedRoutes() {
    const [ready, setReady] = useState(false)
    const { authed, setAuthed } = useAuth()

    useEffect(() => {
        const tryRestoreSession = async () => {
            try {
                const { data } = await axios.post(
                    "/api/auth/refresh",
                    {},
                    { withCredentials: true }
                )
                setAccessToken(data.access_token)
                setAuthed(true)
            } catch {
                setAuthed(false)
            } finally {
                setReady(true)
            }
        }
        tryRestoreSession()
    }, [setAuthed])

    if (!ready) return <div className="text-white">Загрузка...</div>
    return authed ? <Outlet /> : <Navigate to="/login" replace />
}