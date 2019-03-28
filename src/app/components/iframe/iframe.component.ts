import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  OnChanges
} from '@angular/core';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { CommunicationService } from '../../services/communication.service';
import { ComponentBase } from '../../classes/component-base.class';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'std-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.scss']
})
export class IFrameComponent extends ComponentBase implements OnInit, OnDestroy, AfterViewInit, AfterContentInit, OnChanges {

  @ViewChild('frame') iFrameRef: ElementRef;

  @Output() load = new Subject();
  @Output() loading$ = new BehaviorSubject(false);
  @Output() beforeNav = new Subject();

  @Input() changeTrigger: any; // A(ny) secondary property to cause angular to call ngOnChanges
  @Input() spinner = false;

  private _communicates = false;

  @Input() src = 'about:blank';

  @Input()
  set communicates(communicates: boolean) {
    this._communicates = communicates;
    if (communicates) {
      this.setUpCommunications();
    } else {
      this.tearDownCommunications();
    }
  }

  get element() {
    return this.iFrameRef ? this.iFrameRef.nativeElement : null;
  }

  constructor(private communicator: CommunicationService) {
    super();
  }

  ngOnInit() {
    this.load
      .pipe(this.untilDestroyed())
      .subscribe(x => this.loading$.next(false));
  }

  ngOnDestroy() {
    this.tearDownCommunications();
  }

  ngAfterViewInit() {
    this.communicates = this._communicates;
  }

  ngAfterContentInit() {

  }

  ngOnChanges() {
    if (this.element) {
      this.reload();
    }
  }

  navigate(url: string) {
    this.loading$.next(true);
    this.beforeNav.next();
    this.element.src = this.src = (('about:blank' === url) ? url : `${environment.url.preview}${url}`);
  }

  reload() {
    this.navigate(this.src);
  }

  private setUpCommunications() {
    this.configureCommunications(true);
  }

  private tearDownCommunications() {
    this.configureCommunications(false);
  }

  private configureCommunications(setUp: boolean) {
    let
      iFrame = this.element,
      origin = window.location.origin;
    if (iFrame) {
      if (setUp) {
        this.communicator.addTarget(iFrame);
        // TODO: load from config e.g. environment.urlPreviewBase or otherwise
        this.communicator.addOrigin(origin);
      } else {
        this.communicator.removeTarget(iFrame);
        this.communicator.removeOrigin(origin);
      }
    }
  }

}
