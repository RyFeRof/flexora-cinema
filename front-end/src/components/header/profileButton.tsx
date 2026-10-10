interface Props {
    expanded: boolean
    onClick: () => void
}

export default function ProfileBtn({ expanded, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Личный кабинет"
            aria-haspopup="dialog"
            aria-expanded={expanded}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-accent to-[#8341ef] transition-opacity hover:opacity-90"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
        </button>
    )
}
