import { Component, OnInit } from '@angular/core';
import { dispatch, select } from '@angular-redux/store';
import { UserActions } from '../../../actions/user.actions';
import { ColorsEnum } from '../../../enums/colors.enum';
import { Observable } from 'rxjs/Observable';
import { Settings } from '../../../classes/app-state.interface';
import { ComponentBase } from '../../../classes/component-base.class';
import { takeUntil } from 'rxjs/operators';
import { SettingsActions } from '../../../actions/settings.actions';
import { User } from '../../../models/user.model';
import { StringUtils } from '../../../utils/string.utils';

@Component({
  selector: 'std-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent extends ComponentBase implements OnInit {

  @select('settings')
  settings$: Observable<Settings>;
  @select('user')
  user$: Observable<User>;

  user: User;
  settings: Settings;
  colors = Object.keys(ColorsEnum)
    .filter((color) => !['GREY_LIGHTEST', 'GREY_LIGHTER', 'GREY_LIGHT', 'GREY_MID'].includes(color))
    .map(color => ({
      key: color === 'GREY_MAIN' ? 'main' : StringUtils.dasherize(color.toLowerCase()),
      label: color,
      code: ColorsEnum[color],
      defaultHue: color === 'GREY_MAIN' ? 500 : 700
    }));

  constructor() {
    super();
  }

  ngOnInit() {

    this.user$
      .pipe(this.untilDestroyed())
      .subscribe((user) => {
        this.user = { ...user } as User;
      });

    this.settings$
      .pipe(this.untilDestroyed())
      .subscribe((settings) => {
        this.settings = { ...settings };
      });

  }

  @dispatch()
  logout() {
    return UserActions.loggedOut();
  }

  @dispatch()
  settingsChanged() {
    return SettingsActions.updateMany({
      ...this.settings,
      topBarTheme: this.settings.navBarTheme,
      navBarThemeHue: (this.settings.navBarTheme === 'main') ? 500 : 700
    });
  }

}
