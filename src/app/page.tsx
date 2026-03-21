import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">🎮 Kamis Maker</h1>
      <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
        Classify and rank your played games and watched movies with custom tier
        categories &mdash; from Red to Platinum.
      </p>

      <div className="grid gap-6 sm:grid-cols-3 max-w-2xl mx-auto">
        <Link
          href="/games"
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition-colors group"
        >
          <div className="text-3xl mb-3">🎮</div>
          <h2 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
            Games
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Track and rank your played games
          </p>
        </Link>

        <Link
          href="/movies"
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition-colors group"
        >
          <div className="text-3xl mb-3">🎬</div>
          <h2 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
            Movies
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Track and rank your watched movies
          </p>
        </Link>

        <Link
          href="/tierlist"
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors group"
        >
          <div className="text-3xl mb-3">🏆</div>
          <h2 className="text-lg font-semibold group-hover:text-green-400 transition-colors">
            Tier List
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            View and export as PNG
          </p>
        </Link>
      </div>

      <div className="mt-16">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Score Tiers
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { name: "Red", color: "bg-red-600 text-white" },
            { name: "Yellow", color: "bg-yellow-400 text-black" },
            { name: "Bronze Yellow", color: "bg-yellow-600 text-white" },
            { name: "Bronze", color: "bg-amber-700 text-white" },
            { name: "Silver Bronze", color: "bg-stone-400 text-black" },
            { name: "Silver", color: "bg-gray-300 text-black" },
            { name: "Gold Silver", color: "bg-amber-300 text-black" },
            { name: "Gold", color: "bg-yellow-500 text-black" },
            { name: "Platinum Gold", color: "bg-cyan-300 text-black" },
            { name: "Platinum", color: "bg-cyan-100 text-black" },
          ].map((tier) => (
            <span
              key={tier.name}
              className={`px-3 py-1.5 rounded text-xs font-semibold ${tier.color}`}
            >
              {tier.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
