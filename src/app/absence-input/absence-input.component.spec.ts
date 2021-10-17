import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceInputComponent } from './absence-input.component';

describe('AbsenceInputComponent', () => {
  let component: AbsenceInputComponent;
  let fixture: ComponentFixture<AbsenceInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbsenceInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsenceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
