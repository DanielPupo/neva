import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PHYSICS, WORLD } from '../config/game';
import { Game } from '../core/game';
import { OBSTACLE_KINDS } from '../types/game';
import { clamp, modulo } from '../core/math';
import { createMotion, positionSprite } from '../rendering/motion';
import { project } from '../rendering/projection';
import { Environment } from './art/Environment';
import { ART_BASE, ART_HEIGHT, ART_WIDTH, ObstacleArt } from './art/ObstacleArt';
import { Rider } from './art/Rider';
import { WorldSprite } from './WorldSprite';

export type SceneHandle = { draw: (game: Game) => void };
const values = (count: number) => Array.from({ length: count }, createMotion);

export const GameView = forwardRef<SceneHandle>(function GameView(_, ref) {
  const { width, height } = useWindowDimensions();
  const motion = useMemo(
    () => ({
      obstacles: values(WORLD.obstacleCount),
      trees: values(WORLD.decorationCount * 2),
      snow: values(WORLD.snowCount),
      trail: values(WORLD.trailCount),
      rider: createMotion(),
      shadow: createMotion(),
      lean: new Animated.Value(0),
      fall: new Animated.Value(0),
      bodyScale: new Animated.Value(1),
      background: new Animated.Value(0),
    }),
    [],
  );
  const rotation = useMemo(
    () =>
      Animated.add(motion.lean, motion.fall).interpolate({
        inputRange: [-90, 90],
        outputRange: ['-90deg', '90deg'],
      }),
    [motion],
  );
  const initialGame = useMemo(() => new Game(() => 0.48), []);
  const lastGame = useRef(initialGame);
  const draw = (game: Game) => {
    lastGame.current = game;
    const cameraShift = -game.x * width * 0.01;
    const at = (x: number, z: number) => {
      const point = project(x, z, width, height);
      point.x += cameraShift;
      return point;
    };
    motion.background.setValue(cameraShift * 0.25);
    game.obstacles.forEach((obstacle, i) => {
      const z = obstacle.distance - game.distance;
      positionSprite(
        motion.obstacles[i],
        at((obstacle.lane - 1) * PHYSICS.laneWidth, z),
        ART_WIDTH,
        ART_HEIGHT,
        ART_BASE,
        z > -10 ? 1 : 0,
      );
    });
    motion.trees.forEach((sprite, i) => {
      const row = Math.floor(i / 2);
      const z =
        modulo(
          row * WORLD.decorationSpacing - game.distance,
          WORLD.decorationSpacing * WORLD.decorationCount,
        ) - 10;
      const x = (i % 2 ? 1 : -1) * (5.6 + (row % 3) * 1.5);
      positionSprite(sprite, at(x, z), ART_WIDTH, ART_HEIGHT, ART_BASE);
    });
    motion.snow.forEach((sprite, i) => {
      const z =
        modulo(i * WORLD.snowSpacing - game.distance, WORLD.snowCount * WORLD.snowSpacing) - 10;
      positionSprite(sprite, at(0, z), 400, 14, 7, 0.35);
    });
    game.trail.forEach((point, i) => {
      const z = point.distance - game.distance;
      positionSprite(
        motion.trail[i],
        at(point.x, z),
        16,
        3,
        1.5,
        point.active ? clamp(1 + z / 15, 0, 1) * 0.5 : 0,
      );
    });
    const ground = at(game.x, 0);
    const body = { ...ground, y: ground.y - game.height * height * 0.065 + game.landing * 4 };
    positionSprite(motion.rider, body, 76, 110, 96);
    positionSprite(
      motion.shadow,
      { ...ground, scale: 1 - game.height * 0.16 },
      52,
      12,
      6,
      0.28 - game.height * 0.065,
    );
    motion.lean.setValue(clamp(game.lateralVelocity * 3, -21, 21));
    motion.bodyScale.setValue(1 - game.landing * 0.09);
    if (game.over) {
      // Called once by the controller at collision, never restarted by a render.
      Animated.timing(motion.fall, { toValue: 72, duration: 420, useNativeDriver: true }).start();
    } else {
      motion.fall.stopAnimation();
      motion.fall.setValue(0);
    }
  };
  useImperativeHandle(ref, () => ({ draw }), [width, height, motion]);
  useEffect(() => {
    draw(lastGame.current);
  }, [width, height]);
  return (
    <View pointerEvents="none" style={styles.scene}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX: motion.background }] }]}
      >
        <Environment />
      </Animated.View>
      {motion.snow.map((sprite, i) => (
        <WorldSprite key={`snow-${i}`} motion={sprite} width={400} height={14}>
          <Svg width="400" height="14" viewBox="0 0 400 14">
            <Path
              d={
                i % 2
                  ? 'M-10 6Q43 12 100 6T250 9 410 5'
                  : 'M22 9L73 8M112 5L181 8M246 6L296 4M325 9L384 10'
              }
              stroke="#bdcdd7"
              strokeWidth="1.5"
              fill="none"
            />
          </Svg>
        </WorldSprite>
      ))}
      {motion.trail.map((sprite, i) => (
        <WorldSprite key={`trail-${i}`} motion={sprite} width={16} height={3}>
          <View style={styles.trail} />
        </WorldSprite>
      ))}
      {motion.trees.map((sprite, i) => (
        <WorldSprite key={`tree-${i}`} motion={sprite} width={ART_WIDTH} height={ART_HEIGHT}>
          <ObstacleArt kind="tree" />
        </WorldSprite>
      ))}
      {motion.obstacles.map((sprite, i) => (
        <WorldSprite key={`obstacle-${i}`} motion={sprite} width={ART_WIDTH} height={ART_HEIGHT}>
          <ObstacleArt kind={OBSTACLE_KINDS[i % OBSTACLE_KINDS.length]} />
        </WorldSprite>
      ))}
      <WorldSprite motion={motion.shadow} width={52} height={12}>
        <View style={styles.shadow} />
      </WorldSprite>
      <WorldSprite motion={motion.rider} width={76} height={110}>
        <Animated.View style={{ transform: [{ rotate: rotation }, { scaleY: motion.bodyScale }] }}>
          <Rider />
        </Animated.View>
      </WorldSprite>
    </View>
  );
});
const styles = StyleSheet.create({
  scene: { ...StyleSheet.absoluteFill, overflow: 'hidden', backgroundColor: '#cadce4' },
  shadow: { width: 52, height: 12, borderRadius: 30, backgroundColor: '#3c5b70' },
  trail: { height: 2, width: 16, borderRadius: 2, backgroundColor: '#97afc0' },
});
