import { WindowMessageTopicEnum } from '../enums/window-message-topic.enum';
import { WindowMessageScopeEnum } from '../enums/window-message-scope.enum';

export class WindowMessage {
  constructor(public topic: WindowMessageTopicEnum,
              public data: any,
              public scope: WindowMessageScopeEnum = WindowMessageScopeEnum.Broadcast) {
  }
}

// export interface WindowMessage {
//   topic: WindowMessageTopicEnum;
//   data: any;
//   scope: WindowMessageScopeEnum;
// }
//
// export interface ScopedMessage extends WindowMessage {
//   scope: WindowMessageScopeEnum;
// }
