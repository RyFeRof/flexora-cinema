import { useState } from "react"
import { useLogout } from "../model/useLogout"

interface Props {
    all?: boolean // true — выйти на всех устройствах (с подтверждением)
    className?: string
}

export default function LogoutButton({ all = false, className = "" }: Props) {
    const { run, loading, error } = useLogout(all)
    const [confirming, setConfirming] = useState(false)

    const label = all ? "Выйти на всех устройствах" : "Выйти из аккаунта"

    return (
        <div className={className}>
            {confirming ? (
                <div className="rounded-xl bg-[#222] px-4 py-3">
                    <p className="text-sm text-title">Завершить все сессии, включая эту?</p>
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => void run()}
                            disabled={loading}
                            className="rounded-[10px] bg-error px-4 py-2 text-[13px] font-semibold text-pageColor transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {loading ? "Выходим…" : "Да, выйти"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={loading}
                            className="rounded-[10px] bg-[#2a2a2a] px-4 py-2 text-[13px] font-medium text-title transition-colors hover:bg-[#333] disabled:opacity-60"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => (all ? setConfirming(true) : void run())}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#222] px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-[#2a2a2a] disabled:opacity-60"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />
                    </svg>
                    {loading ? "Выходим…" : label}
                </button>
            )}
            {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
        </div>
    )
}
