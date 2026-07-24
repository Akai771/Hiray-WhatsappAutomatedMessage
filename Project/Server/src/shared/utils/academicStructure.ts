export interface Semester {
  year: number;
  semester: number;
}

/**
 * Years/Semesters are never stored — server.md requires them derived from
 * a course's totalYears/semestersPerYear on read.
 */
export function generateSemesters(totalYears: number, semestersPerYear: number): Semester[] {
  const semesters: Semester[] = [];
  let semesterCounter = 0;

  for (let year = 1; year <= totalYears; year++) {
    for (let s = 1; s <= semestersPerYear; s++) {
      semesterCounter++;
      semesters.push({ year, semester: semesterCounter });
    }
  }

  return semesters;
}
