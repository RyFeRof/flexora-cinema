import { useState } from "react";
import Logo from "./Logo";
import NavigationBtn from "./navigation";
import SearchBar from "./searchBar";
import ProfileBtn from "./profileButton";
import { ProfilePanel } from "../../widgets/profile-panel";

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    return (
        <>
        <header className="fixed z-40 top-0 w-full border-b border-stroke bg-pageColor/20 backdrop-blur-md">
            <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-4 px-4 sm:px-6 md:flex-nowrap md:gap-8">
                <div className={searchOpen ? "hidden sm:block" : ""}><Logo /></div>
                {!searchOpen && <div className="order-last w-full overflow-x-auto pb-2 md:order-none md:m-auto md:w-auto md:pb-0">
                    <NavigationBtn/>
                </div>}
                <div className={`flex items-center gap-4 sm:gap-5 ${searchOpen ? "flex-1 justify-end sm:flex-none" : "ml-auto md:ml-0"}`}>
                    <SearchBar
                        isOpen={searchOpen}
                        onOpen={() => setSearchOpen(true)}
                        onClose={() => setSearchOpen(false)}
                    />
                    {!searchOpen && <ProfileBtn expanded={profileOpen} onClick={() => setProfileOpen(true)} />}
                </div>
            </div>
        </header>
        {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
        </>
    )
}