import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [];
  private readonly LOCAL_STORAGE_KEY = 'timesheet_employees';

  constructor() {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    const savedEmployees = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (savedEmployees) {
      this.employees = JSON.parse(savedEmployees);
    }
  }

  private saveEmployees(): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.employees));
  }

  getEmployees(): Employee[] {
    return [...this.employees]; // Return a copy to prevent direct modification
  }

  addEmployee(name: string, currentMonth: string): boolean {
    const newName = name.trim();
    const existingEmployee = this.employees.find(emp => emp.name === newName);

    if (existingEmployee) {
      // Employee exists, update their status to be active for the current month
      let message = '';
      if (existingEmployee.deletedMonth) {
        delete existingEmployee.deletedMonth;
        message += `Employee ${newName} has been re-added.`;
      }
      if (!existingEmployee.startMonth || currentMonth < existingEmployee.startMonth) {
        existingEmployee.startMonth = currentMonth;
        message += (message ? ' Also, ' : '') + `their start month has been updated to ${currentMonth}.`;
      }
      if (!message) {
        alert(`Employee name "${newName}" already exists and is active for this month.`);
        return false;
      } else {
        alert(message);
      }
    } else {
      // Add new employee with a start month
      this.employees.push({ name: newName, startMonth: currentMonth });
    }
    this.saveEmployees();
    return true;
  }

  deleteEmployee(name: string, currentMonth: string): void {
    const employee = this.employees.find(emp => emp.name === name);
    if (employee) {
      employee.deletedMonth = currentMonth;
      this.saveEmployees();
    }
  }

  updateEmployeeName(oldName: string, newName: string): boolean {
    const employeeToUpdate = this.employees.find(emp => emp.name === oldName);
    if (!employeeToUpdate) {
      return false; // Employee not found
    }

    const isDuplicate = this.employees.some(emp => emp.name === newName && emp !== employeeToUpdate);
    if (isDuplicate) {
      alert(`Employee name "${newName}" already exists. Please choose a unique name.`);
      return false;
    }

    employeeToUpdate.name = newName;
    this.saveEmployees();
    return true;
  }

  // Method to update employees after Excel import
  importEmployees(importedEmployees: Employee[]): void {
    importedEmployees.forEach(importedEmp => {
      const existingEmployee = this.employees.find(emp => emp.name === importedEmp.name);
      if (existingEmployee) {
        // Update startMonth if the imported one is earlier
        if (!existingEmployee.startMonth || importedEmp.startMonth < existingEmployee.startMonth) {
          existingEmployee.startMonth = importedEmp.startMonth;
        }
        // If employee was deleted, undelete them
        if (existingEmployee.deletedMonth) {
          delete existingEmployee.deletedMonth;
        }
      } else {
        this.employees.push(importedEmp);
      }
    });
    this.saveEmployees();
  }
}
