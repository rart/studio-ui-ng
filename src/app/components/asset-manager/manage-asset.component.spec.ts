import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAssetComponent } from './manage-asset.component';

describe('ManageAssetComponent', () => {
  let component: ManageAssetComponent;
  let fixture: ComponentFixture<ManageAssetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAssetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
