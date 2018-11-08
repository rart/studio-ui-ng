import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEditorContainerComponent } from './form-editor-container.component';

describe('FormEditorContainerComponent', () => {
  let component: FormEditorContainerComponent;
  let fixture: ComponentFixture<FormEditorContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormEditorContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormEditorContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
