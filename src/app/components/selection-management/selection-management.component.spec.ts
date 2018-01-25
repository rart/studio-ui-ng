import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionManagementComponent } from './selection-management.component';

describe('SelectionManagementComponent', () => {
  let component: SelectionManagementComponent;
  let fixture: ComponentFixture<SelectionManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
