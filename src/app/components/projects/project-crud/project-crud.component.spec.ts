import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteCrUDComponent } from './site-crud.component';

describe('SiteCrUDComponent', () => {
  let component: SiteCrUDComponent;
  let fixture: ComponentFixture<SiteCrUDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteCrUDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteCrUDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
