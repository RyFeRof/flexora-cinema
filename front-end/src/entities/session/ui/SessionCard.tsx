import type { ReactNode } from "react"
import type { Session } from "../model/types"
import { shortDeviceId } from "../lib/format"

interface Props {
    session: Session
    action?: ReactNode // слот под действие (кнопка из feature)
}

export default function SessionCard({ session, action }: Props) {
    const current = session.is_this_device
    return (
        <div className="flex items-center gap-3 rounded-xl bg-[#222] px-4 py-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent/15">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M8 20h8M12 16v4" />
                </svg>
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-title">
                    {current ? "Это устройство" : `Устройство ${shortDeviceId(session.device_id)}`}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-textColor">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    {current ? `Вы здесь · ${shortDeviceId(session.device_id)}` : "Активная сессия"}
                </p>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    )
}
