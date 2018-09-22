import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringViewerComponent } from './string-viewer.component';

describe('StringViewerComponent', () => {
  let component: StringViewerComponent;
  let fixture: ComponentFixture<StringViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
