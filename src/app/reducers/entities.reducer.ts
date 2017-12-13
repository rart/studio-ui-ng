import { StateEntities } from '../classes/app-state.interface';
import { combineReducers } from 'redux';
import { project } from './entities.project.reducer';
import { asset } from './entities.asset.reducer';

export const entities = combineReducers<StateEntities>({
  project,
  asset
});

// export function entities(state = {}, action): Reducer<> {
//   switch (action.type) {
//
//     default:
//       return state;
//   }
// }
