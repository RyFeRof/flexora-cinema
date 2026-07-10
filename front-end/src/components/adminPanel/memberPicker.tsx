import { useEffect, useRef, useState } from "react";
import type { Member, Role } from "../../types";
import { searchFilmingMembers, addFilmingMember } from "../../api";

export interface PickedMember {
    memberId: number;
    memberName: string;
    roleId: number | null;
    roleName: string | null;
}

interface Props {
    roles: Role[];
    picked: PickedMember[];
    onChange: (picked: PickedMember[]) => void;
    onAddRole: (name: string) => Promise<Role>;
    error?: string | null;
}

export default function MembersPicker({ roles, picked, onChange, onAddRole }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Member[]>([]);
    const [searching, setSearching] = useState(false);
    const [openFor, setOpenFor] = useState<number | null>(null); // memberId для выбора роли
    const [addingRole, setAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
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

    const addMember = (member: Member) => {
        if (picked.some((p) => p.memberId === member.id)) return;
        onChange([...picked, { memberId: member.id, memberName: member.member, roleId: null, roleName: null }]);
        setQuery("");
        setResults([]);
        setOpenFor(member.id);
    };

    const createAndAddMember = async () => {
        const name = query.trim();
        if (!name) return;
        const { id } = await addFilmingMember(name);
        addMember({ id, member: name });
    };

    const setRole = (memberId: number, role: Role) => {
        onChange(
            picked.map((p) => (p.memberId === memberId ? { ...p, roleId: role.id, roleName: role.role } : p))
        );
        setOpenFor(null);
    };

    const removeMember = (memberId: number) => {
        onChange(picked.filter((p) => p.memberId !== memberId));
    };

    const handleCreateRole = async () => {
        const trimmed = newRoleName.trim();
        if (!trimmed) return;
        const role = await onAddRole(trimmed);
        setNewRoleName("");
        setAddingRole(false);
        if (openFor !== null) setRole(openFor, role);
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-textColor">Актёры / съёмочная группа</p>

            <div className="relative">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Начните вводить имя..."
                    className="w-full rounded-lg border border-stroke bg-inputColor px-3 py-2.5 text-sm text-title outline-none focus:border-textColor"
                />
                {query.trim() && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-stroke bg-cardColor shadow-xl">
                        {searching && <div className="px-3 py-2 text-xs text-textColor">Поиск...</div>}
                        {!searching &&
                            results.map((m) => (
                                <button
                                    type="button"
                                    key={m.id}
                                    onClick={() => addMember(m)}
                                    className="block w-full px-3 py-2 text-left text-sm text-title hover:bg-inputColor"
                                >
                                    {m.member}
                                </button>
                            ))}
                        {!searching && results.length === 0 && (
                            <button
                                type="button"
                                onClick={createAndAddMember}
                                className="block w-full px-3 py-2 text-left text-sm text-accent hover:bg-inputColor"
                            >
                                + добавить «{query.trim()}» как нового человека
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {picked.length === 0 && (
                    <p className="text-xs text-textColor">Пока никто не добавлен</p>
                )}
                {picked.map((p) => (
                    <div
                        key={p.memberId}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-stroke bg-inputColor/50 px-3 py-2"
                    >
                        <span className="text-sm text-title">{p.memberName}</span>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpenFor(openFor === p.memberId ? null : p.memberId)}
                                className={`rounded-full border px-3 py-1 text-xs ${
                                    p.roleName
                                        ? "border-accent text-title"
                                        : "border-error text-error"
                                }`}
                            >
                                {p.roleName ?? "выбрать роль"}
                            </button>
                            {openFor === p.memberId && (
                                <div className="absolute z-10 mt-1 min-w-40 overflow-hidden rounded-lg border border-stroke bg-cardColor shadow-xl">
                                    {roles.map((r) => (
                                        <button
                                            type="button"
                                            key={r.id}
                                            onClick={() => setRole(p.memberId, r)}
                                            className="block w-full px-3 py-2 text-left text-sm text-title hover:bg-inputColor"
                                        >
                                            {r.role}
                                        </button>
                                    ))}
                                    <div className="border-t border-stroke p-2">
                                        {addingRole ? (
                                            <div className="flex gap-1">
                                                <input
                                                    autoFocus
                                                    value={newRoleName}
                                                    onChange={(e) => setNewRoleName(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleCreateRole()}
                                                    placeholder="Новая роль"
                                                    className="w-full rounded border border-stroke bg-inputColor px-2 py-1 text-xs text-title outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleCreateRole}
                                                    className="shrink-0 rounded bg-accent px-2 text-xs text-black"
                                                >
                                                    ОК
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setAddingRole(true)}
                                                className="text-xs text-accent hover:underline"
                                            >
                                                + новая роль
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => removeMember(p.memberId)}
                            className="ml-auto text-xs text-textColor hover:text-error"
                        >
                            убрать
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
