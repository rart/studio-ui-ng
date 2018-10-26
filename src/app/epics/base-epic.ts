export abstract class BaseEpic {

  protected abstract manifest: string[];

  epics() {
    return this.manifest.map(epic => this[epic]);
  }

}
