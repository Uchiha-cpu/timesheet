import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { EmployeeService } from './app/services/employee.service';
import { TimesheetEntryService } from './app/services/timesheet-entry.service';

bootstrapApplication(AppComponent, {
  providers: [EmployeeService, TimesheetEntryService]
}).catch(err => console.error(err));
