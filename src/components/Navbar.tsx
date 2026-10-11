"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayersIcon } from "@/components/Icons";
import { useSlidingPill } from "@/components/useSlidingPill";

const links = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/movies", label: "Movies" },
  { href: "/tierlist", label: "Tier List" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { containerRef, pillRef } = useSlidingPill(pathname);

  return (
    <nav className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="glass max-w-6xl mx-auto rounded-full pl-3 pr-1.5 flex items-center h-14 gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight shrink-0">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-[0_4px_14px_-2px_rgba(37,99,235,0.6),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <LayersIcon size={17} />
          </span>
          <span className="hidden sm:inline text-gradient text-lg">Kamis Maker</span>
        </Link>
        <div ref={containerRef} className="relative flex gap-0.5 sm:gap-1 ml-auto">
          <span ref={pillRef} className="pill-indicator" aria-hidden="true" />
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-pill-key={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="pill-item px-2.5 sm:px-4 py-2 text-[13px] sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
