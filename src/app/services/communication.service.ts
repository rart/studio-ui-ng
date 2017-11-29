import {Injectable} from '@angular/core';
import { Communicator } from '../classes/communicator.class';

@Injectable()
export class CommunicationService extends Communicator {

  constructor() {
    super();
  }

}
