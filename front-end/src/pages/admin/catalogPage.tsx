import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Film } from "../../types";
import { getFilmsPage } from "../../api";

const PAGE_SIZE = 20;

export default function CatalogPage() {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);


    useEffect(() => {
    let cancelled = false;
    (async () => {
        try {
            const data = await getFilmsPage(PAGE_SIZE, 0);
            if (cancelled) return;
            setFilms(data);
            setHasMore(data.length === PAGE_SIZE);
        } catch {
            if (!cancelled) setError("Не удалось загрузить каталог");
        } finally {
            if (!cancelled) setLoading(false);
        }
    })();
    return () => {
        cancelled = true;
    };
}, []);

const loadMore = async () => {
    if (films.length === 0) return;
    setLoadingMore(true);
    const lastId = films[films.length - 1].id ?? 0;
    try {
        const data = await getFilmsPage(PAGE_SIZE, lastId);
        setFilms((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
    } catch {
        setError("Не удалось загрузить каталог");
    } finally {
        setLoadingMore(false);
    }
};

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Каталог фильмов</h1>
                <Link
                    to="/admin/films/new"
                    className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black"
                >
                    + Добавить фильм
                </Link>
            </div>

            {error && <p className="mb-4 text-sm text-error">{error}</p>}

            {loading ? (
                <p className="text-sm text-textColor">Загрузка...</p>
            ) : films.length === 0 ? (
                <p className="text-sm text-textColor">Фильмов пока нет</p>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {films.map((film) => (
                            <div
                                key={film.id}
                                className="overflow-hidden rounded-lg border border-stroke bg-cardColor"
                            >
                                <div className="aspect-[2] w-full bg-inputColor">
                                    {film.card?.path && (
                                        <img
                                            src={film.card.path}
                                            alt={film.title ?? ""}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-2.5">
                                    <p className="line-clamp-1 text-sm font-medium text-title">
                                        {film.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-textColor">
                                        {film.is_serial ? "Сериал" : "Фильм"} · id {film.id}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="rounded-lg border border-stroke px-5 py-2.5 text-sm text-title hover:border-textColor disabled:opacity-50"
                            >
                                {loadingMore ? "Загрузка..." : "Показать ещё"}
                            </button>
                        </div>
                    )}
                </>
            )}

            <p className="mt-8 text-xs text-textColor">
                Редактирование и удаление фильмов из каталога появятся в бэкенде позже — сейчас
                этот раздел только для просмотра уже добавленного.
            </p>
        </div>
    );
}
