import { Reducer } from 'redux';
import { v4 } from 'uuid';
import { StoreActionsEnum } from '../enums/actions.enum';
import { EditSessions } from '../classes/app-state.interface';

export const editSessions: Reducer<EditSessions> = (state = {
  activeId: null,
  order: [],
  byId: {}
}, action) => {
  switch (action.type) {

    case StoreActionsEnum.EDIT_ASSET: {
      let assetId = action.payload.assetId;
      let projectCode = action.payload.projectCode;
      let existing = Object.values(state.byId).find(session => session.assetId === assetId);
      if (existing) {
        if (state.activeId === existing.id) {
          return state;
        }
        return {
          ...state,
          activeId: existing.id
        };
      } else {
        let sessionUUID = v4();
        return {
          ...state,
          activeId: sessionUUID,
          order: state.order.concat(sessionUUID),
          byId: {
            ...state.byId,
            [sessionUUID]: {
              data: null,
              fetchPayload: null,
              status: 'void',
              projectCode,
              assetId
            }
          }
        };
      }
    }

    case StoreActionsEnum.FETCH_ASSET_FOR_EDIT: {
      let sessionUUID = action.payload.sessionUUID;
      return {
        ...state,
        byId: {
          ...state.byId,
          [sessionUUID]: {
            ...state.byId[sessionUUID],
            status: 'fetching'
          }
        }
      };
    }

    case StoreActionsEnum.ASSET_FETCHED_FOR_EDIT: {
      let sessionUUID = action.payload.sessionUUID;
      return {
        ...state,
        byId: {
          ...state.byId,
          [sessionUUID]: {
            ...state.byId[sessionUUID],
            fetchPayload: action.payload.data,
            status: 'fetched'
          }
        }
      };
    }

    case StoreActionsEnum.UPDATE_EDIT_SESSION: {
      let session = state.byId[action.payload.id];
      return updateOne(state, { ...session, data: { ...action.payload.data } });
    }

    case StoreActionsEnum.PERSIST_SESSION_CHANGES: {
      return updateOne(state, { ...action.payload.session, status: 'saving' });
    }

    case StoreActionsEnum.SESSION_CHANGES_PERSISTED: {
      return updateOne(state, { ...action.payload.session, status: 'fetched' });
    }

    case StoreActionsEnum.CHANGE_ACTIVE_EDIT_SESSION: {
      let next = action.payload.next;
      return {
        ...state,
        activeId: next.id
      };
    }

    case StoreActionsEnum.CLOSE_EDIT_SESSION: {
      let id = action.payload.session.id;
      return {
        ...state,
        byId: {
          ...state.byId,
          [id]: {
            ...state.byId[id],
            status: 'closing'
          }
        }
      };
    }

    case StoreActionsEnum.EDIT_SESSION_CLOSED: {
      let id = action.payload.session.id;
      let index = state.order.findIndex(sid => sid === id);
      let nextOrder = state.order.slice(0, index).concat(state.order.slice(index + 1));
      let nextActiveId;
      if (state.activeId !== id) {
        nextActiveId = state.activeId;
      } else if (nextOrder.length === 0) {
        nextActiveId = null;
      } else {
        if (index === -1) {
          // This should never happen, really. The session ID
          // sent should always be found
          console.error(`Invalid session id '${id}' sent to edit sessions reducer`);
          return state;
        }
        nextActiveId = nextOrder[index === 0 ? 0 : (index - 1)];
      }
      let sessions = { ...state.byId };
      delete sessions[id];
      return {
        ...state,
        activeId: nextActiveId,
        byId: sessions,
        order: nextOrder
      };
    }

    default:
      return state;

  }
};

function updateOne(state, session) {
  let id = session.id;
  return {
    ...state,
    byId: {
      ...state.byId,
      [id]: {
        ...session,
        data: { ...session.data }
      }
    }
  };
}
