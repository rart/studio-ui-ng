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

@Component({
  selector: 'std-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.scss']
})
export class IFrameComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit, OnChanges {

  @ViewChild('frame') iFrameRef: ElementRef;
  @ViewChildren('frame') iFrameQL: QueryList<HTMLElement>;
  // private iFrame: HTMLElement;

  private communications = false;

  get element() {
    return this.iFrameRef ? this.iFrameRef.nativeElement : null;
  }

  @Input() src = 'about:blank';
  @Input() changeTrigger: any; // A(ny) secondary property to cause angular to call ngOnChanges

  @Input()
  set communicates(communicates: boolean) {
    this.communications = communicates;
    if (communicates) {
      this.setUpCommunications();
    } else {
      this.tearDownCommunications();
    }
  }

  @Output() load = new Subject();
  @Output() beforeNav = new Subject();

  constructor(private communicator: CommunicationService) {
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.tearDownCommunications();
  }

  ngAfterViewInit() {
    this.communicates = this.communications;
    this.iFrameQL.changes
      .subscribe(iFrameQL => {
        pretty('red', 'IFrameComponent.iFrameQL has changed!', iFrameQL);
      });
  }

  ngAfterContentInit() {

  }

  ngOnChanges() {
    // pretty('yellow', 'Changes have occurred', this.src);
    if (this.element) {
      this.beforeNav.next();
      this.element.src = this.src;
    }
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

  reload() {
    this.beforeNav.next();
    this.element.src = this.src;
  }

}
