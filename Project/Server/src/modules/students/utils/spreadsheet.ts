import * as XLSX from "xlsx";

export const IMPORT_COLUMNS = ["rollNo", "name", "phone", "email", "branch_id", "course_id", "year", "semester", "gender"] as const;

export function buildImportTemplate(): Buffer {
  const exampleRow = ["R1001", "Jane Doe", "+15551234567", "jane.doe@example.com", "BE", "CS", 1, 1, "Female"];
  const sheet = XLSX.utils.aoa_to_sheet([IMPORT_COLUMNS as unknown as string[], exampleRow]);
  sheet["!cols"] = IMPORT_COLUMNS.map((c) => ({ wch: Math.max(c.length + 2, 14) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Students");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function parseImportFile(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}
