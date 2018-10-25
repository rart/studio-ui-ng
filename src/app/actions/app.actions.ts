import { AppAction } from '../models/app-action';
import { Actions } from '../enums/actions.enum';

export function clearActionResult(key: string): AppAction {
  return {
    type: Actions.CLEAR_ACTION_RESULT,
    payload: { key }
  };
}
