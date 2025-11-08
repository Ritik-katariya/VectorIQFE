'use client';

import { useCallback, useState } from 'react';
import { postStream } from '../lib/stream';
import { queryMessagesType } from '@/types/upload-data-item';

export function useQueryStream() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (payload: queryMessagesType) => {
    setText('');
    setError(null);
    setIsStreaming(true);

    await postStream('/api/query', payload, {
      onText: (t) => setText((prev) => prev + t),
      onError: (e) => setError(e instanceof Error ? e.message : String(e)),
      onDone: () => setIsStreaming(false),
    });
  }, []);

  return { text, isStreaming, error, run };
}
