import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FontVisualizerComponent } from './font-visualizer.component';

describe('FontVisualizerComponent', () => {
  let component: FontVisualizerComponent;
  let fixture: ComponentFixture<FontVisualizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FontVisualizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FontVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
