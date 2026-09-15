import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY, loadRecords, saveRecords } from '../services/storage';
import type { Hud } from '../types/game';

export function useRecords() {
  const [records, setRecords] = useState({ ...EMPTY });
  const current = useRef(records);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const canSave = useRef(false);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let cancelled = false;
    loadRecords()
      .then((value) => {
        if (cancelled) return;
        current.current = value;
        setRecords(value);
        canSave.current = true;
      })
      .catch(() => {
        if (!cancelled)
          setError('Recordes anteriores indisponíveis. Esta sessão não substituirá seus dados.');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const finish = useCallback((result: Hud) => {
    const previous = current.current;
    const next = {
      distance: Math.max(previous.distance, result.distance),
      score: Math.max(previous.score, result.score),
      games: previous.games + 1,
    };
    current.current = next;
    setRecords(next);
    if (canSave.current)
      queue.current = queue.current
        .then(() => saveRecords(next))
        .catch(() => setError('O recorde desta sessão não pôde ser salvo.'));
  }, []);
  return { records, loaded, error, finish };
}
