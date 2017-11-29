// import { Subject } from 'rxjs/Subject';
// import { Subscription } from 'rxjs/Subscription';
// import { Communicator } from './communicator.class';
// import { WindowMessageTopicEnum } from '../enums/window-message-topic.enum';
// import { WindowMessageScopeEnum } from '../enums/window-message-scope.enum';
// import { WindowMessage } from './window-message.class';
//
// const SCOPED_SUBJECTS = 'SCOPED_SUBJECTS';
//
// export class Messenger extends Communicator {
//
//   private messages: Subject<WindowMessage>;
//   private subjects: { /* topic(WindowMessageTopicEnum): Subject<WindowMessage> */ };
//
//   constructor() {
//     super();
//     this.messages = new Subject<WindowMessage>();
//   }
//
//   protected processReceivedMessage(message: WindowMessage) {
//     if (this.subjects) {
//       if (this.subjects[message.scope] && this.subjects[message.scope][message.topic]) {
//         this.subjects[message.scope][message.topic].next(message);
//       }
//       if (this.subjects[message.topic]) {
//         this.subjects[message.topic].next(message);
//       }
//     }
//     this.messages.next(message);
//   }
//
//   subscribeTo(topic: WindowMessageTopicEnum, subscriber: (value) => void, scope?: WindowMessageScopeEnum): Subscription {
//     if (!this.subjects) {
//       this.subjects = {};
//     }
//
//     let
//       subject,
//       subjects = this.subjects;
//
//     if (scope) {
//       if (!subjects[SCOPED_SUBJECTS]) {
//         subjects[SCOPED_SUBJECTS] = {};
//       }
//       subjects = subjects[SCOPED_SUBJECTS];
//     }
//
//     if (!subjects[topic]) {
//       subjects[topic] = new Subject<WindowMessage>();
//     }
//
//     subject = <Subject<WindowMessage>>subjects[topic];
//     return subject.subscribe(subscriber);
//   }
//
//   subscribe(subscriber: (value) => void): Subscription {
//     return this.messages.subscribe(subscriber);
//   }
//
//   unsubscribe(): void {
//     this.messages.unsubscribe();
//   }
//
//   publish(topic: WindowMessageTopicEnum, data: any = null, scope: WindowMessageScopeEnum = WindowMessageScopeEnum.Broadcast) {
//     let message = new WindowMessage(topic, data, scope);
//     switch (message.scope) {
//       case WindowMessageScopeEnum.Local:
//         this.messages.next(message);
//         break;
//       case WindowMessageScopeEnum.External:
//         super.publish(topic, data, scope);
//         break;
//       case WindowMessageScopeEnum.Broadcast:
//         this.messages.next(message);
//         super.publish(topic, data, scope);
//         break;
//     }
//   }
//
// }
