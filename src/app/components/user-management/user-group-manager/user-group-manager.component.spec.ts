import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSiteManagerComponent } from './user-site-manager.component';

describe('UserSiteManagerComponent', () => {
  let component: UserSiteManagerComponent;
  let fixture: ComponentFixture<UserSiteManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSiteManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSiteManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
