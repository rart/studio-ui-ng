import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalNavBarComponent } from './vertical-navbar.component';

describe('VerticalNavBarComponent', () => {
  let component: VerticalNavBarComponent;
  let fixture: ComponentFixture<VerticalNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerticalNavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
