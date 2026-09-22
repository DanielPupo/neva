import { WORLD } from '../config/game';
import { OBSTACLE_KINDS, type Lane, type Obstacle } from '../types/game';

export class ObstacleWorld {
  readonly obstacles: Obstacle[] = [];
  private nextDistance: number = WORLD.firstRow;
  private readonly laneCounts: Record<Lane, number> = { 0: 0, 1: 0, 2: 0 };

  constructor(private readonly random: () => number = Math.random) {
    // Stable kinds let the renderer reuse one artwork per slot throughout a run.
    for (let id = 0; id < WORLD.obstacleCount; id++) {
      this.obstacles.push({
        id,
        kind: OBSTACLE_KINDS[id % OBSTACLE_KINDS.length],
        ...this.nextRow(),
      });
    }
  }

  private nextRow() {
    const distance = this.nextDistance;
    const progress = Math.min(1, Math.max(0, distance / WORLD.difficultyDistance));
    const spacingRange = WORLD.rowSpacing + WORLD.rowVariation * (1 - progress);
    const spacing = Math.max(
      WORLD.minimumRowSpacing,
      WORLD.rowSpacing + this.random() * (spacingRange - WORLD.rowSpacing),
    );
    this.nextDistance += spacing;

    const leastUsed = Math.min(...Object.values(this.laneCounts));
    const available = ([0, 1, 2] as Lane[]).filter((lane) => this.laneCounts[lane] === leastUsed);
    const lane = available[Math.floor(this.random() * available.length)];
    this.laneCounts[lane]++;
    return { distance, lane, passed: false };
  }

  recycle(playerDistance: number) {
    for (const obstacle of this.obstacles) {
      if (obstacle.distance < playerDistance - WORLD.recycleBehind) {
        Object.assign(obstacle, this.nextRow());
      }
    }
  }
}
