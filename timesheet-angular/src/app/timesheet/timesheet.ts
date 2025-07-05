import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.html',
  styleUrls: ['./timesheet.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TimesheetComponent implements OnInit {
  entries: any[] = [];
  filteredEntries: any[] = [];
  uniqueEmployees: string[] = [];
  monthlySummaryGrid: any = {};
  summaryDays: number[] = [];
  summaryMonthYear: string = '';
  wfhAlerts: any[] = [];

  newEntry: any = {};
  editingEntry: any = null;
  originalEntryToEdit: any = null;

  filters: any = {
    employee: '',
    month: '',
    status: ''
  };

  constructor() {
    this.editingEntry = null; // Ensure it's null on construction
  }

  ngOnInit(): void {
    this.loadData();
    this.editingEntry = null; // Ensure it's null on init
    console.log('editingEntry after loadData and explicit nulling:', this.editingEntry);
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj).sort() : [];
  }

  loadData(): void {
    const savedData = localStorage.getItem('timesheetData');
    if (savedData) {
      this.entries = JSON.parse(savedData);
      this.entries.forEach(entry => {
        // Ensure date is always a YYYY-MM-DD string for consistency
        if (typeof entry.date === 'string') {
          // If it's a full ISO string (e.g., "2025-07-04T00:00:00.000Z"), extract YYYY-MM-DD
          if (entry.date.includes('T')) {
            entry.date = entry.date.split('T')[0];
          }
          // If it's already YYYY-MM-DD, leave it as is
        } else if (entry.date instanceof Date) {
          // If it's a Date object (shouldn't happen if saved as string, but for safety)
          entry.date = entry.date.toISOString().split('T')[0];
        }
      });
    }
    this.updateAll();
  }

  saveData(): void {
    localStorage.setItem('timesheetData', JSON.stringify(this.entries));
  }

  addEntry(): void {
    if (this.newEntry.name && this.newEntry.date && this.newEntry.status) {
      const newEntryDateString = this.newEntry.date; // YYYY-MM-DD string from input

      const isDuplicate = this.entries.some(entry => {
        const existingDateString = (entry.date instanceof Date) ? entry.date.toISOString().split('T')[0] : entry.date;
        return entry.name === this.newEntry.name &&
               existingDateString === newEntryDateString;
      });

      if (isDuplicate) {
        alert('Error: An entry for ' + this.newEntry.name + ' on ' + newEntryDateString + ' already exists.');
        return;
      }

      this.entries.push({
        name: this.newEntry.name,
        date: newEntryDateString, // Store as YYYY-MM-DD string
        status: this.newEntry.status
      });
      this.saveData();
      this.newEntry = {};
      this.updateAll();
    }
  }

  editEntry(entry: any): void {
    if (entry) {
      this.originalEntryToEdit = entry;
      this.editingEntry = { ...entry };
      // Ensure date is a YYYY-MM-DD string for the date input
      this.editingEntry.date = (entry.date instanceof Date) ? entry.date.toISOString().split('T')[0] : entry.date;
    } else {
      console.warn('Attempted to edit a null or undefined entry.');
      this.cancelEdit(); // Ensure modal is closed if invalid entry is passed
    }
  }

  updateEntry(): void {
    if (!this.editingEntry || !this.originalEntryToEdit) {
      console.error('Attempted to update without a valid editingEntry or originalEntryToEdit.');
      return;
    }

    // Basic validation for required fields
    if (!this.editingEntry.name || !this.editingEntry.date || !this.editingEntry.status) {
      alert('Error: All fields (Name, Date, Status) are required for update.');
      return;
    }

    const updatedEntryDateString = this.editingEntry.date; // YYYY-MM-DD string from input

    // Check for duplicate entries, excluding the original entry being edited
    const isDuplicate = this.entries.some(entry => {
      const existingDateString = (entry.date instanceof Date) ? entry.date.toISOString().split('T')[0] : entry.date;
      return entry !== this.originalEntryToEdit && // Exclude the original entry
             entry.name === this.editingEntry.name &&
             existingDateString === updatedEntryDateString;
    });

    if (isDuplicate) {
      alert('Error: An entry for ' + this.editingEntry.name + ' on ' + updatedEntryDateString + ' already exists.');
      return;
    }

    // Update the original entry with the edited values
    Object.assign(this.originalEntryToEdit, {
      name: this.editingEntry.name,
      date: updatedEntryDateString, // Store as YYYY-MM-DD string
      status: this.editingEntry.status
    });

    this.saveData();
    this.cancelEdit(); // Close modal and reset editing state
    this.updateAll();
  }

  cancelEdit(): void {
    this.editingEntry = null;
    this.originalEntryToEdit = null;
  }

  deleteEntry(entryToDelete: any): void {
    if (confirm('Are you sure you want to delete this entry?')) {
      const index = this.entries.indexOf(entryToDelete);
      if (index > -1) {
        this.entries.splice(index, 1);
        this.saveData();
        this.updateAll();
      }
    }
  }

  updateAll(): void {
    let filtered = this.entries;
    if (this.filters.employee) {
      filtered = filtered.filter(entry => entry.name === this.filters.employee);
    }
    if (this.filters.status) {
      filtered = filtered.filter(entry => entry.status === this.filters.status);
    }

    let filterYear: number | undefined, filterMonth: number | undefined;
    if (this.filters.month) {
      const [year, month] = this.filters.month.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month)) {
        filterYear = year;
        filterMonth = month - 1; // Month is 0-indexed in JavaScript Date
      }
    }

    let entriesForTable = filtered;
    if (filterYear !== undefined && filterMonth !== undefined) {
      const filterMonthString = (filterMonth + 1).toString().padStart(2, '0'); // Convert 0-indexed month to 2-digit string
      const filterYearMonth = `${filterYear}-${filterMonthString}`;

      entriesForTable = entriesForTable.filter(entry => {
        // entry.date is already a YYYY-MM-DD string
        return entry.date.startsWith(filterYearMonth);
      });
    }
    this.filteredEntries = entriesForTable.sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });

    const allEmployees = this.entries.map(entry => entry.name);
    this.uniqueEmployees = [...new Set(allEmployees)].sort();

    let summaryYear: number, summaryMonth: number;
    if (filterYear !== undefined && filterMonth !== undefined) {
      summaryYear = filterYear;
      summaryMonth = filterMonth;
    } else {
      const today = new Date();
      summaryYear = today.getFullYear();
      summaryMonth = today.getMonth();
    }

    const daysInMonth = new Date(summaryYear, summaryMonth + 1, 0).getDate();
    this.summaryDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    this.summaryMonthYear = new Date(summaryYear, summaryMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const summaryGrid: any = {};
    const wfhAlerts: any[] = [];

    const entriesForSummary = filtered.filter(entry => {
      const entryDateString = entry.date; // YYYY-MM-DD string
      const summaryMonthString = (summaryMonth + 1).toString().padStart(2, '0');
      const summaryYearMonth = `${summaryYear}-${summaryMonthString}`;
      return entryDateString.startsWith(summaryYearMonth);
    });

    const summaryEmployees = [...new Set(entriesForSummary.map(e => e.name))].sort();

    summaryEmployees.forEach(name => {
      summaryGrid[name] = {};
    });

    let wfhCounts: any = {};

    entriesForSummary.forEach(entry => {
      const day = parseInt(entry.date.split('-')[2], 10);
      summaryGrid[entry.name][day] = entry.status;

      if (entry.status === 'H') {
        if (!wfhCounts[entry.name]) wfhCounts[entry.name] = 0;
        wfhCounts[entry.name]++;
      }
    });

    for (const [name, count] of Object.entries(wfhCounts)) {
      if ((count as number) > 8) {
        wfhAlerts.push({
          name: name,
          count: count,
          month: this.summaryMonthYear
        });
      }
    }

    this.monthlySummaryGrid = summaryGrid;
    this.wfhAlerts = wfhAlerts;
  }

  exportToExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.entries.map(entry => ({
      'Employee Name': entry.name,
      'Date': entry.date.toLocaleDateString(),
      'Status': entry.status
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

    XLSX.writeFile(wb, `timesheet_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  importFromExcel(): void {
    document.getElementById('fileInput')?.click();
  }

  handleFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        jsonData.forEach(row => {
          if (row['Employee Name'] && row['Date'] && row['Status']) {
            this.entries.push({
              name: row['Employee Name'],
              date: new Date(row['Date']).toISOString().split('T')[0], // Convert to YYYY-MM-DD string
              status: row['Status']
            });
          }
        });

        this.saveData();
        this.updateAll();
      };
      reader.readAsArrayBuffer(file);
    }
  }
}