import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler } from 'react-native';
import type { SceneHandle } from '../components/GameView';
import { Game } from '../core/game';
import type { Screen } from '../types/game';
import { useAccelerometer } from './useAccelerometer';
import { useGameLoop } from './useGameLoop';
import { useRecords } from './useRecords';

export function useGameController() {
  const [initialGame] = useState(() => new Game());
  const game = useRef(initialGame);
  const scene = useRef<SceneHandle>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const currentScreen = useRef(screen);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  const [message, setMessage] = useState('');
  const [hud, setHud] = useState(game.current.hud());
  const [debug, setDebug] = useState(false);
  const hudElapsed = useRef(0);
  const renderElapsed = useRef(0);
  const lastHud = useRef(hud);
  const resumeAfterCalibration = useRef(false);
  const recordStore = useRecords();
  const navigate = useCallback((next: Screen) => {
    currentScreen.current = next;
    setScreen(next);
  }, []);
  const resetScene = useCallback(() => {
    scene.current?.reset?.();
  }, []);
  const beginFreshRun = useCallback(() => {
    const freshGame = new Game();
    game.current = freshGame;
    setHud(freshGame.hud());
    hudElapsed.current = 0;
    renderElapsed.current = 0;
    setMessage('');
    resumeAfterCalibration.current = false;
    resetScene();
    scene.current?.draw(freshGame);
  }, [resetScene]);
  const pause = useCallback(
    (reason = '') => {
      setMessage(reason);
      navigate('paused');
    },
    [navigate],
  );
  const sensor = useAccelerometer(
    foreground && (screen === 'calibration' || screen === 'playing'),
    (gesture) => {
      if (currentScreen.current === 'playing') game.current.input(gesture);
    },
    (error) => {
      if (currentScreen.current === 'playing') pause(error);
    },
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
      if (state !== 'active' && currentScreen.current === 'playing') pause();
    });
    return () => subscription.remove();
  }, [pause]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen.current === 'playing') {
        pause();
        return true;
      }
      if (currentScreen.current !== 'home') {
        navigate('home');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [navigate, pause]);
  useEffect(() => {
    if (screen !== 'falling') return;
    const timer = setTimeout(() => navigate('over'), 550);
    return () => clearTimeout(timer);
  }, [screen, navigate]);

  useGameLoop(screen === 'playing' && foreground, (dt) => {
    if (currentScreen.current !== 'playing' || !sensor.isLive()) return;
    const engine = game.current;
    engine.tick(dt);
    renderElapsed.current += dt;
    if (renderElapsed.current >= 1 / 60 || engine.over) {
      scene.current?.draw(engine);
      renderElapsed.current = 0;
    }
    hudElapsed.current += dt;
    if (hudElapsed.current >= 0.2 || engine.over) {
      const nextHud = engine.hud();
      if (
        engine.over ||
        nextHud.distance !== lastHud.current.distance ||
        nextHud.score !== lastHud.current.score ||
        nextHud.speed !== lastHud.current.speed ||
        nextHud.dodged !== lastHud.current.dodged
      ) {
        lastHud.current = nextHud;
        setHud(nextHud);
      }
      hudElapsed.current = 0;
    }
    if (engine.over) {
      navigate('falling');
      recordStore.finish(engine.hud());
    }
  });

  const start = () => {
    beginFreshRun();
    navigate('calibration');
  };
  const calibrate = () => {
    if (!sensor.calibrate()) {
      setMessage(
        'Segure o celular em pé, levemente inclinado para você, e mantenha-o parado por 1 segundo.',
      );
      return;
    }
    setMessage('');
    navigate('playing');
  };
  const recalibrate = () => {
    resumeAfterCalibration.current = true;
    setMessage('');
    navigate('calibration');
  };
  const backFromCalibration = () => {
    resetScene();
    navigate(resumeAfterCalibration.current ? 'paused' : 'home');
  };
  return {
    game,
    scene,
    screen,
    hud,
    message,
    sensor,
    debug,
    recordStore,
    toggleDebug: () => setDebug((value) => !value),
    start,
    calibrate,
    recalibrate,
    backFromCalibration,
    pause: () => pause(),
    resume: () => {
      setMessage('');
      navigate('playing');
    },
    menu: () => {
      resetScene();
      navigate('home');
    },
  };
}
export type GameController = ReturnType<typeof useGameController>;
