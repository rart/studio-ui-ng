import { Component, OnInit } from '@angular/core';
import { dispatch, select } from '@angular-redux/store';
import { UserActions } from '../../actions/user.actions';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'std-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  @select('user')
  user$: Observable<User>;

  languages = [
    { key: 'en', label: 'English' },
    { key: 'es', label: 'Español' },
    { key: 'kr', label: '한국어' }
  ];

  constructor(private translate: TranslateService) {

  }

  ngOnInit() {

  }

  changeLanguage(key) {
    this.translate.use(key);
  }

  @dispatch()
  logout() {
    return UserActions.loggedOut();
  }

}
