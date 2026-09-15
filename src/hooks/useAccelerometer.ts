import { useCallback, useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { SENSOR } from '../config/game';
import { GestureDetector } from '../core/sensor';
import type { Gesture, Vector } from '../types/game';

type Status = 'idle' | 'starting' | 'ready' | 'error';
type Sample = { value: Vector; time: number };

export function useAccelerometer(
  enabled: boolean,
  onGesture: (gesture: Gesture) => void,
  onError: (message: string) => void,
) {
  const detector = useRef(new GestureDetector());
  const raw = useRef<Vector>({ x: 0, y: 0, z: 0 });
  const samples = useRef<Sample[]>([]);
  const cursor = useRef(0);
  const lastSample = useRef(0);
  const readyRef = useRef(false);
  const callbacks = useRef({ onGesture, onError });
  callbacks.current = { onGesture, onError };
  const [state, setState] = useState<{ status: Status; error: string }>({
    status: 'idle',
    error: '',
  });

  useEffect(() => {
    readyRef.current = false;
    if (!enabled) {
      setState({ status: 'idle', error: '' });
      return;
    }
    let cancelled = false;
    let subscription: ReturnType<typeof Accelerometer.addListener> | undefined;
    let watchdog: ReturnType<typeof setInterval> | undefined;
    let live = false;
    samples.current = [];
    cursor.current = 0;
    detector.current.reset();
    setState({ status: 'starting', error: '' });
    const fail = (message: string) => {
      if (cancelled) return;
      readyRef.current = false;
      setState({ status: 'error', error: message });
      callbacks.current.onError(message);
    };
    void (async () => {
      try {
        const permission = await Accelerometer.requestPermissionsAsync();
        if (cancelled) return;
        if (!permission.granted) {
          fail('Permita o acesso aos movimentos nas configurações.');
          return;
        }
        const available = await Accelerometer.isAvailableAsync();
        if (cancelled) return;
        if (!available) {
          fail('Acelerômetro indisponível. Abra no Expo Go em um celular físico.');
          return;
        }
        Accelerometer.setUpdateInterval(SENSOR.interval);
        lastSample.current = Date.now();
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          if (cancelled || ![x, y, z].every(Number.isFinite)) return;
          const now = Date.now();
          const value = { x, y, z };
          raw.current = value;
          samples.current[cursor.current] = { value, time: now };
          cursor.current = (cursor.current + 1) % 64;
          lastSample.current = now;
          readyRef.current = true;
          if (!live) {
            live = true;
            setState({ status: 'ready', error: '' });
          }
          const gesture = detector.current.update(value, now);
          if (gesture) callbacks.current.onGesture(gesture);
        });
        watchdog = setInterval(() => {
          if (Date.now() - lastSample.current > SENSOR.staleAfter) {
            live = false;
            fail('As leituras do sensor pararam. Confira a permissão e tente continuar.');
            subscription?.remove();
            if (watchdog) clearInterval(watchdog);
          }
        }, 250);
      } catch {
        fail('Não foi possível iniciar o sensor de movimento.');
      }
    })();
    return () => {
      cancelled = true;
      readyRef.current = false;
      subscription?.remove();
      if (watchdog) clearInterval(watchdog);
    };
  }, [enabled]);

  const calibrate = useCallback(
    () =>
      detector.current.calibrate(
        samples.current
          .filter((sample) => Date.now() - sample.time < SENSOR.calibrationWindow)
          .map((sample) => sample.value),
      ),
    [],
  );
  const isLive = useCallback(
    () => readyRef.current && Date.now() - lastSample.current < SENSOR.staleAfter,
    [],
  );
  return { ...state, raw, detector, calibrate, isLive, ready: enabled && state.status === 'ready' };
}
