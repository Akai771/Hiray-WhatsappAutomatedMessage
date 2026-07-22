import type { Branch, Course, FacultyMember, HistoryRow, Parent, Student } from "@/lib/types";

export function genBranches(): Branch[] {
  return [
    { id: "b1", name: "North Campus", code: "NC", address: "123 North Ave" },
    { id: "b2", name: "South Campus", code: "SC", address: "456 South Blvd" },
    { id: "b3", name: "City Campus", code: "CC", address: "789 City Rd" },
  ];
}

export function genCourses(): Course[] {
  return [
    { id: "c1", branchId: "b1", name: "Computer Science", code: "CS", totalYears: 4, semestersPerYear: 2 },
    { id: "c2", branchId: "b1", name: "Electronics Engineering", code: "EC", totalYears: 4, semestersPerYear: 2 },
    { id: "c3", branchId: "b2", name: "Business Administration", code: "BA", totalYears: 3, semestersPerYear: 2 },
    { id: "c4", branchId: "b2", name: "Commerce", code: "COM", totalYears: 3, semestersPerYear: 2 },
    { id: "c5", branchId: "b3", name: "Fine Arts", code: "FA", totalYears: 3, semestersPerYear: 2 },
    { id: "c6", branchId: "b3", name: "Biology", code: "BIO", totalYears: 4, semestersPerYear: 2 },
  ];
}

export function genStudents(): Student[] {
  const mk = (
    i: number,
    name: string,
    college: string,
    course: string,
    year: string,
    div: string,
    gender: string,
    status: Student["status"],
  ): Student => ({
    id: "s" + i,
    rollNo: "R" + (1000 + i),
    name,
    phone: "+1 555-01" + (10 + i),
    email: name.toLowerCase().replace(" ", ".") + "@campus.edu",
    college,
    course,
    year,
    division: div,
    gender,
    status,
  });
  return [
    mk(1, "Alex Johnson", "North Campus", "Computer Science", "1st Year", "A", "Male", "Active"),
    mk(2, "Sam Carter", "North Campus", "Computer Science", "2nd Year", "B", "Female", "Active"),
    mk(3, "Jordan Lee", "North Campus", "Electronics Engineering", "3rd Year", "A", "Male", "Active"),
    mk(4, "Taylor Brooks", "South Campus", "Business Administration", "1st Year", "C", "Female", "Active"),
    mk(5, "Morgan Diaz", "South Campus", "Commerce", "2nd Year", "A", "Male", "Dropped"),
    mk(6, "Casey Kim", "South Campus", "Business Administration", "4th Year", "B", "Female", "Graduated"),
    mk(7, "Riley Adams", "City Campus", "Fine Arts", "1st Year", "A", "Female", "Active"),
    mk(8, "Jamie Fox", "City Campus", "Biology", "3rd Year", "C", "Male", "Active"),
    mk(9, "Drew Ellis", "North Campus", "Electronics Engineering", "2nd Year", "B", "Male", "Active"),
    mk(10, "Reese Turner", "City Campus", "Biology", "4th Year", "A", "Female", "Graduated"),
    mk(11, "Quinn Parker", "South Campus", "Commerce", "1st Year", "A", "Male", "Active"),
    mk(12, "Avery Bennett", "North Campus", "Computer Science", "3rd Year", "C", "Female", "Active"),
  ];
}

export function genParents(): Parent[] {
  const mk = (
    i: number,
    name: string,
    phone: string,
    email: string,
    relation: Parent["relation"],
    linked: string,
    college: string,
    status: Parent["status"],
  ): Parent => ({ id: "p" + i, name, phone, email, relation, linkedStudent: linked, college, status });
  return [
    mk(1, "Robert Johnson", "+1 555-02201", "robert.johnson@mail.com", "Father", "Alex Johnson", "North Campus", "Active"),
    mk(2, "Linda Carter", "+1 555-02202", "linda.carter@mail.com", "Mother", "Sam Carter", "North Campus", "Active"),
    mk(3, "David Lee", "+1 555-02203", "david.lee@mail.com", "Father", "Jordan Lee", "North Campus", "Active"),
    mk(4, "Patricia Brooks", "+1 555-02204", "patricia.brooks@mail.com", "Mother", "Taylor Brooks", "South Campus", "Active"),
    mk(5, "Michael Diaz", "+1 555-02205", "michael.diaz@mail.com", "Father", "Morgan Diaz", "South Campus", "Active"),
    mk(6, "Nancy Kim", "+1 555-02206", "nancy.kim@mail.com", "Guardian", "Casey Kim", "South Campus", "Active"),
    mk(7, "James Adams", "+1 555-02207", "james.adams@mail.com", "Father", "Riley Adams", "City Campus", "Active"),
    mk(8, "Susan Fox", "+1 555-02208", "susan.fox@mail.com", "Mother", "Jamie Fox", "City Campus", "Active"),
    mk(9, "William Ellis", "+1 555-02209", "william.ellis@mail.com", "Father", "Drew Ellis", "North Campus", "Active"),
    mk(10, "Karen Turner", "+1 555-02210", "karen.turner@mail.com", "Mother", "Reese Turner", "City Campus", "Active"),
  ];
}

export function genFaculty(): FacultyMember[] {
  return [
    { id: "f1", name: "Dr. Emily Stone", email: "emily.stone@campus.edu", phone: "+1 555-03301", role: "Super Admin", department: "Administration", status: "Active", lastActive: "Today, 9:12 AM" },
    { id: "f2", name: "Prof. Daniel Cho", email: "daniel.cho@campus.edu", phone: "+1 555-03302", role: "Super Admin", department: "Administration", status: "Active", lastActive: "Yesterday, 4:40 PM" },
    { id: "f3", name: "Ms. Hannah Reyes", email: "hannah.reyes@campus.edu", phone: "+1 555-03303", role: "Faculty", department: "Computer Science", status: "Active", lastActive: "Today, 8:03 AM" },
    { id: "f4", name: "Mr. Victor Nunez", email: "victor.nunez@campus.edu", phone: "+1 555-03304", role: "Faculty", department: "Business Administration", status: "Active", lastActive: "2 days ago" },
    { id: "f5", name: "Dr. Grace Park", email: "grace.park@campus.edu", phone: "+1 555-03305", role: "Faculty", department: "Biology", status: "Inactive", lastActive: "3 weeks ago" },
    { id: "f6", name: "Mr. Owen Blake", email: "owen.blake@campus.edu", phone: "+1 555-03306", role: "Faculty", department: "Fine Arts", status: "Active", lastActive: "Today, 7:55 AM" },
  ];
}

export function genHistory(): HistoryRow[] {
  return [
    { id: "h1", date: "Jul 20, 2026", title: "Mid-Semester Exam Schedule", type: "Utility", audience: "Students, Parents", recipients: 842, status: "Sent", delivered: 830, read: 790, failed: 12 },
    { id: "h2", date: "Jul 18, 2026", title: "Campus Fest Registration Open", type: "Marketing", audience: "Students", recipients: 512, status: "Sent", delivered: 505, read: 410, failed: 7 },
    { id: "h3", date: "Jul 25, 2026", title: "Fee Payment Reminder", type: "Utility", audience: "Parents", recipients: 398, status: "Scheduled", delivered: 0, read: 0, failed: 0 },
    { id: "h4", date: "Jul 15, 2026", title: "Library Hours Update", type: "Utility", audience: "Students, Staff", recipients: 915, status: "Sent", delivered: 900, read: 812, failed: 15 },
    { id: "h5", date: "Jul 10, 2026", title: "Alumni Meetup Invitation", type: "Marketing", audience: "Parents", recipients: 300, status: "Failed", delivered: 120, read: 80, failed: 180 },
    { id: "h6", date: "Jul 8, 2026", title: "Orientation Week Kickoff", type: "Utility", audience: "Students, Parents, Staff", recipients: 1240, status: "Sent", delivered: 1220, read: 1050, failed: 20 },
  ];
}
