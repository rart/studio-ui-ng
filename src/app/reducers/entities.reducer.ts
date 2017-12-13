import { StateEntities } from '../classes/app-state.interface';
import { combineReducers } from 'redux';
import { site } from './entities.site.reducer';
import { asset } from './entities.asset.reducer';

export const entities = combineReducers<StateEntities>({
  site,
  asset
});

// export function entities(state = {}, action): Reducer<> {
//   switch (action.type) {
//
//     default:
//       return state;
//   }
// }
