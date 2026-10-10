import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { setAccessToken } from "../../../api"
import { useAuth } from "../../../context/authContext/context"
import { getApiErrorMessage } from "../../../shared/lib/apiError"
import { logout, logoutAll } from "../api/logout"

export function useLogout(all: boolean) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { setAuthed } = useAuth()
    const navigate = useNavigate()

    const run = async () => {
        if (loading) return
        setLoading(true)
        setError(null)
        try {
            await (all ? logoutAll() : logout())
            setAccessToken(null)
            setAuthed(false)
            navigate("/login", { replace: true })
        } catch (e) {
            setError(getApiErrorMessage(e))
            setLoading(false)
        }
    }

    return { run, loading, error }
}
