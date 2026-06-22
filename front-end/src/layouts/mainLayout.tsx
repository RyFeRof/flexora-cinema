import type { ReactNode } from "react";
import Header from "../components/header/header";

interface Props {
    children: ReactNode
}

export default function MainLayout({ children }: Props) {
    return (
        <div className="min-h-screen bg-pageColor text-title">
            <Header />
            <main>{children}</main>
        </div>
    )
}