import { getInitial } from "../../../entities/user"
import type { User } from "../../../entities/user"
import { LogoutButton } from "../../../features/logout"
import { ErrorBox, SectionLabel } from "./states"
import type { ProfileState } from "../model/useProfile"

export type Screen = "menu" | "personal" | "sessions"

interface Props {
    state: ProfileState
    onRetry: () => void
    onNavigate: (screen: Exclude<Screen, "menu">) => void
}

function Header({ user }: { user: User | null }) {
    return (
        <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-accent to-[#8341ef] text-[26px] font-bold text-white">
                {user ? getInitial(user.name) : ""}
            </div>
            <div className="min-w-0">
                {user ? (
                    <>
                        <p className="truncate text-lg font-bold text-title">{user.name}</p>
                        <p className="truncate text-[13px] text-[#c8c7c7]">{user.mail}</p>
                    </>
                ) : (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 w-32 rounded bg-[#2a2a2a]" />
                        <div className="h-3 w-44 rounded bg-[#222]" />
                    </div>
                )}
            </div>
        </div>
    )
}

const ITEMS = [
    {
        screen: "personal" as const,
        title: "Личная информация",
        sub: "Имя, логин, почта, телефон",
        icon: <><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></>,
    },
    {
        screen: "sessions" as const,
        title: "Сессии",
        sub: "Устройства, где вы вошли",
        icon: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
    },
]

export default function AccountMenu({ state, onRetry, onNavigate }: Props) {
    const user = state.status === "ready" ? state.user : null

    return (
        <>
            {/* Ошибка профиля не блокирует меню: сессии и выход от /me не зависят */}
            <Header user={user} />
            {state.status === "error" && (
                <div className="mt-4"><ErrorBox message={state.message} onRetry={onRetry} /></div>
            )}

            <SectionLabel>НАСТРОЙКИ</SectionLabel>
            <div className="flex flex-col gap-2">
                {ITEMS.map((item) => (
                    <button
                        key={item.screen}
                        type="button"
                        onClick={() => onNavigate(item.screen)}
                        className="flex items-center gap-3 rounded-xl bg-[#222] px-4 py-3 text-left transition-colors hover:bg-[#2a2a2a]"
                    >
                        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent/15">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                                {item.icon}
                            </svg>
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-title">{item.title}</span>
                            <span className="block text-xs text-textColor">{item.sub}</span>
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </button>
                ))}
            </div>

            <LogoutButton className="mt-6" />
        </>
    )
}
