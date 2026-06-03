export interface Trailer {
    id: number | null
    path: string | null
}

export interface Logo {
    id: number | null
    path: string | null
}

export interface Card {
    id: number | null
    path: string | null
    is_horizontal: boolean | null
}

export interface Film {
    id: number | null
    title: string | null
    is_serial: boolean | null
    trailer: Trailer | null
    card: Card | null
    logo: Logo | null
    description: string | null
}

export interface Release {
    id: number | null
    film_id: number | null
    number_seria: number | null
    title: string | null
    number_season: number | null
    material: string | null
    time_intro: string | null
    time_outro: string | null
    time_intro_end: string | null
    time_outro_end: string | null
}