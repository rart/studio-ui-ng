import { StringUtils, uuid, makeSub } from '../app.utils';
import { Asset } from '../models/asset.model';

interface HistoryItem {
  url: string;
  title: string;
  siteCode: string;
}

export class PreviewTab {

  public id: string;
  public asset: Asset;

  private history: Array<HistoryItem> = [];
  private historyIndex = -1;
  private pending = true; // The guest hasn't checked in

  /**
   * @param url {string}
   * @param title {string}
   * @param siteCode {string} The identifying code of the site this tab refers to
   * @param isNew {boolean} The tab has a 'blank' URL pending user input
   **/
  constructor(public url: string,
              public title: string,
              public siteCode: string,
              public isNew = false) {
    this.id = uuid();
    if (url) {
      this.track({ url, title, siteCode });
    }
  }

  static deserialize(json) {
    let tab = new PreviewTab(
      json.url,
      json.title,
      json.siteCode,
      json.isNew);
    tab.id = json.id;
    tab.asset = json.asset;
    return tab;
  }

  /**
   * Updates the current history entry to reflect the
   * instance's current state/values
   * */
  private updateHistory() {
    let { url, title, siteCode } = this;
    if (this.history.length === 0) {
      this.track({ url, title, siteCode });
    } else {
      this.history[this.historyIndex].url = url;
      this.history[this.historyIndex].title = title;
      this.history[this.historyIndex].siteCode = siteCode;
    }
  }

  private setValues(url, title, siteCode) {
    this.url = url;
    this.title = title;
    this.siteCode = siteCode;
  }

  back() {
    let history = this.history;
    if (this.hasBack()) {
      let { url, title, siteCode } = history[--this.historyIndex];
      this.setValues(url, title, siteCode);
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
      let { url, title, siteCode } = history[++this.historyIndex];
      this.setValues(url, title, siteCode);
      this.pending = true;
      return true;
    } else {
      return false;
    }
  }

  hasForward() {
    return (this.history.length > 1) && (this.historyIndex < (this.history.length - 1));
  }

  navigate(siteCode, url, title = 'Loading') {
    let history = this.history;
    let index = this.historyIndex;
    let lastIndex = history.length - 1;
    if (index < lastIndex) {
      // Cut the history here
      history.splice(index + 1);
    }
    this.track({ url, title, siteCode });
    this.setValues(url, title, siteCode);
  }

  update(url, title, siteCode = this.siteCode) {

    this.setValues(url, title, siteCode);
    this.updateHistory();

    this.pending = false;

  }

  notifyExternalLoad(url = this.url, title = 'External Page') {
    this.update(url, title, null);
  }

  track(entry: HistoryItem) {
    this.historyIndex++;
    this.history.push(entry);
  }

  isPending() {
    return this.pending;
  }

  // NOT a Crafter preview/engine page.
  // Studio won't be able to interact with the page unless set up for it.
  isExternal(url = this.url) {
    return (StringUtils.startsWith(url, 'http') || StringUtils.startsWith(url, '//'));
  }

}
