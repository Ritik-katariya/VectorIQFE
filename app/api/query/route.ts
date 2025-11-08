// app/api/query/route.ts
export const runtime = "nodejs"; // streaming-friendly

const baseUrl = process.env.VECTOR_FASTAPI_BASE_URL!;

export async function POST(req: Request) {
  const init: RequestInit = {
    method: "POST",
    // forward JSON body
    body: await req.text(), // read once, then pass along
    headers: {
      "Content-Type": "application/json",
      // Ask upstream to stream; adjust if your API expects something else
      Accept: "text/event-stream, application/x-ndjson, application/json",
    },
  };

  const upstream = await fetch(`${baseUrl}/query`, init);
  if (!upstream.ok || !upstream.body) {
    return new Response(await upstream.text(), { status: upstream.status });
  }

  // Pipe the upstream stream through
  const readable = new ReadableStream({
    start(controller) {
      const reader = upstream.body!.getReader();
      (function pump() {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          pump();
        }).catch((err) => {
          controller.error(err);
        });
      })();
    },
  });

  // Preserve content-type if provided (SSE or NDJSON)
  const contentType =
    upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8";

  return new Response(readable, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Let the browser render progressively
      "Transfer-Encoding": "chunked",
    },
    status: upstream.status,
  });
}
