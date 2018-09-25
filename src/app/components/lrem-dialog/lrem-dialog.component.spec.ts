import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LremDialogComponent } from './lrem-dialog.component';

describe('LremDialogComponent', () => {
  let component: LremDialogComponent;
  let fixture: ComponentFixture<LremDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LremDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LremDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
