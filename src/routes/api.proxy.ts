import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/proxy")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: CORS }),

      GET: async ({ request }) => {
        const { searchParams } = new URL(request.url);
        const target = searchParams.get("url");

        if (!target) {
          return new Response(
            JSON.stringify({ error: "Missing ?url parameter" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS },
            },
          );
        }

        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid URL" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS },
            },
          );
        }

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return new Response(
            JSON.stringify({ error: "Only http(s) URLs are allowed" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS },
            },
          );
        }

        try {
          const upstream = await fetch(parsed.toString(), {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (compatible; GreedsEyeProxy/1.0; +https://eye-of-greed.lovable.app)",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            redirect: "follow",
          });

          const contentType =
            upstream.headers.get("content-type") ?? "application/octet-stream";
          const body = await upstream.arrayBuffer();

          return new Response(body, {
            status: upstream.status,
            headers: {
              "Content-Type": contentType,
              "X-Proxied-Url": parsed.toString(),
              "X-Proxied-Status": String(upstream.status),
              ...CORS,
            },
          });
        } catch (err) {
          console.error("proxy fetch failed", err);
          return new Response(
            JSON.stringify({ error: "Upstream fetch failed" }),
            {
              status: 502,
              headers: { "Content-Type": "application/json", ...CORS },
            },
          );
        }
      },
    },
  },
});
