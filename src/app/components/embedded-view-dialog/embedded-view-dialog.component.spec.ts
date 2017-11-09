import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedViewDialogComponent } from './embedded-view-dialog.component';

describe('EmbeddedViewDialogComponent', () => {
  let component: EmbeddedViewDialogComponent;
  let fixture: ComponentFixture<EmbeddedViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbeddedViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddedViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
