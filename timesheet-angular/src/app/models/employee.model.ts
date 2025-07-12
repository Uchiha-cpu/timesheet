export interface Employee {
  name: string;
  startMonth: string; // YYYY-MM format
  deletedMonth?: string; // YYYY-MM format, if deleted
}
