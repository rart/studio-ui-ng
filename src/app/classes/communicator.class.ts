import { Observable ,  Subscription ,  Subject ,  OperatorFunction ,  fromEvent } from 'rxjs';
import { filter, map, multicast, tap, refCount } from 'rxjs/operators';
import { WindowMessageTopicEnum } from '../enums/window-message-topic.enum';
import { WindowMessage } from './window-message.class';
import { WindowMessageScopeEnum } from '../enums/window-message-scope.enum';
import { AnySubscriber } from '../../@types/globals/AnyObserver.type';
import { isNullOrUndefined } from 'util';

interface Msg {
  data: any;
  origin: string;
}

export abstract class Communicator {

  protected multiCaster: Subject<WindowMessage>;
  protected messages: Observable<WindowMessage>;

  protected targets: Array<any> = [];
  protected origins: Array<any> = [];

  constructor() {

    let
      multiCaster = new Subject<WindowMessage>(),
      messages = fromEvent<MessageEvent>(window, 'message')
        .pipe(
          tap((event) =>
            !this.originAllowed(event.origin) &&
            console.log('Communicator: Message received from a disallowed origin.', event)
          ),
          filter((event) =>
            this.originAllowed(event.origin) &&
            (typeof event.data === 'object') &&
            ('topic' in event.data) &&
            ('data' in event.data) &&
            ('scope' in event.data)
          ),
          map((event: Msg) => new WindowMessage(
            event.data.topic,
            event.data.data,
            event.data.scope)
          ),
          multicast(multiCaster),
          refCount()
        );

    this.messages = messages;
    this.multiCaster = multiCaster;

  }

  subscribe<T, R>(observer: AnySubscriber, ...operators: OperatorFunction<T, R>[]): Subscription {
    return this.messages
      .pipe.apply(this.messages, operators)
      .subscribe(observer);
  }

  subscribeTo<T, R>(topic: WindowMessageTopicEnum,
                    subscriber: (value: WindowMessage) => void,
                    scope?: WindowMessageScopeEnum,
                    ...operations): Subscription {
    let ops = [];
    // operations = operations || [];
    if (!isNullOrUndefined(scope)) {
      ops.push(
        filter((message: WindowMessage) =>
          message.scope === scope && message.topic === topic));
    } else {
      ops.push(
        filter((message: WindowMessage) => message.topic === topic));
    }
    return this.messages
      .pipe.apply(this.messages, ops.concat(operations))
      .subscribe(subscriber);
  }

  addTarget(target: any): void {
    this.removeTarget(target);
    this.targets.push(target);
  }

  resetTargets(): void {
    this.targets = [];
  }

  removeTarget(target: Window): void {
    this.targets = this.targets.filter(function (item) {
      return item !== target;
    });
  }

  addOrigin(origin: string): void {
    this.removeOrigin(origin);
    this.origins.push(origin);
  }

  resetOrigins(): void {
    this.origins = [];
  }

  removeOrigin(origin: string): void {
    this.origins = this.origins.filter(function (item) {
      return item !== origin;
    });
  }

  publish(message: WindowMessage): void;

  publish(topic: WindowMessageTopicEnum,
          data: any,
          scope: WindowMessageScopeEnum): void;

  publish(topicOrMessage: WindowMessage | WindowMessageTopicEnum,
          data: any = null,
          scope: WindowMessageScopeEnum = WindowMessageScopeEnum.Broadcast): void {
    let message;
    if (topicOrMessage in WindowMessageTopicEnum) {
      message = new WindowMessage(
        <WindowMessageTopicEnum>topicOrMessage,
        data,
        scope);
    } else {
      message = topicOrMessage;
    }
    switch (scope) {
      case WindowMessageScopeEnum.Local:
        this.multiCaster.next(message);
        break;
      case WindowMessageScopeEnum.External:
        this.sendMessage(message);
        break;
      case WindowMessageScopeEnum.Broadcast:
        this.multiCaster.next(message);
        this.sendMessage(message);
        break;
    }
  }

  sendMessage(message: WindowMessage, targetOrigin: string = '*'): void {
    this.targets.forEach((target) => {
      // TODO need to determine where to get the origin
      if (!target.postMessage) {
        target = target.contentWindow;
      }
      if (!target || !target.postMessage) {
        // Garbage collection: get rid of any windows that no longer exist.
        this.removeTarget(target);
      } else {
        (<Window>target).postMessage(message, targetOrigin);
      }
    });
  }

  originAllowed(origin: string): boolean {
    for (let origins = this.origins, i = 0, l = origins.length; i < l; ++i) {
      if (origins[i] === origin) {
        return true;
      }
    }
    return false;
  }

}
