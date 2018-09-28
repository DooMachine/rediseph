import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CliContainerComponent } from './cli-container.component';

describe('CliContainerComponent', () => {
  let component: CliContainerComponent;
  let fixture: ComponentFixture<CliContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CliContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CliContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
