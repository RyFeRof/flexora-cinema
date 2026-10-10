import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useProfile } from "../model/useProfile"
import AccountMenu from "./AccountMenu"
import type { Screen } from "./AccountMenu"
import PersonalInfoScreen from "./PersonalInfoScreen"
import SessionsScreen from "./SessionsScreen"

interface Props {
    onClose: () => void
}

const TITLES: Record<Screen, string> = {
    menu: "Аккаунт",
    personal: "Личная информация",
    sessions: "Сессии",
}

export default function ProfilePanel({ onClose }: Props) {
    const { state, retry, applyChange } = useProfile()
    const [screen, setScreen] = useState<Screen>("menu")
    const panelRef = useRef<HTMLElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !e.defaultPrevented) onClose()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [onClose])

    useEffect(() => {
        const prevFocus = document.activeElement as HTMLElement | null
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        panelRef.current?.focus()
        return () => {
            document.body.style.overflow = prevOverflow
            prevFocus?.focus()
        }
    }, [])

    const go = (next: Screen) => {
        setScreen(next)
        bodyRef.current?.scrollTo({ top: 0 })
    }

    // Portal: backdrop-blur на <header> делает его containing block для fixed-потомков.
    // starting: — анимация появления без keyframes.
    return createPortal(
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/55 transition-opacity duration-200 starting:opacity-0"
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-panel-title"
                className="absolute top-4 right-4 bottom-4 flex w-[408px] max-w-[calc(100vw-2rem)] flex-col rounded-[20px] border border-[#2a2a2a] bg-[#171717] shadow-[-8px_12px_40px_rgba(0,0,0,0.6)] outline-none transition duration-200 starting:translate-x-6 starting:opacity-0"
            >
                <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                    {screen !== "menu" && (
                        <button
                            type="button"
                            onClick={() => go("menu")}
                            aria-label="Назад"
                            className="grid size-8 shrink-0 place-items-center rounded-full bg-[#2a2a2a] transition-colors hover:bg-[#333]"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8c7c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 6l-6 6 6 6" />
                            </svg>
                        </button>
                    )}
                    <h2 id="profile-panel-title" className="min-w-0 flex-1 truncate text-xl font-bold text-title">
                        {TITLES[screen]}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-[#2a2a2a] transition-colors hover:bg-[#333]"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#c8c7c7" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M2 2l10 10M12 2L2 12" />
                        </svg>
                    </button>
                </div>

                <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
                    {screen === "menu" && <AccountMenu state={state} onRetry={retry} onNavigate={go} />}
                    {screen === "personal" && <PersonalInfoScreen state={state} onRetry={retry} onChanged={applyChange} />}
                    {screen === "sessions" && <SessionsScreen />}
                </div>
            </aside>
        </div>,
        document.body,
    )
}
