import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceTabsComponent } from './absence-tabs.component';

describe('AbsenceTabsComponent', () => {
  let component: AbsenceTabsComponent;
  let fixture: ComponentFixture<AbsenceTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbsenceTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsenceTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
