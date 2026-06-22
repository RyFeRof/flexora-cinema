import { useState } from "react";
import Logo from "./Logo";
import NavigationBtn from "./navigation";
import SearchBar from "./searchBar";
import ProfileBtn from "./profileButton";

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false)

    return (
        <header className="fixed z-40 top-0 w-full border-b border-stroke bg-pageColor/20 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
                <Logo />
                {!searchOpen && <div className="m-auto">
                    <NavigationBtn/>    
                </div>}
                <div className="flex items-center gap-5">
                    <SearchBar
                        isOpen={searchOpen}
                        onOpen={() => setSearchOpen(true)}
                        onClose={() => setSearchOpen(false)}
                    />
                    {!searchOpen && <ProfileBtn />}
                </div>
            </div>
        </header>
    )
}