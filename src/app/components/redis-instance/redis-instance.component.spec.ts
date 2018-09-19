import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisInstanceComponent } from './redis-instance.component';

describe('RedisInstanceComponent', () => {
  let component: RedisInstanceComponent;
  let fixture: ComponentFixture<RedisInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisInstanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
