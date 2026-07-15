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

export interface Genre {
    id: number
    genre: string
}

export interface Country {
    id: number
    country: string
}

export interface Role {
    id: number
    role: string
}

export interface Member {
    id: number
    member: string
}

export interface FilmingMemberEntry {
    id: number
    role_id: number
}

export interface Timeline {
    time_intro: string
    time_outro: string
    time_intro_end: string
    time_outro_end: string
}

export interface CreateFilmRequest {
    title: string
    description: string
    is_serial: boolean
    genre_ids: number[]
    country_ids: number[]
    filming_members: FilmingMemberEntry[]
    card_path: string
    is_horizontal: boolean
    logo_path: string
    trailer_path: string
    material_path: string
    time_line: Timeline
    date_create: string 
}

export interface Film {
    id: number | null
    title: string | null
    is_serial: boolean | null
    trailer: Trailer | null
    card: Card | null
    logo: Logo | null
    description: string | null
    genres?: Genre[] | null
    countries?: Country[] | null
    created_at?: string | null
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

export interface User {
    id: number | null
    name: string | null
    login: string | null
    password: string | null
    mail: string | null
    phone_number: string | null
    createdAt: Date | null
}