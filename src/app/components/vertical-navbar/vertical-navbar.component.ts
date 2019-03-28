import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { Settings } from '../../classes/app-state.interface';
import { dispatch, select } from '@angular-redux/store';
import { Observable ,  fromEvent ,  interval } from 'rxjs';
import { ComponentBase } from '../../classes/component-base.class';
import { skip, switchMap, take, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SettingsActions } from '../../actions/settings.actions';
import { navBarAnimations } from '../../utils/animations.utils';

const PATH_IMAGES = `${environment.url.assets}/img/logos`;

@Component({
  selector: 'std-vertical-navbar',
  templateUrl: './vertical-navbar.component.html',
  styleUrls: ['./vertical-navbar.component.scss'],
  animations: navBarAnimations
})
export class VerticalNavBarComponent extends ComponentBase implements OnInit, AfterViewInit {

  @HostBinding('@visibility') visibility = 'expanded';
  @HostBinding('class.minimised') minimised = false;
  @HostBinding('class.right') right = false;
  @HostBinding('class.reveal') reveal = false;
  @HostBinding('attr.theme') theme = null;
  @HostBinding('attr.hue') hue = null;

  @select('settings')
  settings$: Observable<Settings>;

  isMobile = false;
  settings: Settings;
  logoImage = `${PATH_IMAGES}/flat.png`;

  viewInitialized = false;

  constructor(private platform: Platform,
              private elementRef: ElementRef) {
    super();
    if (this.platform.ANDROID || this.platform.IOS) {
      this.isMobile = true;
    }
  }

  ngOnInit() {
    this.settings$
      .pipe(this.untilDestroyed())
      .subscribe((settings) => {
        this.settings = settings;
        this.right = settings.navBarPosition === 'right';
        this.theme = settings.navBarTheme ? settings.navBarTheme : null;
        this.hue = settings.navBarThemeHue ? settings.navBarThemeHue : null;
        this.minimised = settings.navBarMinimised;
        this.visibility = settings.navBarShown ? 'expanded' : 'minimised';
        this.logoImage = (['main', 'yellow', 'teal', 'white'].includes(settings.navBarTheme))
          ? `${PATH_IMAGES}/black.png`
          : `${PATH_IMAGES}/white.png`;
        if (settings.navBarMinimised) {
          this.beginRevealService();
        }
      });
  }

  ngAfterViewInit() {

    setTimeout(() => {
      this.viewInitialized = true;
    });

  }

  beginRevealService() {

    let
      elem = this.elementRef.nativeElement,
      content = elem.querySelector('.content'),
      settings$ = this.settings$.pipe(skip(1)),
      interval$ = interval(200),
      mouseover$ = fromEvent(content, 'mouseover'),
      mouseout$ = fromEvent(content, 'mouseout');

    mouseover$
      .pipe(
        takeUntil(settings$),
        switchMap(
          () => interval$.pipe(
            takeUntil(mouseout$),
            take(1))))
      .subscribe(() => {
        this.reveal = true;
      });

    mouseout$
      .pipe(
        takeUntil(settings$),
        switchMap(() => interval$.pipe(
          takeUntil(mouseover$),
          take(1))))
      .subscribe(() => {
        this.reveal = false;
      });

  }

  @dispatch()
  toggleMinimised() {
    return SettingsActions.toggleSideBarFolded();
  }

}
