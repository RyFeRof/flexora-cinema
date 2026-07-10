import { useEffect, useState } from "react";
import type { Genre, Country, Role } from "../../types";
import { getGenres, addGenre, getCountries, addCountry, getRoles, addRole } from "../../api";

type TabKey = "genres" | "countries" | "roles";

const tabs: { key: TabKey; label: string }[] = [
    { key: "genres", label: "Жанры" },
    { key: "countries", label: "Страны" },
    { key: "roles", label: "Роли" },
];

export default function ReferenceDataPage() {
    const [tab, setTab] = useState<TabKey>("genres");

    const [genres, setGenres] = useState<Genre[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newValue, setNewValue] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
    (async () => {
        try {
            const [g, c, r] = await Promise.all([getGenres(), getCountries(), getRoles()]);
            setGenres(g ?? []);
            setCountries(c ?? []);
            setRoles(r ?? []);
        } catch {
            setError("Не удалось загрузить справочники");
        } finally {
            setLoading(false);
        }
    })();
}, []);

    const currentList =
        tab === "genres"
            ? genres.map((g) => ({ id: g.id, label: g.genre }))
            : tab === "countries"
            ? countries.map((c) => ({ id: c.id, label: c.country }))
            : roles.map((r) => ({ id: r.id, label: r.role }));

    const handleAdd = async () => {
        const value = newValue.trim();
        if (!value) return;
        setSaving(true);
        setError(null);
        try {
            if (tab === "genres") {
                const { id } = await addGenre(value);
                setGenres((prev) => [...prev, { id, genre: value }]);
            } else if (tab === "countries") {
                const { id } = await addCountry(value);
                setCountries((prev) => [...prev, { id, country: value }]);
            } else {
                const { id } = await addRole(value);
                setRoles((prev) => [...prev, { id, role: value }]);
            }
            setNewValue("");
        } catch {
            setError("Не удалось сохранить — возможно, такое значение уже есть");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-2xl font-semibold">Справочники</h1>

            <div className="mb-6 flex gap-2 overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                            tab === t.key
                                ? "border-accent bg-accent/15 text-title"
                                : "border-stroke text-textColor hover:border-textColor"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl border border-stroke bg-cardColor/80 p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row">
                    <input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        placeholder={
                            tab === "genres"
                                ? "Новый жанр"
                                : tab === "countries"
                                ? "Новая страна"
                                : "Новая роль"
                        }
                        className="flex-1 rounded-lg border border-stroke bg-inputColor px-3 py-2.5 text-sm text-title outline-none focus:border-textColor"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={saving || !newValue.trim()}
                        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
                    >
                        Добавить
                    </button>
                </div>

                {error && <p className="mb-4 text-sm text-error">{error}</p>}

                {loading ? (
                    <p className="text-sm text-textColor">Загрузка...</p>
                ) : currentList.length === 0 ? (
                    <p className="text-sm text-textColor">Список пуст</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {currentList.map((item) => (
                            <span
                                key={item.id}
                                className="rounded-full border border-stroke bg-inputColor px-3.5 py-1.5 text-sm text-title"
                            >
                                {item.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
