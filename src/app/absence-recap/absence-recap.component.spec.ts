import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceRecapComponent } from './absence-recap.component';

describe('AbsenceRecapComponent', () => {
  let component: AbsenceRecapComponent;
  let fixture: ComponentFixture<AbsenceRecapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbsenceRecapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsenceRecapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
