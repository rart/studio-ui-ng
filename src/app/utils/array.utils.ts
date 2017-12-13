
export class ArrayUtils {
  /**
   * Breaks the for if the callback returns true for any item. Returns true if broken
   * or false if it went through all items without break
   * @param collection: Array<any> The array
   * @param callback: (value, index, array) => boolean The callback fn
   **/
  static forEachBreak(collection, callback: (value, index, array) => boolean) {
    for (let i = 0, l = collection.length; i < l; ++i) {
      let item = collection[i];
      if (callback(item, i, collection)) {
        return true;
      }
    }
    return false;
  }
}
