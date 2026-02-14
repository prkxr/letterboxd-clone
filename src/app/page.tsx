const trendingFilms = [
  { title: "The Red Shoes", year: 1948, genre: "Drama · Music" },
  { title: "Past Lives", year: 2023, genre: "Romance · Drama" },
  { title: "Chungking Express", year: 1994, genre: "Crime · Romance" },
];

const recentDiary = [
  { title: "La Haine", date: "Watched 2 days ago", note: "Still crackles with urgency." },
  {
    title: "Portrait of a Lady on Fire",
    date: "Watched this week",
    note: "A slow burn with devastating payoff.",
  },
  {
    title: "Moonlight",
    date: "Rewatched",
    note: "Quiet, intimate, and endlessly generous.",
  },
];

const userLists = [
  "Rainy Night Neo-Noirs",
  "Cozy 90-Minute Watches",
  "One-Location Thrillers",
  "Autumn Rewatch Canon",
];

export default function Home() {
  return (
    <main className="film-grain min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="poster-card p-6 md:p-8">
          <p className="text-sm tracking-[0.2em] text-ink-muted uppercase">
            CineMood Dashboard
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight font-semibold md:text-5xl">
            Welcome back, Ava.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-muted md:text-lg">
            Keep your film diary warm, follow what the community is loving, and
            find the right watch for your mood tonight.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="poster-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">
                Trending Films
              </h2>
              <button className="rounded-full border border-border px-4 py-1.5 text-sm text-ink-muted transition hover:border-accent hover:text-accent">
                Explore all
              </button>
            </div>

            <ul className="grid gap-4 md:grid-cols-3">
              {trendingFilms.map((film) => (
                <li key={film.title} className="polaroid-card p-4">
                  <div className="mb-3 aspect-[3/4] rounded-md bg-[linear-gradient(140deg,var(--color-accent-soft),#c6a27e)]" />
                  <h3 className="font-display text-xl font-semibold">
                    {film.title}
                  </h3>
                  <p className="text-sm text-ink-muted">{film.year}</p>
                  <p className="mt-1 text-sm text-ink-muted">{film.genre}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="poster-card p-5">
            <h2 className="font-display text-2xl font-semibold">
              Mood Recommender
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Unsure what to watch? Tell us your vibe and we&apos;ll suggest the
              perfect pick.
            </p>
            <button className="mt-5 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-[#f9efe0] transition hover:bg-accent-soft">
              Start mood match
            </button>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="poster-card p-5">
            <h2 className="font-display text-2xl font-semibold">
              Recent Diary Entries
            </h2>
            <ul className="mt-4 space-y-3">
              {recentDiary.map((entry) => (
                <li
                  key={entry.title}
                  className="rounded-xl border border-border/80 bg-surface px-4 py-3"
                >
                  <p className="font-display text-xl font-semibold">
                    {entry.title}
                  </p>
                  <p className="text-xs tracking-wide text-ink-muted uppercase">
                    {entry.date}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{entry.note}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="poster-card p-5">
            <h2 className="font-display text-2xl font-semibold">
              Your Lists
            </h2>
            <ul className="mt-4 space-y-2">
              {userLists.map((list) => (
                <li
                  key={list}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-surface px-4 py-3"
                >
                  <span>{list}</span>
                  <span className="text-sm text-ink-muted">View</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
