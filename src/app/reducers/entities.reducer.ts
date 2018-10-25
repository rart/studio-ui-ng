import { Entities } from '../classes/app-state.interface';
import { combineReducers } from 'redux';
import { projects } from './projects.entity.reducer';
import { assets } from './assets.entity.reducer';
import { users } from './users.reducer';
import { groups } from './groups.reducer';

export const entities = combineReducers<Entities>({
  projects,
  assets,
  users,
  groups
});

// export function entities(state = {}, action): Reducer<> {
//   switch (action.type) {
//
//     default:
//       return state;
//   }
// }
