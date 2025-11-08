export type StreamHandler = {
  onText?: (t: string) => void; // raw text chunks
  onEvent?: (event: string, data: string) => void; // for SSE events
  onDone?: () => void;
  onError?: (e: unknown) => void;
};

export async function postStream(
  url: string,
  payload: unknown,
  h: StreamHandler
) {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.body) throw new Error(`No body: ${res.status}`);
    const contentType = res.headers.get("content-type") || "";

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const isSSE = contentType.includes("text/event-stream");
    const isNDJSON = contentType.includes("application/x-ndjson");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (isSSE) {
        buffer += chunk;
        // SSE frames are lines; parse leniently
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? ""; // keep partial
        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("event:")) {
            // e.g., "event: token"
            const ev = line.slice(6).trim();
            h.onEvent?.(ev, "");
          } else if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data === "[DONE]") continue; // common terminator
            try {
              // Try to parse as JSON to check for type field
              const obj = JSON.parse(data);
              if (obj.type === "content" && obj.content) {
                h.onText?.(String(obj.content));
              } else if (!obj.type) {
                // Legacy format or plain text
                h.onText?.(data);
              }
              h.onEvent?.("message", data);
            } catch {
              // Not JSON, treat as plain text
              h.onEvent?.("message", data);
              h.onText?.(data);
            }
          }
        }
      } else if (isNDJSON) {
        buffer += chunk;
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const p of parts) {
          if (!p.trim()) continue;
          try {
            const obj = JSON.parse(p);
            // Only process content type messages, ignore metadata and final
            if (obj.type === "content" && obj.content) {
              h.onText?.(String(obj.content));
            }
            // Handle legacy format for backward compatibility
            else if (!obj.type) {
              const text = obj.text ?? obj.delta ?? obj.data ?? "";
              if (text) h.onText?.(String(text));
            }
          } catch {
            // not valid JSON line; ignore
          }
        }
      } else {
        // Plain chunked text - might contain JSON objects
        buffer += chunk;
        // Try to parse complete JSON objects (newline-delimited or separated)
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            // Only process content type messages
            if (obj.type === "content" && obj.content) {
              h.onText?.(String(obj.content));
            }
            // Ignore metadata, final, and other types
          } catch {
            // Not JSON, might be plain text - pass through
            if (line.trim()) {
              h.onText?.(line);
            }
          }
        }
      }
    }

    // Handle remaining buffer for plain text format
    if (buffer && !isSSE && !isNDJSON) {
      try {
        const obj = JSON.parse(buffer);
        if (obj.type === "content" && obj.content) {
          h.onText?.(String(obj.content));
        }
      } catch {
        // Not JSON or incomplete, ignore
      }
    }

    h.onDone?.();
  } catch (e) {
    h.onError?.(e);
  }
}
