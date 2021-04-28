import { Enemy } from "./enemy";
import { Item } from "./item";
import { Path } from "./path";

export class Room {
  enemies: Enemy[];
  name: string;
  description: string;
  id: string;
  paths: Path[];
  items: Item[];

  static fromObject(input: object): Room {
    const room = Object.assign(new Room(), input);

    if (room.paths != null) {
      let paths: Path[] = new Array();

      room.paths.forEach(p => paths.push(Path.fromObject(p)));

      room.paths = paths;
    }

    if (room.enemies != null) {
      let enemies: Enemy[] = new Array();

      room.enemies.forEach(p => enemies.push(Enemy.fromObject(p)));

      room.enemies = enemies;
    }

    return room;
  }

  describe(lineOut: Function): void {
    lineOut("");
    lineOut(`The ${this.name}`);
    lineOut("=".repeat(this.name.length + 4));
    lineOut("");
    lineOut(this.description);
    lineOut("");

    if (this.items != null && this.items.length > 0) {
      lineOut(`In this room are the following items:`);
      this.items.forEach(i => lineOut(`- ${i.name}`));
      lineOut("");
    }

    if (this.enemies != null && this.enemies.filter(e => e.alive).length > 0) {
      lineOut(`Watch out, there are:`);
      this.enemies.filter(e => e.alive).forEach(i => lineOut(`- ${i.name} [Strength ${i.strength}]`));
      lineOut("");
    }

    lineOut(`You have the choice of the following paths:`);
    if (this.paths != null && this.paths.length > 0) {
      this.paths.forEach(i => lineOut(`${i.direction} - ${i.visibleFeatures}`));
    }
  }

  enterRoom(): void {
    if (this.enemies) {
      this.enemies.forEach(e => {
        if (!e.alive && Math.random() > e.respawnLikely) {
          e.alive = true;
          e.health = e.initialHealth
        }
      })
    }
  }
}