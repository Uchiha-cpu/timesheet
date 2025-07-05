import { Component } from '@angular/core';
import { TimesheetComponent } from './timesheet/timesheet';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [TimesheetComponent],
  styleUrl: './app.css'
})
export class AppComponent {
  protected title = 'timesheet-angular';
}
