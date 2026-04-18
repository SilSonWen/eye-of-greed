import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const query = typeof body?.query === "string" ? body.query.trim() : "";
          const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
          const offset = Number.isFinite(body?.offset) ? Math.max(0, Math.min(9, Number(body.offset))) : 0;

          if (!query) {
            return Response.json({ error: "Query is required" }, { status: 400 });
          }
          if (!apiKey) {
            return Response.json({ error: "Brave API key is required" }, { status: 400 });
          }
          if (query.length > 400) {
            return Response.json({ error: "Query too long" }, { status: 400 });
          }

          const url = new URL("https://api.search.brave.com/res/v1/web/search");
          url.searchParams.set("q", query);
          url.searchParams.set("count", "20");
          url.searchParams.set("offset", String(offset));

          const res = await fetch(url, {
            headers: {
              Accept: "application/json",
              "Accept-Encoding": "gzip",
              "X-Subscription-Token": apiKey,
            },
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            return Response.json(
              { error: `Brave API error (${res.status})`, detail: text.slice(0, 300) },
              { status: res.status === 401 ? 401 : 502 },
            );
          }

          const data = await res.json();
          return Response.json({
            query: data?.query?.original ?? query,
            results: (data?.web?.results ?? []).map((r: any) => ({
              title: r.title,
              url: r.url,
              description: r.description,
              age: r.age,
              profile: r.profile?.name,
            })),
            mixed: data?.web?.results?.length ?? 0,
          });
        } catch (err) {
          console.error("search error", err);
          return Response.json({ error: "Unexpected server error" }, { status: 500 });
        }
      },
    },
  },
});
