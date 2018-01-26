import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { UserActions } from '../../actions/user.actions';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AppState } from '../../classes/app-state.interface';
import { notNullOrUndefined } from '../../app.utils';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'std-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends WithNgRedux implements OnInit {

  studioLogoUrl = `${environment.assetsUrl}/img/logos/white.png`;

  showRecoverView = false;

  remember = false;
  model: User = new User();

  userNameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);

  @select('auth')
  auth$;

  constructor(store: NgRedux<AppState>) {
    super(store);
  }

  ngOnInit() {

    $('body').addClass('login view');

    let user = this.state.user;
    if (notNullOrUndefined(user)) {
      this.model = user;
    }

    this.addTearDown(() => {
      $('body').removeClass('login view');
    });

  }

  @dispatch()
  login() {
    return UserActions.login(this.model);
  }

  @dispatch()
  logout() {
    return UserActions.logout();
  }

  @dispatch()
  recover() {
    return UserActions.recover(this.model);
  }

}
