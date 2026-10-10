export function formatCreatedAt(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

export function formatPhone(raw: string): string {
    const d = raw.replace(/\D/g, "")
    if (d.length !== 11) return raw || "—"
    return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`
}

export function getInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase() || "?"
}
