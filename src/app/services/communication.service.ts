import {Injectable} from '@angular/core';
import {Messenger} from '../classes/messenger.class';

@Injectable()
export class CommunicationService extends Messenger {

  constructor() {
    super();
  }

}
