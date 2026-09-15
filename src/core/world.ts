import { WORLD } from '../config/game';
import { OBSTACLE_KINDS, type Lane, type Obstacle } from '../types/game';

export class ObstacleWorld {
  readonly obstacles: Obstacle[] = [];
  private nextDistance: number = WORLD.firstRow;

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
    this.nextDistance += WORLD.rowSpacing + this.random() * WORLD.rowVariation;
    return { distance, lane: Math.min(2, Math.floor(this.random() * 3)) as Lane, passed: false };
  }

  recycle(playerDistance: number) {
    for (const obstacle of this.obstacles) {
      if (obstacle.distance < playerDistance - WORLD.recycleBehind) {
        Object.assign(obstacle, this.nextRow());
      }
    }
  }
}
