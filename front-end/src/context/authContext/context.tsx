import { createContext,useContext, useState } from "react";
type AuthedContextType = {
    authed: boolean,
    setAuthed: (val:boolean) => void
}
const AuthContext = createContext<AuthedContextType | null>(null)
export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [authed, setAuthed] = useState(false)
    return (
        <AuthContext.Provider value={ {authed,setAuthed} }>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider")
    return ctx
}