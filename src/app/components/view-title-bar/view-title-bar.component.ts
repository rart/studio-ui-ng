import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Settings } from '../../classes/app-state.interface';
import { ComponentBase } from '../../classes/component-base.class';

@Component({
  selector: 'std-view-title-bar',
  template: `
      <header fxFlex="100%" fxLayoutAlign="space-between center" [attr.max]="childMax">
        <section fxLayoutAlign="left center">
          <button color="default" mat-fab 
                  *ngIf="back !== ''" [routerLink]="[back]"
                  [attr.aria-label]="'Back' | translate">
            <mat-icon class="" aria-hidden="true">chevron_left</mat-icon>
          </button>
          <h1 [ngClass]="{ 'pad left': back !== '' }">
            <mat-icon *ngIf="icon">{{icon}}</mat-icon> {{title|translate}}
          </h1>
        </section>
        <ng-content></ng-content>
      </header>`,
  styleUrls: ['./view-title-bar.component.scss']
})
export class ViewTitleBarComponent extends ComponentBase implements OnInit, AfterViewInit {

  @select('settings') settings$: Observable<Settings>;

  @HostBinding('attr.hue') hue;
  @HostBinding('attr.theme') theme;

  @Input() title;
  @Input() icon;
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
