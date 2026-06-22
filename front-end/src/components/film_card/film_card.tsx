import type { Film } from "../../types";

interface Props {
    film: Film
    onClick: (film: Film) => void
    isSelected: boolean
}
export default function FilmCard({ film, onClick, isSelected }: Props) {
    return (
        <button
            onClick={() => onClick(film)}
            className={`group relative aspect-[2/3] w-full overflow-hidden rounded-lg border bg-cardColor transition-colors ${
                isSelected ? "border-accent" : "border-stroke hover:border-textColor"
            }`}
        >
            <img
                src={film.card?.path ?? ''}
                alt={film.title ?? ''}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2.5 pb-2.5 pt-6">
                <span className="line-clamp-1 text-left text-sm font-medium text-title">{film.title}</span>
            </div>
        </button>
    )
}