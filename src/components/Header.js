"use client" 

import { usePathname } from "next/navigation";
import { useModal } from "../context/ModalContext";

//Header component
export default function Header() {
    const pathname = usePathname();
    const { setShowMore } = useModal();

    if (pathname === "/") return null;

    return (
      <header className="bg-[#9C9191] text-[#DCD9D9] py-1 px-1 rounded-b-lg z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          {/** Left: hyperlink */}
          <a
            href="/feed"
            className="text-lg font-bold hover:underline"
          >
              UNBOUND
          </a>
          {/** Right: button */}
          {/* Right: More element */}
          <button 
            onClick={() => setShowMore(true)}
            className="px-3 py-1 bg-[#DCD9D9] text-[#9C9191] rounded hover:bg-[#C7BEBE] transition"
            >
              More
            </button>
        </nav>
      </header>
    );
  }