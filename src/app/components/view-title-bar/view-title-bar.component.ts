import { AfterViewInit, Component, ContentChild, ElementRef, HostBinding, Input, OnInit, TemplateRef } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Settings } from '../../classes/app-state.interface';
import { ComponentBase } from '../../classes/component-base.class';

@Component({
  selector: 'std-view-title-bar',
  template: `
    <header [attr.max]="childMax">
      <section class="left">
        <button color="default" mat-fab 
                *ngIf="back !== ''" [routerLink]="[back]"
                [attr.aria-label]="'Back' | translate">
          <mat-icon class="" aria-hidden="true">chevron_left</mat-icon>
        </button>
        <std-sidebar-toggler *ngIf="navToggler"></std-sidebar-toggler>
        <h1 class="heading" *ngIf="!heading" [ngClass]="{ 'pad left': back !== '' }">
          <mat-icon *ngIf="icon">{{icon}}</mat-icon> {{title|translate}}
        </h1>
        <ng-container
          [ngTemplateOutlet]="heading"
          [ngTemplateOutletContext]="{ $implicit: { icon: icon, title: title } }">
        </ng-container>
      </section>
      <ng-content></ng-content>
    </header>
    <ng-container [ngTemplateOutlet]="toolbar"></ng-container>`,
  styleUrls: ['./view-title-bar.component.scss']
})
export class ViewTitleBarComponent extends ComponentBase implements OnInit, AfterViewInit {

  @select('settings') settings$: Observable<Settings>;

  @HostBinding('attr.hue') hue;
  @HostBinding('attr.theme') theme;

  @ContentChild('heading') heading: TemplateRef<any>;
  @ContentChild('toolbar') toolbar: TemplateRef<any>;

  @Input() title;
  @Input() icon;
  @Input() navToggler = false;
  @Input() back = '';
  @Input() childMax;

  constructor(private elementRef: ElementRef) {
    super();
  }

  ngOnInit() {
    this.settings$
      .pipe(this.untilDestroyed())
      .subscribe((settings) => {
        this.theme = settings.topBarTheme;
        this.hue = settings.topBarThemeHue;
      });
  }

  ngAfterViewInit() {
    let el = this.elementRef.nativeElement;
    el.classList.add('view');
    el.classList.add('header');
  }

}
