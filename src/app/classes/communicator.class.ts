import { Subscription } from 'rxjs/Subscription';
import { WindowMessageTopicEnum } from '../enums/window-message-topic.enum';
import { WindowMessageScopeEnum } from '../enums/window-message-scope.enum';
import { WindowMessage } from './window-message.class';

export abstract class Communicator {

  protected targets: Array<any> = [];
  protected origins: Array<any> = [];

  constructor () {
    window.addEventListener('message', this.onMessage.bind(this), false);
  }

  /**
   * Process the message once the origin/source has been verified.
   * @param message: WindowMessage
   * @private
   */
  protected abstract processReceivedMessage(message: WindowMessage): void;

  abstract subscribe(subscriber: (value) => void): Subscription;

  abstract subscribeTo(topic: WindowMessageTopicEnum, subscriber: (value) => void, scope?: WindowMessageScopeEnum): Subscription;

  private onMessage(event: { data: any, origin: string }): void {

    let {data, origin} = event;
    if (this.originAllowed(origin)) {
      this.processReceivedMessage(data);
    } else {
      console.log('Communicator: Message received from a disallowed origin.');
    }

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

  publish(topic: WindowMessageTopicEnum, data: any = null, scope = WindowMessageScopeEnum.Broadcast): void {
    let message = new WindowMessage(topic, data, scope);
    this.targets.forEach((target) => {
      // TODO need to determine where to get the origin
      if (!target.postMessage) {
        target = target.contentWindow;
      }
      if (!target || !target.postMessage) {
        // Garbage collection: get rid of any windows that no longer exist.
        this.removeTarget(target);
      } else {
        target.postMessage(message, '*');
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
