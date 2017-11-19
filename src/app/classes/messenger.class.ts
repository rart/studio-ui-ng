
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {Communicator, Message, MessageTopic, MessageScope} from './communicator.class';

const SCOPED_SUBJECTS = 'SCOPED_SUBJECTS';

export class Messenger extends Communicator {

  private messages: Subject<Message>;
  private subjects: { /* topic(MessageTopic): Subject<Message> */ };

  constructor() {
    super();
    this.messages = new Subject<Message>();
  }

  protected processReceivedMessage(message: Message) {
    if (this.subjects) {
      if (this.subjects[message.scope] && this.subjects[message.scope][message.topic]) {
        this.subjects[message.scope][message.topic].next(message);
      }
      if (this.subjects[message.topic]) {
        this.subjects[message.topic].next(message);
      }
    }
    this.messages.next(message);
  }

  subscribeTo(topic: MessageTopic, subscriber: (value) => void, scope?: MessageScope): Subscription {
    if (!this.subjects) {
      this.subjects = { };
    }

    let
      subject,
      subjects = this.subjects;

    if (scope) {
      if (!subjects[SCOPED_SUBJECTS]) {
        subjects[SCOPED_SUBJECTS] = {};
      }
      subjects = subjects[SCOPED_SUBJECTS];
    }

    if (!subjects[topic]) {
      subjects[topic] = new Subject<Message>();
    }

    subject = <Subject<Message>>subjects[topic];
    return subject.subscribe(subscriber);
  }

  subscribe(subscriber: (value) => void): Subscription {
    return this.messages.subscribe(subscriber);
  }

  unsubscribe(): void {
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
