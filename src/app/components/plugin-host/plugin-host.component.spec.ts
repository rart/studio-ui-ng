import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginHostComponent } from './plugin-host.component';

describe('PluginHostComponent', () => {
  let component: PluginHostComponent;
  let fixture: ComponentFixture<PluginHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PluginHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
