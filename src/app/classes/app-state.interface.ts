
import {Asset} from '../models/asset.model';
import { User } from '../models/user.model';

export interface AppState {
  // sidebar
  //  pages { expandedPaths: {} }
  //  components { expandedPaths: {} }
  // expandedPaths: Array<string>; /* Path IDs */
  user: User;
  selectedItems: Array<Asset>;
  expandedPanels: Array<string>;
}
