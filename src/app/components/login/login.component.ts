import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { login, logout, recover } from '../../actions/user.actions';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AppState } from '../../classes/app-state.interface';
import { createEmptyUser, notNullOrUndefined } from '../../app.utils';
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
  model: User = createEmptyUser();

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
    return login(this.model);
  }

  @dispatch()
  logout() {
    return logout();
  }

  @dispatch()
  recover() {
    return recover(this.model);
  }

}
