import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRedisModalComponent } from './add-redis-modal.component';

describe('AddRedisModalComponent', () => {
  let component: AddRedisModalComponent;
  let fixture: ComponentFixture<AddRedisModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRedisModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRedisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
