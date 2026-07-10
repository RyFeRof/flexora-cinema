import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";

const links = [
    { to: "/admin/films/new", label: "Добавить фильм", icon: "➕" },
    { to: "/admin/films", label: "Каталог", icon: "🎬" },
    { to: "/admin/members", label: "Съёмочная группа", icon: "🎭" },
    { to: "/admin/references", label: "Справочники", icon: "🗂" },
];

export default function AdminLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="min-h-screen bg-pageColor text-title">
            {/* Верхняя панель — видна всегда, на мобильных содержит гамбургер */}
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-stroke bg-pageColor/95 px-4 backdrop-blur-md sm:px-6">
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="rounded-lg border border-stroke p-2 text-title lg:hidden"
                    aria-label="Открыть меню"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
                <Link to="/admin/films" className="text-lg font-semibold tracking-tight">
                    Voidex <span className="text-accent">Admin</span>
                </Link>
                <Link to="/" className="ml-auto text-sm text-textColor hover:text-title">
                    ← на сайт
                </Link>
            </header>

            <div className="mx-auto flex max-w-7xl">
                {/* Десктопный сайдбар */}
                <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-stroke px-3 py-6 lg:block">
                    <nav className="flex flex-col gap-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                        isActive
                                            ? "bg-accent/15 text-title"
                                            : "text-textColor hover:bg-inputColor hover:text-title"
                                    }`
                                }
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Мобильный выезжающий drawer */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setDrawerOpen(false)}
                        />
                        <div className="absolute left-0 top-0 h-full w-64 border-r border-stroke bg-pageColor px-3 py-6">
                            <div className="mb-6 flex items-center justify-between px-2">
                                <span className="text-base font-semibold">Меню</span>
                                <button
                                    type="button"
                                    onClick={() => setDrawerOpen(false)}
                                    className="rounded-lg border border-stroke p-1.5"
                                    aria-label="Закрыть меню"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="flex flex-col gap-1">
                                {links.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setDrawerOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                                isActive
                                                    ? "bg-accent/15 text-title"
                                                    : "text-textColor hover:bg-inputColor hover:text-title"
                                            }`
                                        }
                                    >
                                        <span>{link.icon}</span>
                                        {link.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
