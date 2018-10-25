import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListPaginatorComponent } from './user-list-paginator.component';

describe('UserListPaginatorComponent', () => {
  let component: UserListPaginatorComponent;
  let fixture: ComponentFixture<UserListPaginatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListPaginatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
