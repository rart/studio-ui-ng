
import {ContentItem} from '../models/content-item.model';

export interface AppState {
  // sidebar
  //  pages { expandedPaths: {} }
  //  components { expandedPaths: {} }
  // expandedPaths: Array<string>; /* Path IDs */
  selectedItems: Array<ContentItem>;
  expandedPanels: Array<string>;
}
