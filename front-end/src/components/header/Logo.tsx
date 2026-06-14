import { Link } from 'react-router-dom'
import logo from "../../assets/flexora logo.svg"
export default function Logo(){
    return (
        <Link to="/" className="">
            <img src={logo} alt="Flexora kino" />
        </Link>
    )
}