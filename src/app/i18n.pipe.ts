import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'i18n'
})
export class I18nPipe implements PipeTransform {

  constructor(/*private i18n: I18nService*/) {}

  transform(value: any, args?: any): any {
    return value;
  }

}
