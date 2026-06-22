import { NavLink } from "react-router-dom";

const links= [
    { to: "/", label: "Главная" },
    { to: "/films", label: "Фильмы" },
    { to: "/series", label: "Сериалы" },
]

export default function NavigationBtn() {
    return (
        <nav className="flex items-center gap-12">
            {
                links.map(link => (
                    <NavLink key={link.to} 
                    to={link.to} 
                    end={link.to === '/'} 
                    className={({ isActive }) => `text-lg  border-b-2 transition-colors ${
                        isActive ? `border-accent text-title` : `border-transparent text-textColor hover:text-title`
                    }`}>
                        {link.label}
                    </NavLink>
                ))
            }
        </nav>
    )
}