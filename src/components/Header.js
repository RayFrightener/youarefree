"use client";

import { usePathname } from "next/navigation";
import { useModal } from "../context/ModalContext";

//Header component
export default function Header() {
  const pathname = usePathname();
  const { setShowMore } = useModal();

  if (pathname === "/") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm bg-[#1A1616]/60 border-b border-[#DCD9D9]/10">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-5 py-3">
        <a
          href="/feed"
          className="text-sm tracking-[0.4em] text-[#DCD9D9] uppercase"
        >
          UNBOUND
        </a>
        <button
          onClick={() => setShowMore(true)}
          className="px-4 py-2 rounded-full bg-[#DCD9D9]/80 text-[#4E4A4A] text-xs uppercase tracking-[0.3em] hover:bg-[#DCD9D9] transition-colors cursor-pointer"
        >
          More
        </button>
      </nav>
    </header>
  );
}
