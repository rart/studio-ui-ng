import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterWith'
})
export class FilterWithPipe implements PipeTransform {

  transform(values: any,
            input: any,
            fiteringFn: (value) => boolean = (value) => value === input): any {
    return input
      ? values.filter(value => fiteringFn(value))
      : values;
  }

}
