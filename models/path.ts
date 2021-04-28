export class Path {
  direction: string;
  visibleFeatures: string;
  roomId: string;
  keys: string[];

  static fromObject(input: object): Path {
    return Object.assign(new Path(), input);
  }
}