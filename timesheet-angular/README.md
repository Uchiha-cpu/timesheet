# TimesheetAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Robust Angular Application (timesheet-angular)

This is a more feature-rich and extensible application built with Angular. It provides a robust foundation for adding more features and is recommended for development and customization.

### To run:

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

### Features

#### Adding a New Timesheet Entry

*   **Employee Name**: Enter the name of the employee.
*   **Date**: Select the date for the entry.
*   **Status**: Choose the employee's status from the dropdown menu:
    *   H - Work from Home
    *   O - Office
    *   L - Full Leave
    *   L1 - Leave First Half
    *   L2 - Leave Second Half
*   Click the **Add Entry** button to add the new record to the timesheet.

#### Viewing Timesheet Entries

All timesheet entries are displayed in a table at the bottom of the page.

#### Editing an Entry

1.  Locate the entry you want to edit in the timesheet table.
2.  Click the **Edit** button in the "Actions" column for that entry.
3.  An "Edit Entry" window will appear.
4.  Make the necessary changes to the employee's name, date, or status.
5.  Click the **Update** button to save the changes.

#### Deleting an Entry

1.  Locate the entry you want to delete in the timesheet table.
2.  Click the **Delete** button in the "Actions" column for that entry.
3.  A confirmation dialog will appear. Click **OK** to permanently delete the entry.

#### Filtering Entries

You can filter the timesheet entries using the following filters:

*   **Filter by Employee**: Select an employee's name from the dropdown to view only their entries.
*   **Filter by Month**: Choose a month to see all entries for that specific month.
*   **Filter by Status**: Select a status to view all entries with that status.

#### Monthly Summary

The "Monthly Summary" section provides a quick overview of each employee's work status for the current month, including the number of days they have worked from home, been in the office, or taken leave.

#### Work from Home (WFH) Alerts

The application will display an alert if an employee has exceeded the maximum limit of 8 Work from Home days in the current month.

#### Exporting to Excel

Click the **Export Excel** button to download the entire timesheet as an Excel file. The file will be named `timesheet_YYYY-MM-DD.xlsx`.

#### Importing from Excel

1.  Click the **Import Excel** button.
2.  Select an Excel file from your computer. The file should have the following columns: "Employee Name", "Date", and "Status".
3.  The data from the Excel file will be added to the timesheet.

#### Data Persistence

The application automatically saves all timesheet data in your browser's local storage. This means that your data will be available even if you close the browser or restart your computer. But it won't be available if the cache is cleared or if used in a different browser, so it's recommended to Export after each use and Import the excel again before using it.