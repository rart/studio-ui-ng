import { Injectable, OnInit } from '@angular/core';
import { Communicator } from '../classes/communicator.class';
import { debounceTime, share } from 'rxjs/operators';
import { OperatorFunction ,  fromEvent } from 'rxjs';
import { AnyObserver } from '../../@types/globals/AnyObserver.type';

@Injectable()
export class CommunicationService extends Communicator implements OnInit {

  private $resize = fromEvent(window, 'resize')
    .pipe(
      debounceTime(300),
      share()
    );

  constructor() {
    super();
  }

  ngOnInit(): void {

  }

  resize<T, R>(subscriber: AnyObserver<T>, ...operators: OperatorFunction<T, R>[]) {
    return this.$resize
      .pipe.apply(this.$resize, operators)
      .subscribe(subscriber);
  }

}
