export abstract class Model<T> {
  abstract serialize(): Object;
  abstract deserialize(json: Object): T;
}
