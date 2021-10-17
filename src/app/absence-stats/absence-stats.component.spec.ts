import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceStatsComponent } from './absence-stats.component';

describe('AbsenceStatsComponent', () => {
  let component: AbsenceStatsComponent;
  let fixture: ComponentFixture<AbsenceStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbsenceStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsenceStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
