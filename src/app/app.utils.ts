
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar} from '@angular/material';
import {ComponentType} from '@angular/cdk/portal';
import {TemplateRef} from '@angular/core';

// MatSnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
// MatSnackBarVerticalPosition = 'top' | 'bottom';
export const showSnackBar = (snackBarModule: MatSnackBar, message: string, action?, options?) => {
  let opts = Object.assign({
    horizontalPosition: 'center',
    verticalPosition: 'top',
    duration: 6000
  }, options || {});
  return snackBarModule.open(message, action, opts);
};

export const openDialog = <T>(
  dialogModule: MatDialog,
  compOrTemplate: ComponentType<T> | TemplateRef<T>,
  config?: MatDialogConfig): MatDialogRef<T> => {
  return dialogModule.open(compOrTemplate, config);
};

export const toURLSearchParams = (paramMap = {}) => {
  let parameters = new URLSearchParams();
  Object.keys(paramMap).forEach((key) => parameters.set(key, paramMap[key]));
  return parameters;
};

const randomStr = (): string => Math.random().toString(36).slice(2);
export const password = () =>  `${randomStr().substr(5)}-${randomStr().substr(5)}-${randomStr().substr(5)}`;

// taken from TodoMVC
export const uuid = () => {
  let i, random;
  let result = '';

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      result += '-';
    }
    result += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
      .toString(16);
  }

  return result;
}

export class StringUtils {
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
    return str.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }
  static startsWith(url: string, search: string) {
    let length = search.length;
    let newStr = url.substr(0, length);
    return search === newStr;
  }
}

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
  static contains<T>(collection: Array<T>, search: T) {
    return (collection.indexOf(search) !== -1);
  }
}
