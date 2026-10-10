import { useState } from "react"
import { formatCreatedAt, formatPhone } from "../../../entities/user"
import { EditableField } from "../../../features/edit-profile"
import type { ChangeType } from "../../../features/edit-profile"
import { ErrorBox, RowsSkeleton } from "./states"
import type { ProfileState } from "../model/useProfile"

interface Props {
    state: ProfileState
    onRetry: () => void
    onChanged: (field: ChangeType, value: string) => void
}

const FIELDS: { field: ChangeType; label: string; format?: (v: string) => string }[] = [
    { field: "name", label: "Имя" },
    { field: "login", label: "Логин" },
    { field: "mail", label: "Почта" },
    { field: "phone_number", label: "Телефон", format: formatPhone },
]

export default function PersonalInfoScreen({ state, onRetry, onChanged }: Props) {
    const [editing, setEditing] = useState<ChangeType | null>(null)

    if (state.status === "loading") return <RowsSkeleton rows={5} label="Загрузка профиля" />
    if (state.status === "error") return <ErrorBox message={state.message} onRetry={onRetry} />

    const { user } = state
    return (
        <div className="flex flex-col gap-2">
            {FIELDS.map(({ field, label, format }) => (
                <EditableField
                    key={field}
                    field={field}
                    label={label}
                    value={user[field]}
                    displayValue={format?.(user[field])}
                    editing={editing === field}
                    onStartEdit={() => setEditing(field)}
                    onCancel={() => setEditing(null)}
                    onSaved={(f, v) => { onChanged(f, v); setEditing(null) }}
                />
            ))}
            <div className="rounded-xl bg-[#222] px-4 py-3">
                <p className="text-xs text-textColor">В Voidex с</p>
                <p className="text-sm font-medium text-title">{formatCreatedAt(user.created_at)}</p>
            </div>
        </div>
    )
}
