import { Entities } from '../classes/app-state.interface';
import { combineReducers } from 'redux';
import { projects } from './projects.entity.reducer';
import { assets } from './assets.entity.reducer';

export const entities = combineReducers<Entities>({
  projects,
  assets
});

// export function entities(state = {}, action): Reducer<> {
//   switch (action.type) {
//
//     default:
//       return state;
//   }
// }
