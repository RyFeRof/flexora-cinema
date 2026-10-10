import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { getSessions } from "../../../entities/session"
import type { Session } from "../../../entities/session"
import { getApiErrorMessage } from "../../../shared/lib/apiError"

export type SessionsState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; sessions: Session[] }

export function useSessions() {
    const [state, setState] = useState<SessionsState>({ status: "loading" })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        getSessions(controller.signal)
            .then((sessions) => setState({ status: "ready", sessions }))
            .catch((e) => {
                if (axios.isCancel(e)) return
                setState({ status: "error", message: getApiErrorMessage(e, "Не удалось загрузить сессии") })
            })
        return () => controller.abort()
    }, [attempt])

    const retry = useCallback(() => {
        setState({ status: "loading" })
        setAttempt((a) => a + 1)
    }, [])

    const remove = useCallback((deviceId: string) => {
        setState((s) =>
            s.status === "ready"
                ? { status: "ready", sessions: s.sessions.filter((x) => x.device_id !== deviceId) }
                : s,
        )
    }, [])

    return { state, retry, remove }
}
