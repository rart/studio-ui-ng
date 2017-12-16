import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  OnChanges
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CommunicationService } from '../../services/communication.service';
import { isNull } from 'util';

@Component({
  selector: 'std-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.scss']
})
export class IFrameComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit, OnChanges {

  @ViewChild('frame') iFrameRef: ElementRef;

  @Output() load = new Subject();
  @Output() beforeNav = new Subject();

  @Input() changeTrigger: any; // A(ny) secondary property to cause angular to call ngOnChanges

  private _communicates = false;
  private _src = 'about:blank';

  @Input() src = 'about:blank';
  // @Input()
  // set src(src) {
  //   this._src = src;
  //   if (!isNull(this.element)) {
  //     this.navigate(src);
  //   }
  // }
  //
  // get src() {
  //   return this._src;
  // }

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
  }

  ngOnInit() {

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
    // pretty('yellow', 'Changes have occurred', this.src);
    if (this.element) {
      this.reload();
    }
  }

  navigate(url: string) {
    this.beforeNav.next();
    this.src = url;
    this.element.src = url;
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
