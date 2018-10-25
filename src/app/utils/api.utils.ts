import { environment } from '../../environments/environment';
import { APIParser } from '../classes/api-parser.abstract';
import { API1Parser } from '../classes/api1-parser.class';
import { StudioModel, StudioModels } from './type.utils';

export function parserFactory(apiVersion?) {
  return APIParserHelper.parserFactory(apiVersion);
}

export function parseEntity(classType: StudioModels,
                            JSONObject: any): StudioModel {
  return APIParserHelper.parse(classType, JSONObject);
}

export class APIParserHelper {

  private static instance = null;

  static parserFactory(apiVersion: StudioAPIVersion = environment.apiVersion): APIParser {
    switch (apiVersion) {
      case 'v3':
        return new API1Parser();
    }
  }

  static parse(classType: StudioModels,
               JSONObject: any): StudioModel {
    let parser = this.instance || (this.instance = parserFactory());
    return parser.parseEntity(classType, JSONObject);
  }
}
