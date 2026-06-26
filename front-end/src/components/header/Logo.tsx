import { Link } from 'react-router-dom'
import logo from "../../assets/flexora logo.svg"
export default function Logo(){
    return (
        <Link to="/add" className="shrink-0 transition-opacity hover:opacity-80">
            <img src={logo} alt="Flexora kino" className="h-12 w-auto" />
        </Link>
    )
}