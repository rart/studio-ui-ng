import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowStatesComponent } from './workflow-states.component';

describe('WorkflowStatesComponent', () => {
  let component: WorkflowStatesComponent;
  let fixture: ComponentFixture<WorkflowStatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowStatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowStatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
