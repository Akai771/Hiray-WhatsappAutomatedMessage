import ExcelJS from "exceljs";
import { supabaseAdmin } from "../../../config/supabase";

export const IMPORT_COLUMNS = ["rollNo", "name", "phone", "email", "branch_code", "course_code", "year", "semester", "gender"] as const;

export async function buildImportTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const COURSE_CODES = await supabaseAdmin.from("courses").select("code").then((res) => res.data?.map((c) => c.code) ?? ["MCA",]);
  const BRANCH_CODES = await supabaseAdmin.from("branches").select("code").then((res) => res.data?.map((c) => c.code) ?? ["HC",]);
  const GENDERS = ["Male", "Female", "Other"];

  // Main student sheet
  const sheet = workbook.addWorksheet("Students");

  // Header row
  sheet.addRow(IMPORT_COLUMNS);

  // Example row
  sheet.addRow([
    "R1001",
    "Jane Doe",
    "1234567890",
    "jane.doe@example.com",
    BRANCH_CODES[0],
    COURSE_CODES[0],
    1,
    1,
    "Female",
  ]);

  // Column widths
  sheet.columns = [
    { key: "rollNo", width: 14 },
    { key: "name", width: 20 },
    { key: "phone", width: 16 },
    { key: "email", width: 30 },
    { key: "branch_code", width: 16 },
    { key: "course_code", width: 16 },
    { key: "year", width: 12 },
    { key: "semester", width: 12 },
    { key: "gender", width: 14 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);

  headerRow.font = {
    bold: true,
  };

  const validationSheet = workbook.addWorksheet("ValidationData");

  validationSheet.getColumn(1).values = [
    "Branch Codes",
    ...BRANCH_CODES,
  ];

  validationSheet.getColumn(2).values = [
    "Course Codes",
    ...COURSE_CODES,
  ];

  validationSheet.getColumn(3).values = [
    "Genders",
    ...GENDERS,
  ];

  // Hide the validation sheet
  validationSheet.state = "hidden";

  // Apply validations to rows 2 - 1000
  for (let row = 2; row <= 1000; row++) {
    // Branch Code - column E
    sheet.getCell(row, 5).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [
        `ValidationData!$A$2:$A$${BRANCH_CODES.length + 1}`,
      ],
      showErrorMessage: true,
      errorTitle: "Invalid Branch Code",
      error: "Please select a branch code from the dropdown.",
    };

    // Course Code - column F
    sheet.getCell(row, 6).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [
        `ValidationData!$B$2:$B$${COURSE_CODES.length + 1}`,
      ],
      showErrorMessage: true,
      errorTitle: "Invalid Course Code",
      error: "Please select a course code from the dropdown.",
    };

    // Year - column G
    sheet.getCell(row, 7).dataValidation = {
      type: "whole",
      operator: "between",
      allowBlank: false,
      formulae: [1, 5],
      showErrorMessage: true,
      errorTitle: "Invalid Year",
      error: "Year must be between 1 and 5.",
    };

    // Semester - column H
    sheet.getCell(row, 8).dataValidation = {
      type: "whole",
      operator: "between",
      allowBlank: false,
      formulae: [1, 10],
      showErrorMessage: true,
      errorTitle: "Invalid Semester",
      error: "Semester must be between 1 and 10.",
    };

    // Gender - column I
    sheet.getCell(row, 9).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [
        `ValidationData!$C$2:$C$${GENDERS.length + 1}`,
      ],
      showErrorMessage: true,
      errorTitle: "Invalid Gender",
      error: "Please select Male, Female, or Other.",
    };
  }

  sheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}

export async function parseImportFile(buffer: Buffer): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? "").trim();
  });

  const rows: Record<string, unknown>[] = [];

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    if (row.cellCount === 0) continue;

    const record: Record<string, unknown> = {};
    let hasValue = false;

    headers.forEach((header, idx) => {
      if (!header) return;
      const value = row.getCell(idx + 1).value ?? "";
      if (value !== "") hasValue = true;
      record[header] = value;
    });

    if (!hasValue) continue;

    rows.push(record);
  }

  return rows;
}