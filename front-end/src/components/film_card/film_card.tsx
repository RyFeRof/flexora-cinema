import { Film } from "../../types";

interface Props {
    film: Film
    onClick: (film: Film) => void
    is_selected: boolean
}

export default function FilmCard({ film, onClick, is_selected }: Props) {
    return (
        <div>
            <img src={film.card?.path ?? ''} 
                alt={film.title ?? ''} 
                className=" w-13 h-8 object-cover " />
        </div>
    )
}