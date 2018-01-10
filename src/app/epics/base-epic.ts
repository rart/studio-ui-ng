export abstract class BaseEpic {

  protected abstract manifest: string[];

  constructor() {

  }

  epics() {
    return this.manifest.map(epic => {
      return ((name) =>
          (action$, store, dependencies) => this[name](action$, store, dependencies)
      )(epic);
    });
  }

}
