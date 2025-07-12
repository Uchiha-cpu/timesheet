import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetComponent } from './timesheet';

describe('Timesheet', () => {
  let component: TimesheetComponent;
  let fixture: ComponentFixture<TimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
