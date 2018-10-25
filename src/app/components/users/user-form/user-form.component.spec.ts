import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCrUDComponent } from './user-crud.component';

describe('UserCrUDComponent', () => {
  let component: UserCrUDComponent;
  let fixture: ComponentFixture<UserCrUDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCrUDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCrUDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
