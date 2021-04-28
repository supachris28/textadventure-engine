import { textChangeRangeIsUnchanged } from "typescript";

export class Adventurer {
  name: string;
  private _inventory: string[];
  get inventory(): string[] {
    return this._inventory;
  }
  strength: number;
  defence: number;
  health: number;
  magic: number;
  get alive(): boolean {
    return this.health >= 0;
  }

  constructor() {
    this._inventory = new Array();
    this.strength = 20;
    this.defence = 0;
    this.health = 100;
    this.magic = 1;
  }

  addToInventory(item: string) {
    this._inventory.push(item);
  }

  checkInInventory(item: string) {
    return this._inventory.findIndex(i => i.toLowerCase() == item.toLowerCase()) != -1;
  }

  removeFromInventory(item: string): string[] {
    return this._inventory.splice(this._inventory.findIndex(i => i == item), 1);
  }

  displayInventory(lineOut: Function) {
    if (this._inventory == null || this._inventory.length == 0) {
      lineOut("You have no possessions");
      return;
    }

    lineOut("Current possessions:");
    this._inventory.forEach(i => lineOut(" - ", i));
  }

  displayCharacter(lineOut: Function) {
    lineOut("Name:", this.name);
    lineOut("Strength:", this.strength);
    lineOut("Defence:", this.defence);
    lineOut("Health:", this.health);
    lineOut("Magic:", this.magic);
    lineOut("");

    this.displayInventory(lineOut);
  }

  hit(hit: number): void {
    this.defence -= hit;
    if (this.defence < 0) {
      this.health += this.defence;
      this.defence = 0;
    }
  }
}