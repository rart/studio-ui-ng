import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemListDashletComponent } from './item-list-dashlet.component';

describe('ItemListDashletComponent', () => {
  let component: ItemListDashletComponent;
  let fixture: ComponentFixture<ItemListDashletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemListDashletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemListDashletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
