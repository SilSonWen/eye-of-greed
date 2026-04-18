import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string().min(1).max(400),
  apiKey: z.string().min(10).max(200),
});

export const braveSearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const url = new URL("https://api.search.brave.com/res/v1/web/search");
      url.searchParams.set("q", data.query);
      url.searchParams.set("count", "20");

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": data.apiKey,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          ok: false as const,
          status: res.status,
          error:
            res.status === 401
              ? "The eye does not recognize this key."
              : `Brave API error (${res.status}). ${text.slice(0, 200)}`,
          results: [],
        };
      }

      const json = await res.json();
      const results = (json?.web?.results ?? []).map((r: any) => ({
        title: String(r.title ?? ""),
        url: String(r.url ?? ""),
        description: String(r.description ?? ""),
        age: r.age ? String(r.age) : undefined,
      }));

      return { ok: true as const, results, query: data.query };
    } catch (err) {
      console.error("braveSearch failed", err);
      return {
        ok: false as const,
        status: 500,
        error: "The oracle could not be reached.",
        results: [],
      };
    }
  });
