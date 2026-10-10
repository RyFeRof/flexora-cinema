import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { getMe } from "../../../entities/user"
import type { User } from "../../../entities/user"
import type { ChangeType } from "../../../features/edit-profile"
import { getApiErrorMessage } from "../../../shared/lib/apiError"

export type ProfileState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; user: User }

export function useProfile() {
    const [state, setState] = useState<ProfileState>({ status: "loading" })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        getMe(controller.signal)
            .then((user) => setState({ status: "ready", user }))
            .catch((e) => {
                if (axios.isCancel(e)) return
                setState({ status: "error", message: getApiErrorMessage(e, "Не удалось загрузить профиль") })
            })
        return () => controller.abort()
    }, [attempt])

    const retry = useCallback(() => {
        setState({ status: "loading" })
        setAttempt((a) => a + 1)
    }, [])

    const applyChange = useCallback((field: ChangeType, value: string) => {
        setState((s) => (s.status === "ready" ? { status: "ready", user: { ...s.user, [field]: value } } : s))
    }, [])

    return { state, retry, applyChange }
}
