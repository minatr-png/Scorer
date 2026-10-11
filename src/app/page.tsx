import Link from "next/link";
import { SCORE_COLORS } from "@/lib/constants";
import { ArrowRightIcon, FilmIcon, GamepadIcon, TrophyIcon } from "@/components/Icons";

const sections = [
  { href: "/games", Icon: GamepadIcon, title: "Games", text: "Track and rank your played games" },
  { href: "/movies", Icon: FilmIcon, title: "Movies", text: "Track and rank your watched movies" },
  { href: "/tierlist", Icon: TrophyIcon, title: "Tier List", text: "View and export as PNG" },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.8)]" />
        Your personal rankings
      </span>
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5">
        <span className="text-gradient">Kamis Maker</span>
      </h1>
      <p className="text-lg text-slate-600 mb-14 max-w-xl mx-auto">
        Classify and rank your played games and watched movies with custom tier
        categories &mdash; from Red to Platinum.
      </p>

      <div className="grid gap-5 sm:grid-cols-3 max-w-3xl mx-auto">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="glass glass-hover rounded-3xl p-6 text-left group"
          >
            <div className="grid place-items-center w-12 h-12 rounded-2xl bg-white/70 border border-white text-blue-600 mb-4 shadow-[inset_0_1px_0_#fff,0_6px_18px_-6px_rgba(37,99,235,0.45)]">
              <s.Icon size={24} />
            </div>
            <h2 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {s.title} <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">{s.text}</p>
          </Link>
        ))}
      </div>

      <div className="glass rounded-3xl mt-16 p-6 max-w-3xl mx-auto">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Score Tiers
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(SCORE_COLORS).map(([name, c]) => (
            <span
              key={name}
              className={`gloss px-3 py-1.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
