import { useEffect, useState } from "react"
import { changeUser } from "../api/changeUser"
import { validators } from "../lib/validate"
import type { ChangeType } from "../model/types"
import { getApiErrorMessage } from "../../../shared/lib/apiError"

interface Props {
    field: ChangeType
    label: string
    value: string
    displayValue?: string
    editing: boolean
    onStartEdit: () => void
    onCancel: () => void
    onSaved: (field: ChangeType, value: string) => void
}

const inputProps: Record<ChangeType, React.InputHTMLAttributes<HTMLInputElement>> = {
    name: { type: "text", maxLength: 20, autoComplete: "given-name" },
    login: { type: "text", maxLength: 20, autoComplete: "username" },
    mail: { type: "email", maxLength: 254, autoComplete: "email" },
    phone_number: { type: "tel", inputMode: "numeric", maxLength: 11, autoComplete: "tel-national" },
}

export default function EditableField({
    field, label, value, displayValue, editing, onStartEdit, onCancel, onSaved,
}: Props) {
    const [draft, setDraft] = useState(value)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [justSaved, setJustSaved] = useState(false)

    useEffect(() => {
        if (!justSaved) return
        const t = setTimeout(() => setJustSaved(false), 2500)
        return () => clearTimeout(t)
    }, [justSaved])

    const begin = () => {
        setDraft(value)
        setError(null)
        setJustSaved(false)
        onStartEdit()
    }

    const submit = async () => {
        if (saving) return
        const next = draft.trim() // бэк trim не делает — режем сами
        const invalid = validators[field](next)
        if (invalid) { setError(invalid); return }
        if (next === value) { onCancel(); return }

        setSaving(true)
        setError(null)
        try {
            await changeUser({ change_type: field, input: next })
            setSaving(false)
            setJustSaved(true)
            onSaved(field, next)
        } catch (e) {
            setError(getApiErrorMessage(e))
            setSaving(false)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") { e.preventDefault(); void submit() }
        if (e.key === "Escape") { e.preventDefault(); onCancel() } // preventDefault → панель не закроется
    }

    if (!editing) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#222] px-4 py-3">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs text-textColor">
                        {label}
                        {justSaved && <span className="font-medium text-emerald-400">Сохранено</span>}
                    </p>
                    <p className="truncate text-sm font-medium text-title">{displayValue ?? value}</p>
                </div>
                <button
                    type="button"
                    onClick={begin}
                    className="shrink-0 rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-title transition-colors hover:bg-[#333]"
                >
                    Изменить
                </button>
            </div>
        )
    }

    return (
        <div className="rounded-xl bg-[#222] px-4 py-3 ring-1 ring-accent/40">
            <label htmlFor={`edit-${field}`} className="text-xs text-textColor">{label}</label>
            <input
                id={`edit-${field}`}
                autoFocus
                value={draft}
                disabled={saving}
                aria-invalid={error ? true : undefined}
                onChange={(e) => {
                    setDraft(field === "phone_number" ? e.target.value.replace(/\D/g, "") : e.target.value)
                    if (error) setError(null)
                }}
                onKeyDown={onKeyDown}
                {...inputProps[field]}
                className={`mt-1.5 w-full rounded-lg border bg-cardColor px-3 py-2 text-sm text-title outline-none transition-colors disabled:opacity-60 ${
                    error ? "border-error" : "border-stroke focus:border-accent"
                }`}
            />
            {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={saving}
                    className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-semibold text-pageColor transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    {saving ? "Сохраняем…" : "Сохранить"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-[10px] bg-[#2a2a2a] px-4 py-2 text-[13px] font-medium text-title transition-colors hover:bg-[#333] disabled:opacity-60"
                >
                    Отмена
                </button>
            </div>
        </div>
    )
}
