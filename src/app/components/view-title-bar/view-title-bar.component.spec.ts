import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTitleBarComponent } from './view-title-bar.component';

describe('ViewTitleBarComponent', () => {
  let component: ViewTitleBarComponent;
  let fixture: ComponentFixture<ViewTitleBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTitleBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTitleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
