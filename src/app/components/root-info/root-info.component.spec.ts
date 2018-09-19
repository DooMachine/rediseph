import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RootInfoComponent } from './root-info.component';

describe('RootInfoComponent', () => {
  let component: RootInfoComponent;
  let fixture: ComponentFixture<RootInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RootInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RootInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
