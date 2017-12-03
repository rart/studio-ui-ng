import { StringUtils, uuid, makeSub } from '../app.utils';
import { Asset } from '../models/asset.model';
import { AssetTypeEnum } from '../enums/asset-type.enum';

interface HistoryItem {
  url: string;
  title: string;
  siteCode: string;
  asset: Asset;
}

export interface PreviewTabProps {
  id: string;
  url: string;
  title: string;
  asset: Asset;
  siteCode: string;
  edit: boolean;
  isNew: boolean;
  active: boolean;
}

export class PreviewTab implements PreviewTabProps {

  id: string;

  url: string;
  title: string;
  asset: Asset = null;
  siteCode: string = null;

  edit = false;
  isNew = false;
  active = false;

  private history: Array<HistoryItem> = [];
  private historyIndex = -1;
  private pending = true; // The guest hasn't checked in

  /**
   * @param url {string}
   * @param title {string}
   * @param siteCode {string} The identifying code of the site this tab refers to
   * @param isNew {boolean} The tab has a 'blank' URL pending user input
   **/
  constructor() {
    this.id = uuid();
  }

  static deserialize(json) {
    let tab = new PreviewTab();
    let { url, title, siteCode, asset } = json;
    tab.edit = json.edit;
    tab.isNew = json.isNew;
    tab.active = json.active;
    tab.navigate(siteCode, url, title, asset);
    return tab;
  }

  /**
   * Updates the current history entry to reflect the
   * instance's current state/values
   * */
  private updateHistory() {
    let { url, title, siteCode, asset } = this;
    if (this.history.length === 0) {
      this.track({ url, title, siteCode, asset });
    } else {
      this.history[this.historyIndex].url = url;
      this.history[this.historyIndex].title = title;
      this.history[this.historyIndex].siteCode = siteCode;
    }
  }

  private setValues(url, title, siteCode, asset: Asset) {
    this.url = url;
    this.title = title;
    this.asset = asset;
    this.siteCode = siteCode;
  }

  back() {
    let history = this.history;
    if (this.hasBack()) {
      let { url, title, siteCode, asset } = history[--this.historyIndex];
      this.setValues(url, title, siteCode, asset);
      this.pending = true;
      return true;
    } else {
      return false;
    }
  }

  hasBack() {
    return this.historyIndex > 0;
  }

  forward() {
    let history = this.history;
    if (this.hasForward()) {
      let { url, title, siteCode, asset } = history[++this.historyIndex];
      this.setValues(url, title, siteCode, asset);
      this.pending = true;
      return true;
    } else {
      return false;
    }
  }

  hasForward() {
    return (this.history.length > 1) && (this.historyIndex < (this.history.length - 1));
  }

  navigate(siteCode, url, title = '...', asset: Asset = this.asset) {
    this.track({ url, title, siteCode, asset });
    this.setValues(url, title, siteCode, asset);
  }

  update(url, title, siteCode: string = this.siteCode, asset: Asset = this.asset) {

    this.setValues(url, title, siteCode, asset);
    this.updateHistory();

    this.pending = false;

  }

  notifyExternalLoad(url = this.url, title = 'External Page') {
    this.update(url, title, null);
  }

  track(newEntry: HistoryItem) {
    let
      history = this.history,
      currentEntry = history[this.historyIndex];
    if ((!currentEntry) ||
      (currentEntry.siteCode !== newEntry.siteCode) ||
      (currentEntry.url !== newEntry.url)) {
      let
        index = this.historyIndex,
        lastIndex = history.length - 1;
      if (index < lastIndex) {
        // Cut the history here
        history.splice(index + 1);
      }
      this.historyIndex++;
      this.history.push(newEntry);
      // Entry tracked
      return true;
    }
    // Duplicate entry, ignored. History preserved.
    return false;
  }

  isPending() {
    return this.pending;
  }

  // NOT a Crafter preview/engine page.
  // Studio won't be able to interact with the page unless set up for it.
  isExternal(url = this.url) {
    return (StringUtils.startsWith(url, 'http') || StringUtils.startsWith(url, '//'));
  }

  type() {
    let type = 'page';
    let { asset } = this;
    if (asset) {
      switch (asset.type) {
        case AssetTypeEnum.CSS:
        case AssetTypeEnum.HTML:
        case AssetTypeEnum.GROOVY:
        case AssetTypeEnum.JAVASCRIPT:
        case AssetTypeEnum.FREEMARKER:
          type = 'text';
          break;
        case AssetTypeEnum.MP4:
          type = 'video';
          break;
        case AssetTypeEnum.MPEG:
          type = 'audio';
          break;
        case AssetTypeEnum.TTF_FONT:
        case AssetTypeEnum.OTF_FONT:
        case AssetTypeEnum.EOT_FONT:
        case AssetTypeEnum.WOFF_FONT:
        case AssetTypeEnum.WOFF2_FONT:
          type = 'font';
          break;
        case AssetTypeEnum.GIF:
        case AssetTypeEnum.PNG:
        case AssetTypeEnum.SVG:
        case AssetTypeEnum.JPEG:
          type = 'image';
          break;
        default:
          type = 'page';
      }
    } else {
      type = 'page';
    }
    return type;
  }

}
