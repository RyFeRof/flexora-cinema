import type { Film } from "../../types";

interface Props {
    film: Film
    onClick: (film: Film) => void
    is_selected: boolean
}

export default function FilmCard({ film, onClick, is_selected }: Props) {
    return (
        <div className="bg-black min-h-screen text-white p-8">
            <img src={film.card?.path ?? ''} 
                alt={film.title ?? ''} 
                className=" w-full h-full object-cover " />
        </div>
    )
}