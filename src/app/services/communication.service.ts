import { Injectable, OnInit } from '@angular/core';
import { Communicator } from '../classes/communicator.class';
import { Observable } from 'rxjs/Observable';
import { debounceTime, share } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs/interfaces';
import { AnyObserver } from '../../@types/globals/AnyObserver.type';

@Injectable()
export class CommunicationService extends Communicator implements OnInit {

  private $resize = Observable.fromEvent(window, 'resize')
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
      .pipe(...operators)
      .subscribe(subscriber);
  }

}
