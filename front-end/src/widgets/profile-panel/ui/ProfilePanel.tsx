import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { formatCreatedAt, formatPhone, getInitial } from "../../../entities/user"
import { EditableField } from "../../../features/edit-profile"
import type { ChangeType } from "../../../features/edit-profile"
import { useProfile } from "../model/useProfile"

interface Props {
    onClose: () => void
}

const FIELDS: { field: ChangeType; label: string; format?: (v: string) => string }[] = [
    { field: "name", label: "Имя" },
    { field: "login", label: "Логин" },
    { field: "mail", label: "Почта" },
    { field: "phone_number", label: "Телефон", format: formatPhone },
]

export default function ProfilePanel({ onClose }: Props) {
    const { state, retry, applyChange } = useProfile()
    const [editing, setEditing] = useState<ChangeType | null>(null)
    const panelRef = useRef<HTMLElement>(null)

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
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    <h2 id="profile-panel-title" className="text-xl font-bold text-title">Аккаунт</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        className="grid size-8 place-items-center rounded-full bg-[#2a2a2a] transition-colors hover:bg-[#333]"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#c8c7c7" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M2 2l10 10M12 2L2 12" />
                        </svg>
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
                    {state.status === "loading" && <Skeleton />}

                    {state.status === "error" && (
                        <div className="rounded-xl border border-error/40 bg-error/10 p-4">
                            <p role="alert" className="text-sm text-error">{state.message}</p>
                            <button
                                type="button"
                                onClick={retry}
                                className="mt-3 rounded-[10px] bg-[#2a2a2a] px-4 py-2 text-[13px] font-medium text-title transition-colors hover:bg-[#333]"
                            >
                                Повторить
                            </button>
                        </div>
                    )}

                    {state.status === "ready" && (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="grid size-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-accent to-[#8341ef] text-[26px] font-bold text-white">
                                    {getInitial(state.user.name)}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-bold text-title">{state.user.name}</p>
                                    <p className="truncate text-[13px] text-[#c8c7c7]">{state.user.mail}</p>
                                </div>
                            </div>

                            <p className="mt-7 mb-3 text-[11px] font-semibold tracking-[1px] text-[#777]">ЛИЧНЫЕ ДАННЫЕ</p>
                            <div className="flex flex-col gap-2">
                                {FIELDS.map(({ field, label, format }) => (
                                    <EditableField
                                        key={field}
                                        field={field}
                                        label={label}
                                        value={state.user[field]}
                                        displayValue={format?.(state.user[field])}
                                        editing={editing === field}
                                        onStartEdit={() => setEditing(field)}
                                        onCancel={() => setEditing(null)}
                                        onSaved={(f, v) => { applyChange(f, v); setEditing(null) }}
                                    />
                                ))}
                                <div className="rounded-xl bg-[#222] px-4 py-3">
                                    <p className="text-xs text-textColor">В Voidex с</p>
                                    <p className="text-sm font-medium text-title">{formatCreatedAt(state.user.created_at)}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        </div>,
        document.body,
    )
}

function Skeleton() {
    return (
        <div className="animate-pulse" aria-busy="true" aria-label="Загрузка профиля">
            <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-[#2a2a2a]" />
                <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-[#2a2a2a]" />
                    <div className="h-3 w-44 rounded bg-[#222]" />
                </div>
            </div>
            <div className="mt-7 mb-3 h-3 w-28 rounded bg-[#222]" />
            <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-[60px] rounded-xl bg-[#222]" />)}
            </div>
        </div>
    )
}
