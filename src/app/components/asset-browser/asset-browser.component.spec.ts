import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetBrowserComponent } from './asset-browser.component';

describe('AssetBrowserComponent', () => {
  let component: AssetBrowserComponent;
  let fixture: ComponentFixture<AssetBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
