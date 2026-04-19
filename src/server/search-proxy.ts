import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string().min(1).max(400),
});

// DuckDuckGo Instant Answer API + HTML results scraping fallback.
// No API key required. We use the Instant Answer API for structured results
// and supplement with RelatedTopics for web-style listings.
export const braveSearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const url = new URL("https://api.duckduckgo.com/");
      url.searchParams.set("q", data.query);
      url.searchParams.set("format", "json");
      url.searchParams.set("no_html", "1");
      url.searchParams.set("skip_disambig", "1");
      url.searchParams.set("t", "greedseye");

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        return {
          ok: false as const,
          status: res.status,
          error: `The oracle stumbled (${res.status}).`,
          results: [],
        };
      }

      const json: any = await res.json();
      const results: Array<{
        title: string;
        url: string;
        description: string;
        age?: string;
      }> = [];

      // Abstract / instant answer
      if (json.AbstractURL && json.AbstractText) {
        results.push({
          title: json.Heading || data.query,
          url: json.AbstractURL,
          description: json.AbstractText,
        });
      }

      // Definition (often present for noun queries)
      if (json.Definition && json.DefinitionURL) {
        results.push({
          title: `Definition: ${json.Heading || data.query}`,
          url: json.DefinitionURL,
          description: json.Definition,
        });
      }

      // Walk RelatedTopics (may contain nested Topics arrays)
      const walk = (items: any[]) => {
        for (const item of items) {
          if (!item) continue;
          if (Array.isArray(item.Topics)) {
            walk(item.Topics);
          } else if (item.FirstURL && item.Text) {
            const text = String(item.Text);
            const splitIdx = text.indexOf(" - ");
            const title = splitIdx > -1 ? text.slice(0, splitIdx) : text;
            const description = splitIdx > -1 ? text.slice(splitIdx + 3) : text;
            results.push({
              title,
              url: String(item.FirstURL),
              description,
            });
          }
        }
      };
      if (Array.isArray(json.RelatedTopics)) walk(json.RelatedTopics);

      // Results array (rare but possible)
      if (Array.isArray(json.Results)) walk(json.Results);

      // Deduplicate by URL
      const seen = new Set<string>();
      const deduped = results.filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
      });

      return { ok: true as const, results: deduped, query: data.query };
    } catch (err) {
      console.error("duckDuckGoSearch failed", err);
      return {
        ok: false as const,
        status: 500,
        error: "The oracle could not be reached.",
        results: [],
      };
    }
  });
