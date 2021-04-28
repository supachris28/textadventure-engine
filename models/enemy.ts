export class Enemy {
  name: string;
  strength: number;
  defense: number;
  health: number;
  initialHealth: number;
  respawnLikely: number;
  alive: boolean;

  constructor() {
    this.alive = true;
  }

  static fromObject(input: any) : Enemy {
    input.initialHealth = input.health;
      return Object.assign(new Enemy(), input);
  }
}