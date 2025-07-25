# How to Use the Timesheet Tracker

This document provides instructions on how to use the Timesheet Tracker application.

## Getting Started

This project offers two ways to run the Timesheet Tracker application:

### 1. Single-File Application (timesheet_app.html)

This is a standalone HTML file that provides a monthly, editable, grid-based timesheet. It's simple to use and requires no setup.

**To run:**

1.  Locate the `timesheet_app.html` file in the project root.
2.  Open the file directly in your web browser (e.g., by double-clicking it).

This option is suitable if you need a quick and simple timesheet solution without any development environment setup.

### 2. Robust Angular Application (timesheet-angular)

This is a more feature-rich and extensible application built with Angular. It provides a robust foundation for adding more features and is recommended for development and customization.

**To run:**

1.  **Navigate to the Angular project directory:**
    ```bash
    cd timesheet-angular
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    (You only need to do this once, or if `package.json` changes.)
3.  **Start the development server:**
    ```bash
    npm start
    ```
    This will compile the application and open it in your default web browser, usually at `http://localhost:4200/`.

This option is ideal if you plan to extend the application, contribute to its development, or require a more scalable solution.

## Features of Single-File Application (timesheet_app.html)

### Monthly Summary View

The application now presents a single, Excel-like monthly grid. Each row represents an employee for the selected month.

### Adding a New Employee

1.  Enter the employee's name in the "Add New Employee" field. Names must be unique.
2.  Click the **Add Employee** button. The new employee will appear as a new row in the summary grid.
3.  **Enhanced Logic**: If an employee with the same name already exists (even if previously deleted or with a future start month), their `startMonth` will be updated to the current month, and they will be re-activated if necessary.

### Deleting an Employee

1.  Click the "🗑️" icon next to the employee's name in the summary grid.
2.  Confirm the deletion. This will remove the employee and all their associated timesheet data.

### Editing Timesheet Entries

Directly in the monthly summary grid, click on any day's cell for an employee to select a status from the dropdown:
*   **H - Work from Home**
*   **O - Office**
*   **L - Full Leave**
*   **L1 - Leave First Half**
*   **L2 - Leave Second Half**

Changes are saved automatically.

### Employee Name Display

Employee names are now displayed in a single-line input field. For longer names, the text will truncate with an ellipsis (`...`). To view the full name, simply hover your mouse over the employee's name.

### Filtering by Month

Use the "Filter by Month" input to select the month you want to view or edit. Employee names are automatically carried forward to the new month.
*   **Clear Filter**: Clearing the month input (e.g., by clicking the 'x' icon in some browsers) will reset the filter to the current month.

### Filtering by Name

Use the "Filter by Name" input to quickly find employees by their name. As you type, the list of employees will dynamically update to show only those whose names match your input.

### Filtering by Status

Below the monthly summary, you can now click on the colored status boxes (H, O, L, L1/L2) to filter the employee list. Clicking a status will show only employees who have that status for at least one day in the selected month. Clicking the same filter again will clear it.

### Color-Coded WFH and WFO Summaries

The timesheet now includes two summary columns:
*   **WFH Days**: Shows the total number of Work from Home days for each employee in the selected month. The count is color-coded:
    *   **Green:** 1-4 WFH days
    *   **Yellow:** 5-7 WFH days
    *   **Red:** 8 or more WFH days
*   **WFO Days**: Shows the total number of Work from Office days for each employee in the selected month.

### Resizable Employee Name Column

You can now resize the "Employee" name column by dragging the vertical line on its right edge, similar to how you would resize columns in Excel. The entire timesheet table will adjust its width accordingly.

### Day Name and Weekend Highlighting

The timesheet grid now displays the initial of the day of the week (M, T, W, T, F, S, S) below each date. Saturdays and Sundays are visually distinguished with a grey background to indicate non-working days. Employees can still make entries on these days if needed.

### Exporting to Excel

Click the **Export Excel** button to download the current month's timesheet as an Excel file.

### Importing from Excel

1.  Click the **Import Excel** button.
2.  Select an Excel file. The file should have "Employee Name", "Date", and "Status" columns.
3.  The data will be imported. New employees will be added, and their `startMonth` will be set to the earliest month found in the imported data, ensuring they only appear from that month onwards. Existing employees will have their `startMonth` updated if the imported data indicates an earlier start.

### Data Persistence

All data is saved in your browser's local storage, so it persists between sessions. It is recommended to export your data periodically as a backup.