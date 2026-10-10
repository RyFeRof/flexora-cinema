import { useCallback, useEffect, useState } from "react"

// Клиентская пауза между отправками кода (бэк свой лимит не ставит).
export function useCooldown(seconds: number, initial = 0) {
    const [left, setLeft] = useState(initial)

    useEffect(() => {
        if (left <= 0) return
        const t = setTimeout(() => setLeft((l) => l - 1), 1000)
        return () => clearTimeout(t)
    }, [left])

    const start = useCallback(() => setLeft(seconds), [seconds])
    return { left, start }
}
