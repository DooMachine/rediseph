import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeRootComponent } from './node-root.component';

describe('NodeRootComponent', () => {
  let component: NodeRootComponent;
  let fixture: ComponentFixture<NodeRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
