import { useEffect, useRef, useState } from "react";
import type { Member } from "../../types";
import { searchFilmingMembers, addFilmingMember } from "../../api";

export default function MembersPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Member[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const trimmed = query.trim();
            if (!trimmed) {
                setResults([]);
                return;
            }
            setSearching(true);
            try {
                const data = await searchFilmingMembers(trimmed);
                setResults(data);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    const handleAdd = async () => {
        const name = query.trim();
        if (!name) return;
        setError(null);
        setSuccess(null);
        try {
            const { id } = await addFilmingMember(name);
            setSuccess(`Добавлено: ${name} (id ${id})`);
            setResults((prev) => [{ id, member: name }, ...prev]);
            setQuery("");
        } catch {
            setError("Не удалось добавить");
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="mb-2 text-2xl font-semibold">Съёмочная группа</h1>
            <p className="mb-6 text-sm text-textColor">
                Поиск существующих актёров и участников съёмок, добавление новых. Роль каждому
                назначается уже в форме добавления фильма.
            </p>

            <div className="rounded-2xl border border-stroke bg-cardColor/80 p-6">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Введите имя для поиска"
                        className="flex-1 rounded-lg border border-stroke bg-inputColor px-3 py-2.5 text-sm text-title outline-none focus:border-textColor"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!query.trim()}
                        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
                    >
                        Добавить как нового
                    </button>
                </div>

                {error && <p className="mt-4 text-sm text-error">{error}</p>}
                {success && <p className="mt-4 text-sm text-green-400">{success}</p>}

                <div className="mt-5 flex flex-col gap-2">
                    {searching && <p className="text-sm text-textColor">Поиск...</p>}
                    {!searching && query.trim() && results.length === 0 && (
                        <p className="text-sm text-textColor">Никого не найдено — можно добавить нового</p>
                    )}
                    {results.map((m) => (
                        <div
                            key={m.id}
                            className="rounded-lg border border-stroke bg-inputColor/50 px-3.5 py-2.5 text-sm text-title"
                        >
                            {m.member}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}