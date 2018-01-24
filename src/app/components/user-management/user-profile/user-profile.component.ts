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
  colors = Object.keys(ColorsEnum).map(color => color.toLowerCase());

  constructor() {
    super();
  }

  ngOnInit() {

    this.user$
      .pipe(takeUntil(this.unSubscriber$))
      .subscribe((user) => {
        this.user = { ...user } as User;
      });

    this.settings$
      .pipe(takeUntil(this.unSubscriber$))
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
    return SettingsActions.updateMany(this.settings);
  }

}
