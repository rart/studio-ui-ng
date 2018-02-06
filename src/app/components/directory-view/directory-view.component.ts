import { AfterViewInit, Component, ElementRef, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';
import { Asset } from '../../models/asset.model';
import { Subject } from 'rxjs/Subject';
import { FileDropHelper } from '../../classes/file-drop-herlper.class';
import { UploaderComponent } from '../uploader/uploader.component';
import { openDialog } from '../../utils/material.utils';
import { MatDialog } from '@angular/material';
import { merge } from 'rxjs/observable/merge';
import { takeUntil } from 'rxjs/operators';
import { notNullOrUndefined } from '../../app.utils';
import { isNullOrUndefined } from 'util';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AssetActions } from '../../actions/asset.actions';

@Component({
  selector: 'std-directory-view',
  templateUrl: './directory-view.component.html',
  styleUrls: ['./directory-view.component.scss']
})
export class DirectoryViewComponent extends WithNgRedux implements AfterViewInit, OnChanges {

  @Input() id: string;
  @Input() showInfoSheet = true;
  @Input() showPermissions = true;

  @Output() selectionChange = new Subject();

  @select(['entities', 'assets', 'byId'])
  ASSETS$;

  selection: Asset;
  directory: Asset;
  entries = [];
  loading = false;
  error = false;

  ngOnChanges$ = new Subject();

  constructor(store: NgRedux<AppState>,
              private elementRef: ElementRef,
              private dialog: MatDialog,
              private actions: AssetActions) {
    super(store);
  }

  ngOnChanges(changes: SimpleChanges) {
    let { store, state, actions, ngOnChanges$, ngOnDestroy$, id } = this;
    ngOnChanges$.next(changes);

    if (notNullOrUndefined(id)) {

      store.select<Asset>(['entities', 'assets', 'byId', id])
        .pipe(
          this.filterNulls(),
          takeUntil(merge(ngOnChanges$, ngOnDestroy$)))
        .subscribe((asset) => {
          this.directory = asset;
        });

      store.select<boolean>(['entities', 'assets', 'loading', id])
        .pipe(
          this.filterNulls(),
          takeUntil(merge(ngOnChanges$, ngOnDestroy$)))
        .subscribe((loading) => {
          this.loading = loading;
        });

      store.select<boolean>(['entities', 'assets', 'error', id])
        .pipe(
          this.filterNulls(),
          takeUntil(merge(ngOnChanges$, ngOnDestroy$)))
        .subscribe((error) => {
          this.error = error;
        });

      let byId = state.entities.assets.byId[id];
      if (isNullOrUndefined(byId) ||
        (notNullOrUndefined(byId) && (byId.numOfChildren > 0) && isNullOrUndefined(byId.children))) {
        this.dispatch(actions.get(id));
      }

    }

  }

  ngAfterViewInit() {

    let elem = this.elementRef.nativeElement;

    let dnd = new FileDropHelper(elem);
    dnd.subscribe((files) => {
      this.filesDropped(files);
    });

    this.addTearDown(() => dnd.terminate());

  }

  private filesDropped(files) {
    openDialog(this.dialog, UploaderComponent, {
      width: '80vw',
      height: '80vh',
      panelClass: ['no', 'pad', 'dialog', 'uploader'],
      data: { files, site: '', path: '' }
    });
  }

  onSelection(selection) {
    this.selection = selection;
    this.selectionChange.next(selection);
  }

}
