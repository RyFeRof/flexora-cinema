import { useState } from "react";

interface Item {
    id: number;
    label: string;
}

interface Props {
    title: string;
    items: Item[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    onAddNew: (value: string) => Promise<void>;
    addPlaceholder: string;
    error?: string | null;
}

export default function TagMultiSelect({
    title,
    items,
    selectedIds,
    onToggle,
    onAddNew,
    addPlaceholder,
    error,
}: Props) {
    const [adding, setAdding] = useState(false);
    const [value, setValue] = useState("");
    const [busy, setBusy] = useState(false);

    const handleAdd = async () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setBusy(true);
        try {
            await onAddNew(trimmed);
            setValue("");
            setAdding(false);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-textColor">{title}</p>
                <button
                    type="button"
                    onClick={() => setAdding((v) => !v)}
                    className="text-xs text-accent hover:underline"
                >
                    {adding ? "Отмена" : "+ добавить новое"}
                </button>
            </div>

            {adding && (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAdd();
                            }
                        }}
                        placeholder={addPlaceholder}
                        className="flex-1 rounded-lg border border-stroke bg-inputColor px-3 py-2 text-sm text-title outline-none focus:border-textColor"
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={busy || !value.trim()}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                    >
                        Сохранить
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {items.length === 0 && (
                    <p className="text-xs text-textColor">Список пуст — добавьте первый вариант</p>
                )}
                {items.map((item) => {
                    const active = selectedIds.includes(item.id);
                    return (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => onToggle(item.id)}
                            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                                active
                                    ? "border-accent bg-accent/15 text-title"
                                    : "border-stroke bg-inputColor text-textColor hover:border-textColor"
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
        </div>
    );
}
