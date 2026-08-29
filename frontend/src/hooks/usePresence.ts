"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * How many people are reading the page right now.
 *
 * `EventSource` rather than polling: the server already knows the number the
 * moment it changes, and an open stream is also how it knows a reader has left
 * — the socket closing is the signal. It reconnects on its own after a drop,
 * which matters on a free tier that sleeps.
 *
 * Returns null until a count arrives, and stays null if the API is unreachable,
 * so the caller can render nothing rather than a lonely "0".
 */
export function usePresence() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let source: EventSource;
    try {
      source = new EventSource(`${API_URL}/api/presence`);
    } catch {
      return;
    }

    source.addEventListener("presence", (event) => {
      try {
        const { count: value } = JSON.parse((event as MessageEvent).data) as { count: number };
        if (Number.isFinite(value)) setCount(value);
      } catch {
        // a malformed frame shouldn't kill the stream
      }
    });

    // EventSource retries by itself; this only stops the count going stale
    // while it is disconnected.
    source.onerror = () => setCount(null);

    return () => source.close();
  }, []);

  return count;
}
