import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { PreviewTab, PreviewTabProps } from '../classes/preview-tab.class';

function selectById(state, id) {
  return state.map(tab => ((tab.active = (tab.id === id)) && tab || tab));
}

export const previewTabs: Reducer<PreviewTabProps[]> = (state = [], action) => {
  switch (action.type) {

    case StoreActionsEnum.OPEN_TAB: {
      return selectById([...state, action.tab], action.tab.id);
    }

    case StoreActionsEnum.CLOSE_TAB: {
      let
        tabs = state,
        id = action.id,
        index = tabs.findIndex(tab => tab.id === id),
        tabToClose = tabs[index];
      if (tabs.length > 1 && tabToClose.active) {
        // If closed was the active one, assign
        // the nearest anterior tabToClose as active
        tabs = [...state].splice(index, 1);
        return selectById(tabs, id);
      } else {
        return state.filter(tab => tab.id !== id);
      }
    }

    case StoreActionsEnum.OPEN_TAB_BACKGROUND: {
      return [...state, action.tab];
    }

    case StoreActionsEnum.SELECT_TAB: {
      return selectById(state, action.id);
    }

    case StoreActionsEnum.STATE_INIT: {
      let
        nextState = [],
        hasActive = false;
      state
        .forEach(tab => {
          nextState.push(tab instanceof PreviewTab ? tab : PreviewTab.deserialize(tab));
          hasActive = hasActive || tab.active;
        });
      if (!hasActive && state.length) {
        nextState[0].active = true;
      }
      return nextState;
    }

    default:
      return state;

  }
};
