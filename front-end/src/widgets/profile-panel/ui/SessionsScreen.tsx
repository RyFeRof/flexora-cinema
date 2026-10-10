import { SessionCard } from "../../../entities/session"
import { LogoutButton } from "../../../features/logout"
import { TerminateSessionButton } from "../../../features/terminate-session"
import { useSessions } from "../model/useSessions"
import { ErrorBox, RowsSkeleton, SectionLabel } from "./states"

export default function SessionsScreen() {
    const { state, retry, remove } = useSessions()

    if (state.status === "loading") return <RowsSkeleton rows={3} label="Загрузка сессий" />
    if (state.status === "error") return <ErrorBox message={state.message} onRetry={retry} />

    const current = state.sessions.filter((s) => s.is_this_device)
    const others = state.sessions.filter((s) => !s.is_this_device)

    return (
        <>
            {current.length > 0 && (
                <>
                    <SectionLabel>ТЕКУЩЕЕ УСТРОЙСТВО</SectionLabel>
                    <div className="flex flex-col gap-2">
                        {current.map((s) => <SessionCard key={s.device_id} session={s} />)}
                    </div>
                </>
            )}

            <SectionLabel>ДРУГИЕ УСТРОЙСТВА</SectionLabel>
            {others.length === 0 ? (
                <p className="rounded-xl bg-[#222] px-4 py-3 text-sm text-textColor">Других активных сессий нет</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {others.map((s) => (
                        <SessionCard
                            key={s.device_id}
                            session={s}
                            action={<TerminateSessionButton deviceId={s.device_id} onTerminated={remove} />}
                        />
                    ))}
                </div>
            )}

            <LogoutButton all className="mt-6" />
        </>
    )
}
