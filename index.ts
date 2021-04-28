import { Dungeon } from "./models/dungeon";
import * as fs from 'fs';
import { Adventurer } from "./models/adventurer";

const prompt = require('prompt-sync')({sigint: true});

//let tmp = fs.readFileSync("./sample-dungeon.json", "utf8");
//let dungeon: Dungeon = Dungeon.buildDungeonFromJson(tmp);

let tmp = fs.readFileSync("./sample-dungeon.yml", "utf8");
let dungeon: Dungeon = Dungeon.buildDungeonFromYaml(tmp);

console.clear();

let adventurer = new Adventurer();
adventurer.name = "Test1";

dungeon.playDungeon(adventurer, console.log.bind(console));

while (dungeon.playing) {
  const input = prompt(">");
  console.clear();
  dungeon.continue(input);
}
