import { environment } from '../../environments/environment';
import { APIParser } from '../classes/api-parser.abstract';
import { API3Parser } from '../classes/api3-parser.class';
import { StudioModel, StudioModelType } from './type.utils';

export function parserFactory(apiVersion?) {
  return APIParserHelper.parserFactory(apiVersion);
}

export function parseEntity(classType: StudioModelType,
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
