
export enum StoreActionsEnum {

  REDUX_INIT = '@@redux/INIT',
  STATE_INIT = '@@store/INIT',

  // selectedItems
  SELECT_ITEM = 'SELECT_ITEM',
  DESELECT_ITEM = 'DESELECT_ITEM',
  DESELECT_ITEMS = 'DESELECT_ITEMS',
  SELECT_ITEMS = 'SELECT_ITEMS',

  // expandedPanels
  EXPAND_PANEL = 'EXPAND_PANEL',
  COLLAPSE_PANEL = 'COLLAPSE_PANEL',
  EXPAND_PANELS = 'EXPAND_PANELS',
  COLLAPSE_PANELS = 'COLLAPSE_PANELS',

  // expandedPaths
  EXPAND_PATH = 'EXPAND_PATH',
  COLLAPSE_PATH = 'COLLAPSE_PATH',
  EXPAND_PATHS = 'EXPAND_PATH',
  COLLAPSE_PATHS = 'COLLAPSE_PATH',

  // previewTabs
  OPEN_TAB = 'OPEN_TAB',
  CLOSE_TAB = 'CLOSE_TAB',
  SELECT_TAB = 'SELECT_TAB',
  OPEN_TAB_BACKGROUND = 'OPEN_TAB_BACKGROUND'

}