import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKeyModalComponent } from './add-key-modal.component';

describe('AddKeyModalComponent', () => {
  let component: AddKeyModalComponent;
  let fixture: ComponentFixture<AddKeyModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddKeyModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddKeyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
