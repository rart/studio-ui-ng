import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMenuComponent } from './asset-menu.component';

describe('AssetMenuComponent', () => {
  let component: AssetMenuComponent;
  let fixture: ComponentFixture<AssetMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
