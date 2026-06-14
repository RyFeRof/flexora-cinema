import { NavLink } from "react-router-dom";

const links= [
    { to: "/", label: "Главная" },
    { to: "/films", label: "Фильм" },
    { to: "/series", label: "Сериал" },
]

export default function NavigationBtn() {
    return (
        <nav>
            {
                links.map(link => (
                    <NavLink key={link.to} 
                    to={link.to} 
                    end={link.to === '/'} 
                    className={({ isActive }) => `border-b-2 pb-1 transition-colors ${
                        isActive ? `border-amber-500 text-white` : `border-transparent text-gray-400 hover:text-white`
                    }`}>
                        {link.label}
                    </NavLink>
                ))
            }
        </nav>
    )
}