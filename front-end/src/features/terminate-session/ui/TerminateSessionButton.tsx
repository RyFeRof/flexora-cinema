import { useState } from "react"
import { terminateSession } from "../api/terminateSession"
import { getApiErrorMessage } from "../../../shared/lib/apiError"

interface Props {
    deviceId: string
    onTerminated: (deviceId: string) => void
}

export default function TerminateSessionButton({ deviceId, onTerminated }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const run = async () => {
        if (loading) return
        setLoading(true)
        setError(null)
        try {
            await terminateSession(deviceId)
            onTerminated(deviceId)
        } catch (e) {
            setError(getApiErrorMessage(e))
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={() => void run()}
                disabled={loading}
                className="rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-[#333] disabled:opacity-60"
            >
                {loading ? "Завершаем…" : "Завершить"}
            </button>
            {error && <p role="alert" className="max-w-[140px] text-right text-[11px] text-error">{error}</p>}
        </div>
    )
}
