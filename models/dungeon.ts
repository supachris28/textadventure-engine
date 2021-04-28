import { Room } from "./room";
import { Adventurer } from "./adventurer";
import * as Yaml from 'js-yaml';
import { Enemy } from "./enemy";

export class Dungeon {
  rooms: Room[];
  startRoomId: string;
  adventurer: Adventurer;
  private _currentRoom: Room;
  get currentRoom(): Room {
    return this._currentRoom;
  }
  set currentRoom(room: Room) {
    this._currentRoom = room;
    this._currentRoom.enterRoom();
  }

  lineOut: Function;
  playing: boolean;
  private commands: string[];

  static buildDungeonFromJson(json: string): Dungeon {
    let tmp = JSON.parse(json);
    let dungeon: Dungeon = Object.assign(Dungeon.prototype, tmp);

    dungeon = this.processNewDungeon(dungeon);

    return dungeon;
  }

  static buildDungeonFromYaml(yaml: string): Dungeon {
    let tmp = Yaml.load(yaml);
    let dungeon: Dungeon = Object.assign(Dungeon.prototype, tmp);

    dungeon = this.processNewDungeon(dungeon);

    return dungeon;
  }

  private static processNewDungeon(dungeon: Dungeon): Dungeon {
    let rooms: Room[] = new Array();

    dungeon.rooms.forEach(r => {
      const newRoom: Room = Room.fromObject(r);
      rooms.push(newRoom);
    });

    dungeon.rooms = rooms;

    dungeon.commands = new Array("help", "char", "me", "character", "inv", "inventory", "fight", "slay", "attack", "hit", "shoot", "kill", "take", "get", "hold", "obtain", "grab");

    return dungeon;
  }

  private getRoom(id: string): Room {
    return this.rooms.find(r => r.id == id);
  }

  playDungeon(adventurer: Adventurer, lineOut: Function) {
    this.lineOut = lineOut;
    this.adventurer = adventurer;
    this.playing = true;

    this.currentRoom = this.getRoom(this.startRoomId);

    this.currentRoom.describe(this.lineOut);
  }

  continue(input: string) {
    // this.lineOut("");
    // this.lineOut("-".repeat(30));

    let handled = false;

    handled = this.tryProcessHelp(handled, input);

    // is the command taking an object
    handled = this.tryTakeItem(handled, input);

    // is the command fighting
    handled = this.trySlayEnemy(handled, input);

    this.handleEnemyAttack();

    if (!this.adventurer.alive) {
      this.lineOut("You are DEAD!!!");
      this.playing = false;
      return;
    }

    // is the command a path
    handled = this.tryProcessFollowAPath(handled, input);

    // is the command about the character
    handled = this.tryProcessInventory(handled, input);
    handled = this.tryProcessCharacter(handled, input);

    this.currentRoom.describe(this.lineOut);
  }

  private tryProcessFollowAPath(handled: boolean, input: string) {
    if (!handled && this.currentRoom.paths) {
      const noGoInput = input.toLowerCase().replace("go ", "");
      const chosenPath = this.currentRoom.paths.find(p => p.direction.toLowerCase() == input.toLowerCase() || p.direction.toLowerCase() == noGoInput);
      if (chosenPath) {
        handled = true;
        if (chosenPath.keys && chosenPath.keys.length > 0) {
          let missingKeys = false;
          chosenPath.keys.forEach(key => {
            if (!this.adventurer.checkInInventory(key)) {
              missingKeys = true;
            }
          });

          if (missingKeys) {
            this.lineOut("You don't have all the keys needed for this path:");
            this.lineOut(chosenPath.keys.join(", "));
            return handled;
          } else {
            this.lineOut("You used the follwing keys:");
            this.lineOut(chosenPath.keys.join(", "));
            chosenPath.keys.forEach(key => {
              this.adventurer.removeFromInventory(key);
            });
          }
        }

        this.currentRoom = this.getRoom(chosenPath.roomId);
      }
    }
    return handled;
  }

  private tryProcessHelp(handled: boolean, input: string) {
    if (!handled &&
      input.toLowerCase() == "help") {
      handled = true;
      const commands: string[] = new Array();
      this.commands.forEach(c => {
        if (Math.random() > 0.6) {
          commands.push(c);
        }
      })

      this.lineOut("Some commands available are:");
      this.lineOut(commands.join(", "));
    }

    return handled;
  }

  private tryProcessInventory(handled: boolean, input: string) {
    if (!handled &&
      (input.toLowerCase() == "inv"
        || input.toLowerCase() == "inventory")) {
      this.adventurer.displayInventory(this.lineOut)
      handled = true;
    }
    return handled;
  }

  private tryProcessCharacter(handled: boolean, input: string) {
    if (!handled &&
      (input.toLowerCase() == "char"
        || input.toLowerCase() == "me"
        || input.toLowerCase() == "character")) {
      this.adventurer.displayCharacter(this.lineOut)
      handled = true;
    }
    return handled;
  }

  private tryTakeItem(handled: boolean, input: string) {
    if (!handled &&
      (input.toLowerCase().startsWith("take ")
        || input.toLowerCase().startsWith("get ")
        || input.toLowerCase().startsWith("hold ")
        || input.toLowerCase().startsWith("obtain ")
        || input.toLowerCase().startsWith("grab "))) {
      handled = true;
      const match = /[a-z]+ (.*)/.exec(input);
      if (match.length > 1) {
        const item = match[1];
        if (item != null) {
          const matchedItem = this.currentRoom.items.find(i => i.name.toLowerCase() == item.toLowerCase() || i.name.toLowerCase().endsWith(item));
          if (matchedItem == null) {
            this.lineOut("Could not find item", item);
          } else {
            this.lineOut("You collect the", matchedItem.name);
            this.adventurer.addToInventory(matchedItem.name)
            if (matchedItem.healthModifier && matchedItem.healthModifier != 0) {
              this.adventurer.health += matchedItem.healthModifier;
              this.lineOut("Your health has changed by", matchedItem.healthModifier);
            }

            if (matchedItem.magicModifier && matchedItem.magicModifier != 0) {
              this.adventurer.magic += matchedItem.magicModifier;
              this.lineOut("Your magic has changed by", matchedItem.magicModifier);
            }

            if (matchedItem.strengthModifier && matchedItem.strengthModifier != 0) {
              this.adventurer.strength += matchedItem.strengthModifier;
              this.lineOut("Your strength has changed by", matchedItem.strengthModifier);
            }

            if (matchedItem.defenceModifier && matchedItem.defenceModifier != 0) {
              this.adventurer.defence += matchedItem.defenceModifier;
              this.lineOut("Your defence has changed by", matchedItem.defenceModifier);
            }
            this.currentRoom.items.splice(this.currentRoom.items.findIndex(i => i.name.toLowerCase() == matchedItem.name.toLowerCase()), 1);
          }
        }
      }
    }
    return handled;
  }

  private trySlayEnemy(handled: boolean, input: string) {
    if (!handled &&
      (input.toLowerCase().startsWith("slay ")
        || input.toLowerCase().startsWith("kill ")
        || input.toLowerCase().startsWith("fight ")
        || input.toLowerCase().startsWith("attack ")
        || input.toLowerCase().startsWith("hit ")
        || input.toLowerCase().startsWith("shoot ")
        || input.toLowerCase() == "slay"
        || input.toLowerCase() == "kill"
        || input.toLowerCase() == "fight"
        || input.toLowerCase() == "attack"
        || input.toLowerCase() == "hit"
        || input.toLowerCase() == "shoot")) {
      handled = true;
      const match = /[a-z]+ (.*)/.exec(input);
      let matchedItem: Enemy;
      let item: string;
      if (match && match.length > 1) {
        item = match[1];
        if (item != null) {
          matchedItem = this.currentRoom.enemies.find(i => i.name.toLowerCase() == item.toLowerCase() || i.name.toLowerCase().endsWith(item));
        }
      }

      if (this.currentRoom.enemies && this.currentRoom.enemies.length > 0) {
        matchedItem = this.currentRoom.enemies[0];
      }

      if (matchedItem == null && item) {
        this.lineOut("The", item, "can't be seen here");
      } else if (matchedItem == null ) {
        this.lineOut("Nothing to", input);
      } else if (!matchedItem.alive) {
        this.lineOut("You already slew the", matchedItem.name);
      } else {
        const hit = Math.floor(this.adventurer.strength * Math.random());
        matchedItem.health -= hit;
        this.lineOut("You hit the", matchedItem.name, "with", hit, "points");
        if (matchedItem.health <= 0) {
          matchedItem.alive = false;
          matchedItem.health = 0;
          this.lineOut("You slew the", matchedItem.name, "!");
        } else {
          this.lineOut("The", matchedItem.name, "has", matchedItem.health, "health left.");
        }
      }
    }
    return handled;
  }

  private handleEnemyAttack() {
    if (this.currentRoom.enemies) {
      this.currentRoom.enemies
        .filter(e => e.alive)
        .forEach(e => {
          const hit = Math.floor(Math.random() * e.strength);
          this.adventurer.hit(hit);
          this.lineOut("You were hit", hit, "damage by", e.name);
        });
    }
  }
}