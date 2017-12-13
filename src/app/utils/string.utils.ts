
const randomStr = (): string => Math.random().toString(36).slice(2);

export class StringUtils {

  static password() {
    return `${randomStr().substr(5)}-${randomStr().substr(5)}-${randomStr().substr(5)}`;
  }

  static contains(str, search) {
    return str.indexOf(search) !== -1;
  }

  static remove(str, remove) {
    return str.replace(remove, '');
  }

  static capitalize(str, firstCapitalOnly = false) {
    return (
      str.charAt(0).toUpperCase() +
      (firstCapitalOnly
        ? str.substring(1).toLowerCase()
        : str.substring(1))
    );
  }

  static capitalizeWords(str) {
    let words = str.split(/\s+/);
    return words.map((word) => StringUtils.capitalize(word)).join(' ');
  }

  static underscore(str) {
    return str.replace(/::/g, '/')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .replace(/-/g, '_')
      .toLowerCase();
  }

  static dasherize(str) {
    return str.replace(/_/g, '-');
  }

  static camelize(str) {
    return str.replace(/-+(.)?/g, function (match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }

  static startsWith(url: string, search: string) {
    let length = search.length;
    let newStr = url.substr(0, length);
    return search === newStr;
  }

}
