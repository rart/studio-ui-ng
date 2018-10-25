import { Actions } from '../enums/actions.enum';

export interface AppAction<T = any> {
  type: Actions;
  payload?: T;
}
