import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/core/game';
import { GestureDetector, rightwardTilt } from '../src/core/sensor';
import { PHYSICS, WORLD } from '../src/config/game';
import { ObstacleWorld } from '../src/core/world';
import { integrateJump, integrateTurn } from '../src/core/physics';
import { collides } from '../src/core/collision';
import { project } from '../src/rendering/projection';
import type { Vector } from '../src/types/game';

const neutral = { x: 0, y: 0.8, z: 0.6 };
function calibrated(polarity = 1) {
  const detector = new GestureDetector();
  const sample = { x: 0, y: neutral.y * polarity, z: neutral.z * polarity };
  assert.equal(detector.calibrate(Array.from({ length: 40 }, () => sample)), true);
  return { detector, sample };
}
function advance(game: Game, seconds: number, fps = 60) {
  for (let i = 0; i < seconds * fps; i++) game.tick(1 / fps);
}

test('rightward roll has the same direction for opposite native gravity signs', () => {
  assert.ok(rightwardTilt({ x: -0.35, y: 0.72, z: 0.6 }, neutral) > 0);
  assert.ok(rightwardTilt({ x: 0.35, y: -0.72, z: -0.6 }, { x: 0, y: -0.8, z: -0.6 }) > 0);
});
for (const polarity of [1, -1]) {
  test(`physical left/right gestures preserve direction with polarity ${polarity}`, () => {
    for (const direction of [-1, 1]) {
      const { detector, sample } = calibrated(polarity);
      const events = [];
      for (let t = 0; t < 1600; t += 20) {
        const result = detector.update(
          { ...sample, x: t < 200 ? 0 : -direction * 0.4 * polarity },
          t,
        );
        if (result) events.push(result);
      }
      assert.deepEqual(events, [direction > 0 ? 'right' : 'left']);
    }
  });
}
test('returning to neutral rearms exactly one additional turn', () => {
  const { detector, sample } = calibrated();
  const events = [];
  for (let t = 0; t < 3000; t += 20) {
    const x = t < 200 ? 0 : t < 1400 ? -0.4 : t < 1900 ? 0 : -0.4;
    const event = detector.update({ ...sample, x }, t);
    if (event) events.push(event);
  }
  assert.deepEqual(events, ['right', 'right']);
});
test('brief noise cannot trigger a lane change', () => {
  const { detector, sample } = calibrated();
  for (let t = 0; t < 2000; t += 20)
    assert.equal(detector.update({ ...sample, x: t === 400 ? -0.7 : 0.03 * Math.sin(t) }, t), null);
});
test('calibration rejects motion, insufficient data, NaN and horizontal posture', () => {
  const d = new GestureDetector();
  assert.equal(d.calibrate([neutral]), false);
  assert.equal(
    d.calibrate(Array.from({ length: 40 }, (_, i) => ({ ...neutral, x: i % 2 }))),
    false,
  );
  assert.equal(d.calibrate(Array.from({ length: 40 }, () => ({ x: 0, y: 0.1, z: 1 }))), false);
  assert.equal(d.calibrate(Array.from({ length: 40 }, () => ({ ...neutral, z: NaN }))), false);
});
test('calibration accepts a complete stable upright sample window', () => {
  const d = new GestureDetector();
  assert.equal(d.calibrate(Array.from({ length: 25 }, () => neutral)), true);
});
test('upward impulse and its cooldown work with both sensor polarities', () => {
  for (const sign of [-1, 1]) {
    const { detector, sample } = calibrated(sign);
    detector.update(sample, 0);
    detector.update(sample, 100);
    assert.equal(detector.update({ ...sample, y: sample.y + sign * 0.7 }, 120), 'jump');
    assert.notEqual(detector.update({ ...sample, y: sample.y + sign * 0.8 }, 180), 'jump');
  }
});
test('gravity follows a ballistic arc and clamps the landing to ground', () => {
  const halfTime = PHYSICS.jumpVelocity / PHYSICS.gravity;
  const apex = integrateJump(0, PHYSICS.jumpVelocity, halfTime);
  assert.ok(Math.abs(apex.velocity) < 1e-9);
  assert.ok(Math.abs(apex.height - PHYSICS.jumpVelocity ** 2 / (2 * PHYSICS.gravity)) < 1e-9);
  const landed = integrateJump(apex.height, apex.velocity, halfTime + 0.05);
  assert.equal(landed.height, 0);
  assert.equal(landed.velocity, 0);
  assert.equal(landed.landed, true);
});
test('steering has inertia and converges without overshoot', () => {
  let x = 0,
    velocity = 0;
  for (let i = 0; i < 120; i++) {
    const next = integrateTurn(x, velocity, 2.5, 1 / 120, false);
    assert.ok(next.x >= x && next.x <= 2.5);
    x = next.x;
    velocity = next.velocity;
  }
  assert.ok(x > 2.49);
});
test('game respects lane boundaries and disallows double jump', () => {
  const g = new Game(() => 0);
  g.input('right');
  assert.equal(g.x, 0);
  g.input('right');
  assert.equal(g.lane, 2);
  g.input('jump');
  advance(g, 0.2, 60);
  const velocity = g.verticalVelocity;
  g.input('jump');
  assert.equal(g.verticalVelocity, velocity);
  for (let i = 0; i < 5; i++) g.input('left');
  assert.equal(g.lane, 0);
});
test('simulation is consistent at 30, 60 and 120 FPS', () => {
  const games = [30, 60, 120].map((fps) => {
    const g = new Game(() => 0);
    g.input('right');
    g.input('jump');
    advance(g, 3, fps);
    return g;
  });
  for (const g of games) {
    assert.ok(Math.abs(g.distance - games[0].distance) < 1e-8);
    assert.ok(Math.abs(g.x - games[0].x) < 1e-8);
    assert.equal(g.height, 0);
    assert.ok(g.speed > PHYSICS.initialSpeed);
  }
});
test('logs require height; trees and rocks require lateral avoidance', () => {
  assert.equal(collides('log', 0, 0, 0), true);
  assert.equal(collides('log', 0, 0, 0.8), false);
  assert.equal(collides('tree', 0, 0, 1.4), true);
  assert.equal(collides('rock', 0, 0, 1.4), true);
  assert.equal(collides('tree', 0, 2.5, 0), false);
});
test('high speed cannot tunnel through an obstacle', () => {
  const game = new Game(() => 0.5);
  game.obstacles[0].distance = 1.5;
  game.speed = PHYSICS.maxSpeed;
  game.tick(0.1);
  assert.equal(game.over, true);
});
test('Game Over freezes physical state and score', () => {
  const game = new Game(() => 0.5);
  game.obstacles[0].distance = 0.5;
  game.tick(0.02);
  assert.equal(game.over, true);
  const before = JSON.stringify(game);
  game.tick(0.1);
  game.input('right');
  assert.equal(JSON.stringify(game), before);
});
test('reset restores the runtime state for a fresh run', () => {
  const game = new Game(() => 0.2);
  game.lane = 2;
  game.x = 1.4;
  game.lateralVelocity = 0.8;
  game.height = 0.6;
  game.verticalVelocity = -0.4;
  game.landing = 0.9;
  game.distance = 42;
  game.speed = PHYSICS.maxSpeed;
  game.dodged = 3;
  game.over = true;
  game.obstacles[0].passed = true;

  game.reset();

  assert.equal(game.lane, 1);
  assert.equal(game.x, 0);
  assert.equal(game.lateralVelocity, 0);
  assert.equal(game.height, 0);
  assert.equal(game.verticalVelocity, 0);
  assert.equal(game.landing, 0);
  assert.equal(game.distance, 0);
  assert.equal(game.speed, PHYSICS.initialSpeed);
  assert.equal(game.dodged, 0);
  assert.equal(game.over, false);
  assert.equal(game.obstacles[0].passed, false);
});
test('generation is distance based with reachable gaps and offscreen recycling', () => {
  const world = new ObstacleWorld(() => 0.5);
  for (let distance = 0; distance < 10000; distance += 5) {
    const before = world.obstacles.map((o) => o.distance);
    world.recycle(distance);
    const sorted = [...world.obstacles].sort((a, b) => a.distance - b.distance);
    for (let i = 1; i < sorted.length; i++)
      assert.ok(sorted[i].distance - sorted[i - 1].distance >= WORLD.rowSpacing);
    world.obstacles.forEach((o, i) => {
      if (o.distance !== before[i]) assert.ok(o.distance - distance > WORLD.viewDistance);
    });
    assert.equal(world.obstacles.length, WORLD.obstacleCount);
  }
  assert.ok(WORLD.rowSpacing / PHYSICS.maxSpeed > 2.4);
});
test('obstacles balance across all three lanes and tighten with distance', () => {
  const world = new ObstacleWorld(() => 0.5);
  const initial = world.obstacles.map((obstacle) => obstacle.distance);
  const initialGap = initial[1] - initial[0];
  const initialCounts = [0, 0, 0];
  world.obstacles.forEach((obstacle) => initialCounts[obstacle.lane]++);

  world.recycle(WORLD.difficultyDistance + WORLD.viewDistance);
  const later = [...world.obstacles].sort((a, b) => a.distance - b.distance);
  const laterGap = later[1].distance - later[0].distance;

  assert.ok(initialGap > laterGap);
  assert.ok(Math.max(...initialCounts) - Math.min(...initialCounts) <= 1);
});
test('perspective moves and grows obstacles toward the rider, invisible beyond fog', () => {
  const far = project(2.5, 150, 390, 844),
    near = project(2.5, 10, 390, 844);
  assert.ok(near.y > far.y && near.scale > far.scale && near.x > far.x);
  assert.equal(project(0, WORLD.viewDistance, 390, 844).opacity, 0);
  assert.equal(project(0, WORLD.fogStart, 390, 844).opacity, 1);
});
test('speed is bounded and obstacle pool remains fixed on long runs', () => {
  const game = new Game(() => 0);
  advance(game, 120, 60);
  assert.ok(game.speed <= PHYSICS.maxSpeed);
  assert.equal(game.obstacles.length, WORLD.obstacleCount);
});
