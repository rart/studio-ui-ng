
import {Subject} from 'rxjs/Subject';
import {Injectable} from '@angular/core';
import {Communicator, Message, MessageTopic, MessageScope} from '../classes/communicator';

@Injectable()
export class CommunicationService extends Communicator {

  private messages: Subject<Message>;

  constructor() {
    super();
    this.messages = new Subject<Message>();
  }

  protected processReceivedMessage(message) {
    this.messages.next(message);
  }

  subscribe(generatorOrNext) {
    return this.messages.subscribe(generatorOrNext);
  }

  unsubscribe() {
    this.messages.unsubscribe();
  }

  publish(topic: MessageTopic, data: any = null, scope: MessageScope = MessageScope.Broadcast) {
    let message = new Message(topic, data, scope);
    switch (message.scope) {
      case MessageScope.Local:
        this.messages.next(message);
        break;
      case MessageScope.External:
        super.publish(topic, data, scope);
        break;
      case MessageScope.Broadcast:
        this.messages.next(message);
        super.publish(topic, data, scope);
        break;
    }
  }

}
