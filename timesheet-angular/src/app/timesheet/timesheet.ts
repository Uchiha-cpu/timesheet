import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { EmployeeService } from '../services/employee.service';
import { TimesheetEntryService } from '../services/timesheet-entry.service';
import { TimesheetEntry } from '../models/timesheet-entry.model';
import { Employee } from '../models/employee.model';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.html',
  styleUrls: ['./timesheet.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TimesheetComponent implements OnInit {
  entries: TimesheetEntry[] = [];
  filteredEntries: TimesheetEntry[] = [];
  monthlySummaryGrid: any = {};
  summaryDays: number[] = [];
  summaryMonthYear: string = '';
  wfhAlerts: any[] = [];

  isLoading: boolean = false;
  toast: { show: boolean; message: string; type: 'success' | 'error' } = { show: false, message: '', type: 'success' };

  showDeleteConfirmModal: boolean = false;
  entryToDelete: TimesheetEntry | null = null;

  newEntry: TimesheetEntry = { name: '', date: '', status: '' };
  editingEntry: TimesheetEntry | null = null;
  originalEntryToEdit: TimesheetEntry | null = null;

  filters: any = {
    month: '',
    status: '',
    name: ''
  };

  constructor(private employeeService: EmployeeService, private timesheetEntryService: TimesheetEntryService) {
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

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast.show = true;
    this.toast.message = message;
    this.toast.type = type;
    setTimeout(() => {
      this.toast.show = false;
    }, 3000); // Hide after 3 seconds
  }

  loadData(): void {
    this.entries = this.timesheetEntryService.getEntries();
    this.updateAll();
  }

  saveData(): void {
    // Data is saved within the TimesheetEntryService methods
  }

  addEntry(): void {
    if (this.newEntry.name && this.newEntry.date && this.newEntry.status) {
      this.isLoading = true;
      if (this.timesheetEntryService.addEntry(this.newEntry)) {
        this.newEntry = { name: '', date: '', status: '' };
        this.loadData(); // Reload data after adding
        this.showToast('Entry added successfully!', 'success');
      } else {
        this.showToast('Failed to add entry. It might already exist.', 'error');
      }
      this.isLoading = false;
    }
  }

  editEntry(entry: any): void {
    if (entry) {
      this.originalEntryToEdit = entry;
      this.editingEntry = { ...entry };
      // Ensure date is a YYYY-MM-DD string for the date input
      if (this.editingEntry) {
        this.editingEntry.date = entry.date;
      }
    } else {
      console.warn('Attempted to edit a null or undefined entry.');
      this.cancelEdit(); // Ensure modal is closed if invalid entry is passed
    }
  }

  updateEntry(): void {
    if (!this.editingEntry || !this.originalEntryToEdit) {
      console.error('Attempted to update without a valid editingEntry or originalEntryToEdit.');
      this.showToast('Error: Invalid entry for update.', 'error');
      return;
    }

    this.isLoading = true;
    if (this.timesheetEntryService.updateEntry(this.originalEntryToEdit, this.editingEntry)) {
      this.cancelEdit();
      this.loadData(); // Reload data after updating
      this.showToast('Entry updated successfully!', 'success');
    } else {
      this.showToast('Failed to update entry. It might already exist.', 'error');
    }
    this.isLoading = false;
  }

  cancelEdit(): void {
    this.editingEntry = null;
    this.originalEntryToEdit = null;
  }

  confirmDelete(): void {
    if (this.entryToDelete) {
      this.isLoading = true;
      this.timesheetEntryService.deleteEntry(this.entryToDelete);
      this.loadData();
      this.showToast('Entry deleted successfully!', 'success');
      this.isLoading = false;
    }
    this.showDeleteConfirmModal = false;
    this.entryToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirmModal = false;
    this.entryToDelete = null;
  }

  clearFilter(filterType: 'employee' | 'month' | 'status' | 'name'): void {
    this.filters[filterType] = '';
    this.updateAll();
  }

  deleteEntry(entryToDelete: TimesheetEntry): void {
    this.entryToDelete = entryToDelete;
    this.showDeleteConfirmModal = true;
  }

  updateAll(): void {
    this.entries = this.timesheetEntryService.getEntries();
    let filtered = this.entries;

    if (this.filters.status) {
      filtered = filtered.filter(entry => entry.status === this.filters.status);
    }

    if (this.filters.name) {
      const searchName = this.filters.name.toLowerCase();
      filtered = filtered.filter(entry => entry.name.toLowerCase().includes(searchName));
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

    // Get unique employees from the EmployeeService, considering deleted status
    const allActiveEmployees = this.employeeService.getEmployees().filter(emp => !emp.deletedMonth);
    

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
    this.isLoading = true;
    try {
      const dataToExport = this.timesheetEntryService.getEntries().map(entry => ({
        'Employee Name': entry.name,
        'Date': entry.date, // Already YYYY-MM-DD string
        'Status': entry.status
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

      XLSX.writeFile(wb, `timesheet_${new Date().toISOString().split('T')[0]}.xlsx`);
      this.showToast('Data exported to Excel successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.showToast('Failed to export data to Excel.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  importFromExcel(): void {
    document.getElementById('fileInput')?.click();
  }

  handleFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

          const importedEmployees: Employee[] = [];
          jsonData.forEach((row: any) => {
            if (row['Employee Name'] && row['Date'] && row['Status']) {
              const entryDate = new Date(row['Date']);
              const dateStr = entryDate.toISOString().split('T')[0];
              const startMonth = dateStr.substring(0, 7);

              importedEmployees.push({ name: row['Employee Name'], startMonth: startMonth });

              this.timesheetEntryService.addEntry({
                name: row['Employee Name'],
                date: dateStr,
                status: row['Status']
              });
            }
          });
          this.employeeService.importEmployees(importedEmployees);
          this.loadData();
          this.showToast('Data imported from Excel successfully!', 'success');
        } catch (error) {
          console.error('Error importing from Excel:', error);
          this.showToast('Failed to import data from Excel.', 'error');
        } finally {
          this.isLoading = false;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }
}