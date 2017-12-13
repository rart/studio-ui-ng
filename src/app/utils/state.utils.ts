import { isNullOrUndefined, isString } from 'util';
import { v4 as uuid } from 'uuid';
import {
  EntityLookupTable, LookUpTable,
  PreviewTab,
  PreviewTabCore,
  PreviewTabHistory,
  PreviewTabStateContainer, StateEntity,
  Workspace
} from '../classes/app-state.interface';
import { Asset } from '../models/asset.model';
import { StudioModel } from './type.utils';
import { by } from 'protractor';

const DEFAULT_TAB_TITLE = '...';

export const createEntityState =
  <T>({
     order = undefined as any[],
     error = null as any,
     loading = false,
     byId = null as EntityLookupTable<any>
   }): StateEntity<T> => {
    let obj: StateEntity<any> = {
      error,
      loading,
      byId
    };
    if (!isNullOrUndefined(order)) {
      obj.order = order;
    }
    return obj;
  };

export function createLookupTable<T>(items: T[], idProp = 'id'): EntityLookupTable<T> {
  return items
    .reduce((lookupTable: Object, item: T) =>
      Object.assign(lookupTable, { [item[idProp]]: item }), {});
}

export const createPreviewTabHistory =
  ({
     index = undefined as number,
     hasBack = false,
     hasForward = false,
     initialEntry = undefined as PreviewTabCore
   }): PreviewTabHistory => ({
    index: isNullOrUndefined(index) ? isNullOrUndefined(initialEntry) ? -1 : 0 : index,
    hasBack,
    hasForward,
    entries: isNullOrUndefined(initialEntry) ? [] : [initialEntry]
  });

export const createPreviewTabHistoryEntry =
  ({ url, siteCode, assetId, title }): PreviewTabCore => ({
    url,
    title,
    siteCode,
    assetId
  });

export const createPreviewTab =
  ({ siteCode, url, assetId = null as string, title = DEFAULT_TAB_TITLE }): PreviewTab => ({
    id: uuid(),
    pending: true,
    url,
    title,
    siteCode,
    assetId,
    history: createPreviewTabHistory({ initialEntry: { siteCode, url, assetId, title } })
  });

export const createPreviewTabCore =
  ({ siteCode, url, title = DEFAULT_TAB_TITLE, assetId = null as string }): PreviewTabCore => ({
    url,
    title,
    siteCode,
    assetId
  });

export const createPreviewTabStateContainer =
  ({
     activeId = undefined as string,
     order = undefined as string[],
     byId = undefined as LookUpTable<PreviewTab>
   }): PreviewTabStateContainer => {
    let tab;
    if (isNullOrUndefined(byId)) {
      tab = createPreviewTab({
        url: '',
        title: '',
        assetId: null,
        siteCode: null
      });
      byId = { [tab.id]: tab };
    }
    if (isNullOrUndefined(activeId)) {
      activeId = tab.id;
    }
    if (isNullOrUndefined(order)) {
      order = Object.values(byId).map(value => value.id);
    }
    // Insure each tab has a history
    order.forEach(tabId => {

    });

    byId = order.reduce((nextById, tabId) => {
      let value = byId[tabId];
      nextById[tabId] = !isNullOrUndefined(value.history)
        ? value
        : {
          ...value,
          ...{
            history: createPreviewTabHistory({
              initialEntry: {
                assetId: value.assetId,
                siteCode: value.siteCode,
                title: value.siteCode,
                url: value.url
              }
            })
          }
        };
      return nextById;
    }, {});

    return {
      order,
      activeId,
      byId
    };
  };

export const createSiteState =
  ({
     settings = {},
     previewTabs = createPreviewTabStateContainer({}),
     selectedItems = {},
     expandedPanels = {},
     expandedPaths = {}
   }): Workspace => ({
    settings,
    previewTabs,
    selectedItems,
    expandedPanels,
    expandedPaths
  });
