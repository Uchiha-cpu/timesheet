import { Injectable } from '@angular/core';
import { TimesheetEntry } from '../models/timesheet-entry.model';

@Injectable({
  providedIn: 'root'
})
export class TimesheetEntryService {
  private entries: TimesheetEntry[] = [];
  private readonly LOCAL_STORAGE_KEY = 'timesheetData';

  constructor() {
    this.loadEntries();
  }

  private loadEntries(): void {
    const savedData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (savedData) {
      this.entries = JSON.parse(savedData);
      // Ensure date is always a YYYY-MM-DD string for consistency
      this.entries.forEach(entry => {
        if (typeof entry.date === 'string') {
          if (entry.date.includes('T')) {
            entry.date = entry.date.split('T')[0];
          }
        } else {
          // If for some reason it's not a string, convert it to a string
          entry.date = String(entry.date);
        }
      });
    }
  }

  private saveEntries(): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.entries));
  }

  getEntries(): TimesheetEntry[] {
    return [...this.entries];
  }

  addEntry(entry: TimesheetEntry): boolean {
    const newEntryDateString = entry.date; // YYYY-MM-DD string from input

    const isDuplicate = this.entries.some(e =>
      e.name === entry.name && e.date === newEntryDateString
    );

    if (isDuplicate) {
      alert('Error: An entry for ' + entry.name + ' on ' + newEntryDateString + ' already exists.');
      return false;
    }

    this.entries.push(entry);
    this.saveEntries();
    return true;
  }

  updateEntry(originalEntry: TimesheetEntry, updatedEntry: TimesheetEntry): boolean {
    // Basic validation for required fields
    if (!updatedEntry.name || !updatedEntry.date || !updatedEntry.status) {
      alert('Error: All fields (Name, Date, Status) are required for update.');
      return false;
    }

    const updatedEntryDateString = updatedEntry.date; // YYYY-MM-DD string from input

    // Check for duplicate entries, excluding the original entry being edited
    const isDuplicate = this.entries.some(e =>
      e !== originalEntry && e.name === updatedEntry.name && e.date === updatedEntryDateString
    );

    if (isDuplicate) {
      alert('Error: An entry for ' + updatedEntry.name + ' on ' + updatedEntryDateString + ' already exists.');
      return false;
    }

    Object.assign(originalEntry, updatedEntry);
    this.saveEntries();
    return true;
  }

  deleteEntry(entryToDelete: TimesheetEntry): void {
    const index = this.entries.indexOf(entryToDelete);
    if (index > -1) {
      this.entries.splice(index, 1);
      this.saveEntries();
    }
  }

  importEntries(importedEntries: TimesheetEntry[]): void {
    importedEntries.forEach(importedEntry => {
      const isDuplicate = this.entries.some(e =>
        e.name === importedEntry.name && e.date === importedEntry.date
      );
      if (!isDuplicate) {
        this.entries.push(importedEntry);
      }
    });
    this.saveEntries();
  }
}
