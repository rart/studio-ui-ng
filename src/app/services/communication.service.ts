import {Injectable} from '@angular/core';
import {MessageCommunicator} from '../classes/MessageCommunicator';

@Injectable()
export class CommunicationService extends MessageCommunicator {

  constructor() {
    super();
  }

}
