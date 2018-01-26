import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DependencyReviewComponent } from './dependency-review.component';

describe('DependencyReviewComponent', () => {
  let component: DependencyReviewComponent;
  let fixture: ComponentFixture<DependencyReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DependencyReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DependencyReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
