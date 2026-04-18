import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import logo from "@/assets/greeds-eye-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { braveSearch } from "@/server/brave-search";

export const Route = createFileRoute("/")({
  component: Index,
});

interface SearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  profile?: string;
}

function Index() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useServerFn(braveSearch);

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setSubmitted(q);
    try {
      const data = await search({ data: { query: q } });
      if (!data.ok) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError("Could not reach the oracle.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = results.length > 0;
  const heroMode = !submitted && !loading;

  const hieroglyphs = useMemo(
    () => "𓂀 𓋹 𓍯 𓆣 𓊪 𓏏 𓇋 𓃭 𓎼 𓊃 𓋴 𓅓 𓏤 𓂀".split(" "),
    [],
  );

  const coins = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        left: Math.random() * 100,
        duration: 6 + Math.random() * 8,
        delay: -Math.random() * 12,
        scale: 0.6 + Math.random() * 1.1,
      })),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background sigils */}
      <div className="pointer-events-none absolute inset-0 select-none opacity-[0.04]">
        <div className="display absolute -top-10 -left-10 text-[14rem] text-primary rotate-12">𓂀</div>
        <div className="display absolute bottom-0 -right-16 text-[18rem] text-primary -rotate-12">𓂀</div>
      </div>

      {/* Falling gold coins */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {coins.map((c, i) => (
          <span
            key={i}
            className="coin"
            style={{
              left: `${c.left}%`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
              transform: `scale(${c.scale})`,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Greed's Eye emblem" width={36} height={36} />
          <span className="display text-sm tracking-[0.3em] text-gold-gradient">GREED'S EYE</span>
        </div>
        <span className="display text-xs tracking-[0.4em] text-muted-foreground">𓋹 𓂀 𓊪</span>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4">
        {/* Hero */}
        <section
          className={`flex flex-col items-center text-center transition-all duration-700 ${
            heroMode ? "pt-10 sm:pt-16" : "pt-2"
          }`}
        >
          <img
            src={logo}
            alt="Eye of Ra cradling a golden doubloon — Greed's Eye logo"
            width={heroMode ? 280 : 110}
            height={heroMode ? 280 : 110}
            className={`animate-glow transition-all duration-700 ${heroMode ? "drop-shadow-2xl" : ""}`}
          />

          {heroMode && (
            <>
              <h1 className="display mt-6 text-5xl sm:text-7xl font-semibold text-gold-gradient">
                Greed's Eye
              </h1>
              <p className="display mt-4 text-base sm:text-lg tracking-[0.25em] uppercase text-primary/80">
                Ask and you shall receive
              </p>
              <div className="mt-4 flex gap-3 text-xs tracking-[0.4em] text-primary/50 animate-shimmer">
                {hieroglyphs.slice(0, 7).map((g, i) => (
                  <span key={i}>{g}</span>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Search form */}
        <form onSubmit={onSearch} className={`mx-auto mt-8 ${heroMode ? "max-w-2xl" : "max-w-3xl"}`}>
          <div className="ornate-frame group flex items-center gap-2 rounded-md bg-card/80 px-3 py-2 backdrop-blur">
            <Search className="h-5 w-5 shrink-0 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the eye…"
              className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Seek"}
            </Button>
          </div>
        </form>

        {/* Results */}
        <section className="mx-auto mt-10 max-w-3xl pb-24">
          {error && (
            <div className="ornate-frame rounded-md bg-destructive/10 p-4 text-sm text-destructive-foreground">
              <span className="font-semibold">The eye is clouded:</span> {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="italic">The oracle peers across the sands…</p>
            </div>
          )}

          {!loading && submitted && !error && (
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {hasResults ? `${results.length} visions of "${submitted}"` : `No visions for "${submitted}"`}
            </p>
          )}

          <ul className="space-y-5">
            {results.map((r, i) => (
              <li
                key={r.url + i}
                className="group rounded-md border border-transparent p-4 transition hover:border-gold hover:bg-card/50"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{safeHost(r.url)}</span>
                  {r.age && <span className="text-primary/60">· {r.age}</span>}
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-baseline gap-2"
                >
                  <h2 className="display text-lg font-medium text-foreground transition group-hover:text-primary">
                    {r.title}
                  </h2>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary/60 opacity-0 transition group-hover:opacity-100" />
                </a>
                <p
                  className="mt-1 text-sm leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: r.description }}
                />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gold/30 py-6 text-center text-xs tracking-[0.3em] text-muted-foreground">
        𓂀 &nbsp;
        <a
          href="https://greedy-lol-ok-b.cdm"
          className="hover:text-primary transition-colors"
        >
          greedy-lol-ok-b.cdm
        </a>
        &nbsp; · &nbsp; ALL THAT GLITTERS IS INDEXED &nbsp; 𓂀
      </footer>
    </div>
  );
}

function safeHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
