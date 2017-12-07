import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';
import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { ColorsEnum } from './enums/colors.enum';
import { environment } from '../environments/environment';

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

export const openDialog = <T>(dialogModule: MatDialog,
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
export const password = () => `${randomStr().substr(5)}-${randomStr().substr(5)}-${randomStr().substr(5)}`;

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
};

export function createLocalPagination$<T>
({
   source$,
   pager$,
   filter$ = Observable.of(''),
   filterFn = (item, query) => true,
   takeUntilOp = takeUntil(Observable.never()),

   // can't filter directly on the filter$ since it wouldn't
   // clear the search filter when e.g. deleting the whole query
   // from the search input.
   filterIf = (query, items, pagerConf) => query !== ''

 }): Observable<PagedResponse<T>> {
  return source$
    .pipe(
      combineLatest(pager$, filter$,
        (items: T[], pagerConfig: PagerConfig, query: any) => {
          let
            filtered = items,
            queryTotal,
            sliceStart,
            sliceEnd;
          if (filterIf(query, items, pagerConfig)) {
            filtered = items.filter(item => filterFn(item, query));
          }
          queryTotal = filtered.length;
          if (queryTotal < pagerConfig.pageSize) {
            pagerConfig.pageIndex = 0;
          } else if (queryTotal <= (pagerConfig.pageIndex * pagerConfig.pageSize)) {
            pagerConfig.pageIndex = Math.floor(queryTotal / pagerConfig.pageSize);
          }
          sliceStart = pagerConfig.pageIndex * pagerConfig.pageSize;
          sliceEnd = pagerConfig.pageSize + (pagerConfig.pageIndex * pagerConfig.pageSize);
          return {
            total: items.length,
            entries: filtered.slice(sliceStart, sliceEnd),
            queryTotal: queryTotal
          };
        }
      ),
      takeUntilOp
    );
}

export const asAnonymousSubscription = (unsubscribe: () => void): AnonymousSubscription => {
  return { unsubscribe: unsubscribe };
};

export const makeSub = asAnonymousSubscription;

// @see https://github.com/Qix-/color

const LogStyle = {
  DULL: '',
  TEXT_TEAL: `color: ${ColorsEnum.TEAL}`,
  TEXT_GRAY: `color: ${ColorsEnum.GRAY}`,
  TEXT_YELLOW: `color: ${ColorsEnum.YELLOW}`,
  TEXT_ORANGE: `color: ${ColorsEnum.ORANGE}`,
  TEXT_GREEN: `color: ${ColorsEnum.GREEN}`,
  TEXT_PINK: `color: ${ColorsEnum.PINK}`,
  TEXT_RED: `color: ${ColorsEnum.RED}`,
  TEAL: `background: ${ColorsEnum.TEAL}; color: #002F61`,
  GRAY: `background: ${ColorsEnum.GRAY}; color: #FFF`,
  YELLOW: `background: ${ColorsEnum.YELLOW}; color: #663300`,
  ORANGE: `background: ${ColorsEnum.ORANGE}; color: #FFF`,
  GREEN: `background: ${ColorsEnum.GREEN}; color: #007300`,
  PINK: `background: ${ColorsEnum.PINK}; color: #FFF`,
  RED: `background: ${ColorsEnum.RED}; color: #FFF`
};
type LogStyle = (typeof LogStyle)[keyof typeof LogStyle];
const CLEAR_CONSOLE = '$c';
const clearIfRequested = (anything) => {
  if (anything[anything.length - 1] === CLEAR_CONSOLE) {
    console.clear();
    anything.pop();
  }
};
const logReturn = () => {
  return `(${moment().format('[Logged @] HH:MM:SS')})`;
};

function log(...anything: any[]) {
  clearIfRequested(anything);
  console.log.apply(console, anything);
  return logReturn();
}

function pretty(style: LogStyle | any, ...anything) {
  // if ((typeof style !== 'string') || !(style.toUpperCase() in LogStyle)) {
  //   anything.unshift(style);
  // } else {
  //   style = (style.toUpperCase() in LogStyle) ? LogStyle[style.toUpperCase()] : style;
  // }
  style = (style.toUpperCase() in LogStyle) ? LogStyle[style.toUpperCase()] : style;
  let prettyPrintObjects = (anything[anything.length - 1] === '$o');
  // noinspection TsLint
  prettyPrintObjects && anything.pop();
  clearIfRequested(anything);
  anything.forEach(something => {
    let isString = (typeof something === 'string');
    if (isString) {
      console.log(`%c ${something} `, style);
    } else if (prettyPrintObjects) {
      console.log(`%c${JSON.stringify(something, null, '  ')}`, style);
    } else {
      console.log(something);
    }
  });
  return logReturn();
}

log['CLEAR'] = CLEAR_CONSOLE;
pretty['CLEAR'] = CLEAR_CONSOLE;
Object.keys(LogStyle).forEach(style => pretty[style] = LogStyle[style]);

export { LogStyle, log, pretty };

if (!environment.production) {
  if (window.console) {
    window['pretty'] = pretty;
    window['log'] = log;
  }
}

// export const getPanelKey = (topic) => {
//   return ``;
// };


// Avatars from semantic-ui.com
// https://semantic-ui.com/images/avatar2/large/kristy.png
// https://semantic-ui.com/images/avatar/large/elliot.jpg
// https://semantic-ui.com/images/avatar/large/jenny.jpg
// https://semantic-ui.com/images/avatar2/large/matthew.png
// https://semantic-ui.com/images/avatar2/large/molly.png
// https://semantic-ui.com/images/avatar2/large/elyse.png
// https://semantic-ui.com/images/avatar/large/steve.jpg
// https://semantic-ui.com/images/avatar/large/daniel.jpg
// https://semantic-ui.com/images/avatar/large/helen.jpg
// https://semantic-ui.com/images/avatar/large/matt.jpg
// https://semantic-ui.com/images/avatar/large/veronika.jpg
// https://semantic-ui.com/images/avatar/large/stevie.jpg

const avatarsURL = `${environment.assetsUrl}/img/avatars`;

export const AVATARS = [
  `${avatarsURL}/daniel.jpg`,
  `${avatarsURL}/elyse.png`,
  `${avatarsURL}/jenny.jpg`,
  `${avatarsURL}/matt.jpg`,
  `${avatarsURL}/molly.png`,
  `${avatarsURL}/stevie.jpg`,
  `${avatarsURL}/elliot.jpg`,
  `${avatarsURL}/helen.jpg`,
  `${avatarsURL}/kristy.png`,
  `${avatarsURL}/matthew.png`,
  `${avatarsURL}/steve.jpg`,
  `${avatarsURL}/veronika.jpg`
];

export const MALE_AVATARS = [
  `${avatarsURL}/daniel.jpg`,
  `${avatarsURL}/matt.jpg`,
  `${avatarsURL}/stevie.jpg`,
  `${avatarsURL}/elliot.jpg`,
  `${avatarsURL}/matthew.png`,
  `${avatarsURL}/steve.jpg`
];

export const FEMALE_AVATARS = [
  `${avatarsURL}/elyse.png`,
  `${avatarsURL}/jenny.jpg`,
  `${avatarsURL}/molly.png`,
  `${avatarsURL}/helen.jpg`,
  `${avatarsURL}/kristy.png`,
  `${avatarsURL}/veronika.jpg`
];

import { API3Parser } from './classes/api3-parser.class';
import { Asset } from '../app/models/asset.model';
import { User } from '../app/models/user.model';
import { Group } from '../app/models/group.model';
import { Site } from '../app/models/site.model';
import { APIParser } from './classes/api-parser.abstract';
import { PagerConfig } from './classes/pager-config.interface';
import { PagedResponse } from './classes/paged-response.interface';
import { Observable } from 'rxjs/Observable';
import { combineLatest, takeUntil, tap } from 'rxjs/operators';

export type StudioModelType =
  typeof Asset |
  typeof User |
  typeof Site |
  typeof Group;

export type StudioModel =
  Asset |
  User |
  Site |
  Group;

export function parserFactory(apiVersion?) {
  return APIParserHelper.parserFactory(apiVersion);
}

export function parse(classType: StudioModelType,
                      JSONObject: any): StudioModel {
  return APIParserHelper.parse(classType, JSONObject);
}

export class APIParserHelper {
  static parserFactory(apiVersion: StudioAPIVersion = environment.apiVersion): APIParser {
    switch (apiVersion) {
      case 'v3':
        return new API3Parser();
    }
  }

  static parse(classType: StudioModelType,
               JSONObject: any): StudioModel {
    let parser = parserFactory();
    return parser.parseEntity(classType, JSONObject);
  }
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
