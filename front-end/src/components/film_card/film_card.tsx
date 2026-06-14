import type { Film } from "../../types";

interface Props {
    film: Film
    onClick: (film: Film) => void
    isSelected: boolean  // было is_selected
}
export default function FilmCard({ film, onClick, isSelected }: Props) {
    return (
        <div>
            <img src={film.card?.path ?? ''} 
                alt={film.title ?? ''} 
                className=" w-full h-full object-cover " />
        </div>
    )
}