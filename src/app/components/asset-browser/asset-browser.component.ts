import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppState, ExplorerState, LookupTable } from '../../classes/app-state.interface';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { Asset } from '../../models/asset.model';
import { ExplorerActions } from '../../actions/explorer.actions';
import { isNullOrUndefined } from 'util';
import { notNullOrUndefined } from '../../app.utils';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { DirectoryViewComponent } from '../directory-view/directory-view.component';
import { interval } from 'rxjs/observable/interval';
import { scan, takeLast, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'std-asset-browser',
  templateUrl: './asset-browser.component.html',
  styleUrls: ['./asset-browser.component.scss']
})
export class AssetBrowserComponent extends WithNgRedux implements AfterViewInit {

  @ViewChild('wrapper', { read: ElementRef }) wrapper: ElementRef;
  @ViewChildren(DirectoryViewComponent, { read: ElementRef }) directories: QueryList<ElementRef>;

  tree = {};
  paths = [];
  selectedAsset: string;

  @select(['entities', 'assets', 'byId'])
  assets$: LookupTable<Asset>;

  constructor(store: NgRedux<AppState>) {
    super(store);

    // If there's no active explorer project but there's a active project
    // pick that site as the explorer's active project too
    let state = store.getState();
    let explorerState = state.explorer;
    if (isNullOrUndefined(explorerState.activeProjectCode)
      && notNullOrUndefined(state.activeProjectCode)) {
      store.dispatch(ExplorerActions.selectProject(state.activeProjectCode));
    }

    this.pipeFilterAndTakeUntil(
      store.select<ExplorerState>(['explorer']))
      .subscribe((explorer) => {
        let container = explorer.byProject[explorer.activeProjectCode];
        if (notNullOrUndefined(container.paths)) {
          this.paths = container.paths;
        }
        this.selectedAsset = container.asset;
      });

  }

  ngAfterViewInit() {
    let { directories, wrapper } = this;
    directories.changes.subscribe(() => {
      if (wrapper && wrapper.nativeElement) {
        setTimeout(() => this.scrollTo(wrapper.nativeElement.scrollWidth), 100);
      }
    });
  }

  private scrollToRightEdge() {
    let
      elem = this.wrapper.nativeElement,
      width = elem.scrollWidth,
      pos = elem.scrollLeft;
    interval(50).pipe(
      scan(a => {
        let newPos = a + 100;
        elem.scrollLeft = newPos;
        return newPos;
      }, pos),
      takeWhile(p => p < width),
      takeLast(1)
    ).subscribe((value) => {
      // callback...
    });
  }

  private scrollTo(target: number, callback?: () => void) {
    scrollTo(this.wrapper.nativeElement, target, 250);
  }

  @dispatch()
  selectionChange(id: string) {
    return ExplorerActions.selectAsset(
      this.state.entities.assets.byId[id]);
  }

  directoryTracker(index, path) {
    return path;
  }

  search(query) {
    console.log(query);
  }

  crumbClicked(path, index) {
    if (path === 'ROOT') {
      this.scrollTo(0);
    } else if (path === 'ASSET') {
      this.scrollTo(this.wrapper.nativeElement.scrollWidth);
    } else {
      let directoryRef: ElementRef = this.directories.find((item, i) => index === i);
      directoryRef.nativeElement.scrollIntoView();
    }
  }

}

// https://en.wikipedia.org/wiki/Bézier_curve
// http://webkod.pl/kurs-css/wartosci/funkcje/cubic-bezier
// https://gist.github.com/andjosh/6764939

function ease(currentTime, startValue, changeInValue, duration) {
  currentTime /= duration / 2;
  if (currentTime < 1) {
    return changeInValue / 2 * currentTime * currentTime + startValue;
  }
  currentTime--;
  return -changeInValue / 2 * (currentTime * (currentTime - 2) - 1) + startValue;
}

function scrollTo(element, to, duration) {
  let start = element.scrollLeft,
    change = to - start,
    currentTime = 0,
    increment = 20;

  function animateScroll() {
    currentTime += increment;
    let value = ease(currentTime, start, change, duration);
    element.scrollLeft = value;
    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  }

  animateScroll();

}
