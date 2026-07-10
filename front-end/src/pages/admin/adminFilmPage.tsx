import { useEffect, useState } from "react";
import type { Genre, Country, Role, CreateFilmRequest } from "../../types";
import {
    getGenres,
    addGenre,
    getCountries,
    addCountry,
    getRoles,
    addRole,
    uploadFile,
    createFilm,
} from "../../api";
import TagMultiSelect from "../../components/adminPanel/tagMultiSelect";
import MembersPicker, { type PickedMember } from "../../components/adminPanel/memberPicker";
import FileDropzone from "../../components/adminPanel/fileDropZone";

type UploadKind = "trailer" | "card" | "logo" | 'material';

interface UploadState {
    file: File | null;
    path: string | null;
    uploading: boolean;
}

const emptyUpload: UploadState = { file: null, path: null, uploading: false };

export default function AddFilmPage() {
    // справочники
    const [genres, setGenres] = useState<Genre[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [refsLoading, setRefsLoading] = useState(true);

    // поля формы
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSerial, setIsSerial] = useState(false);
    const [genreIds, setGenreIds] = useState<number[]>([]);
    const [countryIds, setCountryIds] = useState<number[]>([]);
    const [members, setMembers] = useState<PickedMember[]>([]);
    const [isHorizontal, setIsHorizontal] = useState(false);

    const [uploads, setUploads] = useState<Record<UploadKind, UploadState>>({
        trailer: emptyUpload,
        card: emptyUpload,
        logo: emptyUpload,
        material: emptyUpload
    });

    const [useTimeline, setUseTimeline] = useState(false);
    const [timeIntro, setTimeIntro] = useState("");
    const [timeIntroEnd, setTimeIntroEnd] = useState("");
    const [timeOutro, setTimeOutro] = useState("");
    const [timeOutroEnd, setTimeOutroEnd] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [g, c, r] = await Promise.all([getGenres(), getCountries(), getRoles()]);
                setGenres(g ?? []);
                setCountries(c ?? []);
                setRoles(r ?? []);
            } catch {
                setError("Не удалось загрузить справочники (жанры/страны/роли)");
            } finally {
                setRefsLoading(false);
            }
        })();
    }, []);

    const handleUpload = async (kind: UploadKind, file: File) => {
        setUploads((prev) => ({ ...prev, [kind]: { file, path: null, uploading: true } }));
        try {
            const path = await uploadFile(file, kind);
            setUploads((prev) => ({ ...prev, [kind]: { file, path, uploading: false } }));
        } catch {
            setUploads((prev) => ({ ...prev, [kind]: { file: null, path: null, uploading: false } }));
            setError(`Не удалось загрузить файл (${kind})`);
        }
    };

    const toggleGenre = (id: number) => {
        setGenreIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
    };
    const toggleCountry = (id: number) => {
        setCountryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    };

    const handleAddGenre = async (value: string) => {
        const { id } = await addGenre(value);
        setGenres((prev) => [...prev, { id, genre: value }]);
        setGenreIds((prev) => [...prev, id]);
    };
    const handleAddCountry = async (value: string) => {
        const { id } = await addCountry(value);
        setCountries((prev) => [...prev, { id, country: value }]);
        setCountryIds((prev) => [...prev, id]);
    };
    const handleAddRole = async (name: string): Promise<Role> => {
        const { id } = await addRole(name);
        const role = { id, role: name };
        setRoles((prev) => [...prev, role]);
        return role;
    };

    const timelineFilled = [timeIntro, timeIntroEnd, timeOutro, timeOutroEnd].every((v) => v.trim());
    const timelineEmpty = [timeIntro, timeIntroEnd, timeOutro, timeOutroEnd].every((v) => !v.trim());

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setIsSerial(false);
        setGenreIds([]);
        setCountryIds([]);
        setMembers([]);
        setIsHorizontal(false);
        setUploads({ trailer: emptyUpload, card: emptyUpload, logo: emptyUpload, material: emptyUpload});
        setUseTimeline(false);
        setTimeIntro("");
        setTimeIntroEnd("");
        setTimeOutro("");
        setTimeOutroEnd("");
    };

    const validate = (): string | null => {
        if (!title.trim()) return "Укажите название фильма";
        if (!description.trim()) return "Укажите описание фильма";
        if (!uploads.card.path) return "Загрузите карточку (постер) фильма";
        if (!uploads.logo.path) return "Загрузите логотип фильма";
        if (!uploads.trailer.path) return "Загрузите трейлер фильма";
        if (!uploads.material.path) return "Загрузите материал фильма";
        if (countryIds.length === 0) return "Выберите хотя бы одну страну";
        if (genreIds.length === 0) return "Выберите хотя бы один жанр";
        if (members.length === 0) return "Добавьте хотя бы одного участника съёмок";
        if (members.some((m) => m.roleId === null)) return "Назначьте роль каждому добавленному участнику";
        if (useTimeline && !timelineFilled && !timelineEmpty)
            return "Заполните все 4 поля таймлайна (интро/аутро) или оставьте их все пустыми";
        return null;
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const req: CreateFilmRequest = {
            title: title.trim(),
            description: description.trim(),
            is_serial: isSerial,
            genre_ids: genreIds,
            country_ids: countryIds,
            filming_members: members.map((m) => ({ id: m.memberId, role_id: m.roleId as number })),
            card_path: uploads.card.path as string,
            is_horizontal: isHorizontal,
            logo_path: uploads.logo.path as string,
            trailer_path: uploads.trailer.path as string,
            material_path: uploads.material.path as string,
            time_line: useTimeline && timelineFilled
                ? {
                    time_intro: timeIntro.trim(),
                    time_intro_end: timeIntroEnd.trim(),
                    time_outro: timeOutro.trim(),
                    time_outro_end: timeOutroEnd.trim(),
                }
                : { time_intro: "", time_intro_end: "", time_outro: "", time_outro_end: "" },
        };

        setSubmitting(true);
        try {
            const { id } = await createFilm(req);
            setSuccess(`Фильм добавлен, id ${id}`);
            resetForm();
        } catch (e) {
            const message =
                (e as { response?: { data?: string } })?.response?.data ||
                "Не удалось сохранить фильм — проверьте данные и повторите попытку";
            setError(String(message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-2xl font-semibold">Добавление фильма</h1>

            <div className="flex flex-col gap-8 rounded-2xl border border-stroke bg-cardColor/80 p-5 sm:p-8">
                {/* Основное */}
                <label className="flex flex-col gap-2">
                    <span className="text-sm text-textColor">Название фильма</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Название"
                        className="rounded-lg border border-stroke bg-inputColor px-3 py-2.5 text-sm text-title outline-none focus:border-textColor"
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-textColor">Описание</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Описание"
                        className="resize-none rounded-lg border border-stroke bg-inputColor px-3 py-2.5 text-sm text-title outline-none focus:border-textColor"
                    />
                </label>

                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2.5">
                        <input type="checkbox" checked={isSerial} onChange={(e) => setIsSerial(e.target.checked)} />
                        <span className="text-sm text-textColor">Сериал</span>
                    </label>
                    <label className="flex items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={isHorizontal}
                            onChange={(e) => setIsHorizontal(e.target.checked)}
                        />
                        <span className="text-sm text-textColor">Горизонтальный постер</span>
                    </label>
                </div>

                {/* Справочники */}
                {refsLoading ? (
                    <p className="text-sm text-textColor">Загрузка справочников...</p>
                ) : (
                    <>
                        <TagMultiSelect
                            title="Жанры"
                            items={genres.map((g) => ({ id: g.id, label: g.genre }))}
                            selectedIds={genreIds}
                            onToggle={toggleGenre}
                            onAddNew={handleAddGenre}
                            addPlaceholder="Новый жанр"
                        />
                        <TagMultiSelect
                            title="Страны"
                            items={countries.map((c) => ({ id: c.id, label: c.country }))}
                            selectedIds={countryIds}
                            onToggle={toggleCountry}
                            onAddNew={handleAddCountry}
                            addPlaceholder="Новая страна"
                        />
                        <MembersPicker roles={roles} picked={members} onChange={setMembers} onAddRole={handleAddRole} />
                    </>
                )}

                {/* Файлы */}
                <div className="flex flex-col gap-3">
                    <span className="text-sm text-textColor">Медиафайлы</span>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <FileDropzone
                            label="Постер"
                            accept="image/*"
                            fileName={uploads.card.file?.name ?? null}
                            uploading={uploads.card.uploading}
                            uploadedPath={uploads.card.path}
                            onSelect={(f) => handleUpload("card", f)}
                        />
                        <FileDropzone
                            label="Логотип"
                            accept="image/*"
                            fileName={uploads.logo.file?.name ?? null}
                            uploading={uploads.logo.uploading}
                            uploadedPath={uploads.logo.path}
                            onSelect={(f) => handleUpload("logo", f)}
                        />
                        <FileDropzone
                            label="Трейлер"
                            accept="video/*"
                            fileName={uploads.trailer.file?.name ?? null}
                            uploading={uploads.trailer.uploading}
                            uploadedPath={uploads.trailer.path}
                            onSelect={(f) => handleUpload("trailer", f)}
                        />
                        <FileDropzone
                            label="Материал"
                            accept="video/*"
                            fileName={uploads.material.file?.name ?? null}
                            uploading={uploads.material.uploading}
                            uploadedPath={uploads.material.path}
                            onSelect={(f) => handleUpload("material", f)}
                        />
                    </div>
                </div>
                {/* Таймлайн */}
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2.5">
                        <input type="checkbox" checked={useTimeline} onChange={(e) => setUseTimeline(e.target.checked)} />
                        <span className="text-sm text-textColor">
                            Указать таймкоды заставки (интро/аутро)
                        </span>
                    </label>
                    {useTimeline && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs text-textColor">Начало интро</span>
                                <input
                                    value={timeIntro}
                                    onChange={(e) => setTimeIntro(e.target.value)}
                                    placeholder="чч:мм:сс"
                                    className="rounded-lg border border-stroke bg-inputColor px-2.5 py-2 text-sm text-title outline-none focus:border-textColor"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs text-textColor">Конец интро</span>
                                <input
                                    value={timeIntroEnd}
                                    onChange={(e) => setTimeIntroEnd(e.target.value)}
                                    placeholder="чч:мм:сс"
                                    className="rounded-lg border border-stroke bg-inputColor px-2.5 py-2 text-sm text-title outline-none focus:border-textColor"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs text-textColor">Начало титров</span>
                                <input
                                    value={timeOutro}
                                    onChange={(e) => setTimeOutro(e.target.value)}
                                    placeholder="чч:мм:сс"
                                    className="rounded-lg border border-stroke bg-inputColor px-2.5 py-2 text-sm text-title outline-none focus:border-textColor"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs text-textColor">Конец титров</span>
                                <input
                                    value={timeOutroEnd}
                                    onChange={(e) => setTimeOutroEnd(e.target.value)}
                                    placeholder="чч:мм:сс"
                                    className="rounded-lg border border-stroke bg-inputColor px-2.5 py-2 text-sm text-title outline-none focus:border-textColor"
                                />
                            </label>
                        </div>
                    )}
                </div>

                {error && <div className="rounded-lg bg-error/15 px-4 py-3 text-sm text-error">{error}</div>}
                {success && (
                    <div className="rounded-lg bg-green-500/15 px-4 py-3 text-sm text-green-400">{success}</div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-lg bg-accent px-6 py-3.5 text-base font-medium text-black hover:opacity-90 disabled:opacity-50"
                >
                    {submitting ? "Сохранение..." : "Добавить фильм"}
                </button>
            </div>
        </div>
    );
}
