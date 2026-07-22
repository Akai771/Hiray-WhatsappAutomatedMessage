import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { genBranches, genCourses, genFaculty, genHistory, genParents, genStudents } from "@/lib/mock-data";
import { computeRecipientCount } from "@/lib/recipient-count";
import type {
  AttachmentType,
  Branch,
  Course,
  FacultyForm,
  FacultyMember,
  HistoryRow,
  MessageForm,
  Parent,
  ParentForm,
  Role,
  SettingsTab,
  Student,
  StudentForm,
  Tab,
} from "@/lib/types";

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 8);
}

function emptyStudentForm(): StudentForm {
  return { rollNo: "", name: "", phone: "", email: "", college: "", course: "", year: "", division: "", gender: "", status: "Active" };
}
function emptyParentForm(): ParentForm {
  return { name: "", phone: "", email: "", relation: "", linkedStudent: "", college: "" };
}
function emptyFacultyForm(): FacultyForm {
  return { name: "", email: "", phone: "", role: "Faculty", department: "" };
}
function emptyMsgForm(): MessageForm {
  return {
    notifType: "",
    title: "",
    message: "",
    attachments: { image: null, pdf: null, document: null, video: null },
    ctaLabel: "",
    ctaUrl: "",
    college: "all",
    course: "all",
    year: "all",
    semester: "all",
    division: "all",
    audience: { students: false, parents: false, staff: false },
    scheduleMode: "now",
    scheduleDate: "",
    scheduleTime: "",
  };
}

interface AppState {
  activeTab: Tab;
  role: Role;
  branches: Branch[];
  courses: Course[];
  divisions: string[];
  students: Student[];
  parents: Parent[];
  faculty: FacultyMember[];
  history: HistoryRow[];
  selectedStudents: string[];
  selectedParents: string[];
  studentSearch: string;
  studentFilters: { college: string; course: string; year: string; division: string; status: string };
  parentSearch: string;
  parentFilters: { college: string; relation: string };
  showAddStudent: boolean;
  editingStudentId: string | null;
  studentForm: StudentForm;
  showImportStudents: boolean;
  showAddParent: boolean;
  editingParentId: string | null;
  parentForm: ParentForm;
  showImportParents: boolean;
  showAddFaculty: boolean;
  facultyForm: FacultyForm;
  showPreview: boolean;
  settingsTab: SettingsTab;
  newBranch: { name: string; code: string; address: string };
  selectedBranchForCourses: string | null;
  newCourse: { name: string; code: string; totalYears: number };
  newDivision: string;
  historyFilter: string;
  historySearch: string;
  msgForm: MessageForm;
}

function initialState(): AppState {
  return {
    activeTab: "messages",
    role: "super_admin",
    branches: genBranches(),
    courses: genCourses(),
    divisions: ["A", "B", "C", "D"],
    students: genStudents(),
    parents: genParents(),
    faculty: genFaculty(),
    history: genHistory(),
    selectedStudents: [],
    selectedParents: [],
    studentSearch: "",
    studentFilters: { college: "all", course: "all", year: "all", division: "all", status: "all" },
    parentSearch: "",
    parentFilters: { college: "all", relation: "all" },
    showAddStudent: false,
    editingStudentId: null,
    studentForm: emptyStudentForm(),
    showImportStudents: false,
    showAddParent: false,
    editingParentId: null,
    parentForm: emptyParentForm(),
    showImportParents: false,
    showAddFaculty: false,
    facultyForm: emptyFacultyForm(),
    showPreview: false,
    settingsTab: "branches",
    newBranch: { name: "", code: "", address: "" },
    selectedBranchForCourses: null,
    newCourse: { name: "", code: "", totalYears: 4 },
    newDivision: "",
    historyFilter: "All",
    historySearch: "",
    msgForm: emptyMsgForm(),
  };
}

function useDashboardState() {
  const [state, setState] = useState<AppState>(initialState);

  const setTab = useCallback((t: Tab) => setState((s) => ({ ...s, activeTab: t })), []);
  const setRole = useCallback((r: Role) => setState((s) => ({ ...s, role: r })), []);

  const setMsgField = useCallback(
    <K extends keyof MessageForm>(key: K, val: MessageForm[K]) =>
      setState((s) => ({ ...s, msgForm: { ...s.msgForm, [key]: val } })),
    [],
  );
  const toggleAudience = useCallback(
    (key: keyof MessageForm["audience"]) =>
      setState((s) => ({ ...s, msgForm: { ...s.msgForm, audience: { ...s.msgForm.audience, [key]: !s.msgForm.audience[key] } } })),
    [],
  );
  const toggleAttachment = useCallback(
    (type: AttachmentType, filename: string) =>
      setState((s) => {
        const cur = s.msgForm.attachments[type];
        return { ...s, msgForm: { ...s.msgForm, attachments: { ...s.msgForm.attachments, [type]: cur ? null : { name: filename } } } };
      }),
    [],
  );
  const setScheduleMode = useCallback(
    (mode: MessageForm["scheduleMode"]) => setState((s) => ({ ...s, msgForm: { ...s.msgForm, scheduleMode: mode } })),
    [],
  );
  const resetMsgForm = useCallback(() => setState((s) => ({ ...s, msgForm: emptyMsgForm() })), []);
  const openPreview = useCallback(() => setState((s) => ({ ...s, showPreview: true })), []);
  const closePreview = useCallback(() => setState((s) => ({ ...s, showPreview: false })), []);

  const sendNotification = useCallback(() => {
    setState((s) => {
      const f = s.msgForm;
      if (!f.notifType || !f.title.trim() || !f.message.trim()) {
        toast.error("Please fill Notification Type, Title and Message.");
        return s;
      }
      if (!f.audience.students && !f.audience.parents && !f.audience.staff) {
        toast.error("Select at least one Target Audience.");
        return s;
      }
      if (f.scheduleMode === "schedule" && (!f.scheduleDate || !f.scheduleTime)) {
        toast.error("Set a schedule date and time.");
        return s;
      }
      const count = computeRecipientCount(s, f);
      const audienceLabels = [f.audience.students && "Students", f.audience.parents && "Parents", f.audience.staff && "Staff"]
        .filter(Boolean)
        .join(", ");
      const isSched = f.scheduleMode === "schedule";
      const newRow: HistoryRow = {
        id: uid("h"),
        date: isSched ? `${f.scheduleDate} ${f.scheduleTime}` : "Just now",
        title: f.title,
        type: f.notifType,
        audience: audienceLabels,
        recipients: count,
        status: isSched ? "Scheduled" : "Sent",
        delivered: isSched ? 0 : Math.round(count * 0.97),
        read: isSched ? 0 : Math.round(count * 0.8),
        failed: isSched ? 0 : Math.round(count * 0.03),
      };
      toast.success(
        isSched ? `Notification scheduled for ${f.scheduleDate} ${f.scheduleTime}` : `Notification sent to ${count.toLocaleString()} recipients.`,
      );
      return { ...s, history: [newRow, ...s.history], msgForm: emptyMsgForm() };
    });
  }, []);

  const saveDraft = useCallback(() => {
    setState((s) => {
      const f = s.msgForm;
      if (!f.title.trim()) {
        toast.error("Add a title before saving draft.");
        return s;
      }
      const newRow: HistoryRow = {
        id: uid("h"),
        date: "Just now",
        title: f.title,
        type: f.notifType || "—",
        audience: "—",
        recipients: 0,
        status: "Draft",
        delivered: 0,
        read: 0,
        failed: 0,
      };
      toast.success("Draft saved.");
      return { ...s, history: [newRow, ...s.history] };
    });
  }, []);

  const setStudentFilter = useCallback(
    (key: keyof AppState["studentFilters"], val: string) =>
      setState((s) => ({ ...s, studentFilters: { ...s.studentFilters, [key]: val } })),
    [],
  );
  const setStudentSearch = useCallback((v: string) => setState((s) => ({ ...s, studentSearch: v })), []);
  const toggleStudentSelect = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        selectedStudents: s.selectedStudents.includes(id) ? s.selectedStudents.filter((x) => x !== id) : [...s.selectedStudents, id],
      })),
    [],
  );
  const toggleSelectAllStudents = useCallback(
    (ids: string[]) =>
      setState((s) => {
        const allSel = ids.length > 0 && ids.every((id) => s.selectedStudents.includes(id));
        return { ...s, selectedStudents: allSel ? [] : ids };
      }),
    [],
  );
  const openAddStudent = useCallback(
    () => setState((s) => ({ ...s, showAddStudent: true, editingStudentId: null, studentForm: emptyStudentForm() })),
    [],
  );
  const openEditStudent = useCallback(
    (row: Student) => setState((s) => ({ ...s, showAddStudent: true, editingStudentId: row.id, studentForm: { ...row } })),
    [],
  );
  const closeAddStudent = useCallback(() => setState((s) => ({ ...s, showAddStudent: false })), []);
  const setStudentFormField = useCallback(
    <K extends keyof StudentForm>(key: K, val: StudentForm[K]) =>
      setState((s) => ({ ...s, studentForm: { ...s.studentForm, [key]: val } })),
    [],
  );
  const saveStudent = useCallback(() => {
    setState((s) => {
      const f = s.studentForm;
      if (!f.name.trim() || !f.rollNo.trim()) {
        toast.error("Roll No and Name are required.");
        return s;
      }
      if (s.editingStudentId) {
        toast.success("Student updated.");
        return {
          ...s,
          students: s.students.map((st) => (st.id === s.editingStudentId ? { ...f, id: st.id } : st)),
          showAddStudent: false,
        };
      }
      toast.success("Student added.");
      return { ...s, students: [{ ...f, id: uid("s") }, ...s.students], showAddStudent: false };
    });
  }, []);
  const deleteStudent = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        students: s.students.filter((x) => x.id !== id),
        selectedStudents: s.selectedStudents.filter((x) => x !== id),
      })),
    [],
  );
  const bulkDeleteStudents = useCallback(() => {
    setState((s) => ({ ...s, students: s.students.filter((x) => !s.selectedStudents.includes(x.id)), selectedStudents: [] }));
    toast.success("Selected students removed.");
  }, []);
  const messageSelectedStudents = useCallback(() => {
    setState((s) => ({ ...s, activeTab: "messages", msgForm: { ...s.msgForm, audience: { ...s.msgForm.audience, students: true } } }));
    toast.success("Composing message to selected students.");
  }, []);
  const openImportStudents = useCallback(() => setState((s) => ({ ...s, showImportStudents: true })), []);
  const closeImportStudents = useCallback(() => setState((s) => ({ ...s, showImportStudents: false })), []);
  const importStudents = useCallback(() => {
    const extra: Student[] = [
      { id: uid("s"), rollNo: "R2001", name: "Imported Student A", phone: "+1 555-09901", email: "imported.a@campus.edu", college: "North Campus", course: "Computer Science", year: "1st Year", division: "A", gender: "Female", status: "Active" },
      { id: uid("s"), rollNo: "R2002", name: "Imported Student B", phone: "+1 555-09902", email: "imported.b@campus.edu", college: "South Campus", course: "Commerce", year: "2nd Year", division: "B", gender: "Male", status: "Active" },
    ];
    setState((s) => ({ ...s, students: [...extra, ...s.students], showImportStudents: false }));
    toast.success("2 students imported from Excel.");
  }, []);

  const setParentFilter = useCallback(
    (key: keyof AppState["parentFilters"], val: string) => setState((s) => ({ ...s, parentFilters: { ...s.parentFilters, [key]: val } })),
    [],
  );
  const setParentSearch = useCallback((v: string) => setState((s) => ({ ...s, parentSearch: v })), []);
  const toggleParentSelect = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        selectedParents: s.selectedParents.includes(id) ? s.selectedParents.filter((x) => x !== id) : [...s.selectedParents, id],
      })),
    [],
  );
  const toggleSelectAllParents = useCallback(
    (ids: string[]) =>
      setState((s) => {
        const allSel = ids.length > 0 && ids.every((id) => s.selectedParents.includes(id));
        return { ...s, selectedParents: allSel ? [] : ids };
      }),
    [],
  );
  const openAddParent = useCallback(
    () => setState((s) => ({ ...s, showAddParent: true, editingParentId: null, parentForm: emptyParentForm() })),
    [],
  );
  const openEditParent = useCallback(
    (row: Parent) => setState((s) => ({ ...s, showAddParent: true, editingParentId: row.id, parentForm: { ...row } })),
    [],
  );
  const closeAddParent = useCallback(() => setState((s) => ({ ...s, showAddParent: false })), []);
  const setParentFormField = useCallback(
    <K extends keyof ParentForm>(key: K, val: ParentForm[K]) => setState((s) => ({ ...s, parentForm: { ...s.parentForm, [key]: val } })),
    [],
  );
  const saveParent = useCallback(() => {
    setState((s) => {
      const f = s.parentForm;
      if (!f.name.trim()) {
        toast.error("Name is required.");
        return s;
      }
      if (s.editingParentId) {
        toast.success("Parent updated.");
        return {
          ...s,
          parents: s.parents.map((p) => (p.id === s.editingParentId ? { ...f, id: p.id, status: p.status } : p)),
          showAddParent: false,
        };
      }
      toast.success("Parent added.");
      return { ...s, parents: [{ ...f, id: uid("p"), status: "Active" }, ...s.parents], showAddParent: false };
    });
  }, []);
  const deleteParent = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, parents: s.parents.filter((x) => x.id !== id), selectedParents: s.selectedParents.filter((x) => x !== id) })),
    [],
  );
  const bulkDeleteParents = useCallback(() => {
    setState((s) => ({ ...s, parents: s.parents.filter((x) => !s.selectedParents.includes(x.id)), selectedParents: [] }));
    toast.success("Selected parents removed.");
  }, []);
  const messageSelectedParents = useCallback(() => {
    setState((s) => ({ ...s, activeTab: "messages", msgForm: { ...s.msgForm, audience: { ...s.msgForm.audience, parents: true } } }));
    toast.success("Composing message to selected parents.");
  }, []);
  const openImportParents = useCallback(() => setState((s) => ({ ...s, showImportParents: true })), []);
  const closeImportParents = useCallback(() => setState((s) => ({ ...s, showImportParents: false })), []);
  const importParents = useCallback(() => {
    const extra: Parent[] = [
      { id: uid("p"), name: "Imported Parent A", phone: "+1 555-08801", email: "imported.parentA@mail.com", relation: "Father", linkedStudent: "Alex Johnson", college: "North Campus", status: "Active" },
      { id: uid("p"), name: "Imported Parent B", phone: "+1 555-08802", email: "imported.parentB@mail.com", relation: "Mother", linkedStudent: "Taylor Brooks", college: "South Campus", status: "Active" },
    ];
    setState((s) => ({ ...s, parents: [...extra, ...s.parents], showImportParents: false }));
    toast.success("2 parents imported from Excel.");
  }, []);

  const openAddFaculty = useCallback(() => {
    setState((s) => {
      if (s.role !== "super_admin") {
        toast.error("Only Super Admins can add faculty.");
        return s;
      }
      return { ...s, showAddFaculty: true, facultyForm: emptyFacultyForm() };
    });
  }, []);
  const closeAddFaculty = useCallback(() => setState((s) => ({ ...s, showAddFaculty: false })), []);
  const setFacultyFormField = useCallback(
    <K extends keyof FacultyForm>(key: K, val: FacultyForm[K]) => setState((s) => ({ ...s, facultyForm: { ...s.facultyForm, [key]: val } })),
    [],
  );
  const saveFaculty = useCallback(() => {
    setState((s) => {
      const f = s.facultyForm;
      if (!f.name.trim() || !f.email.trim()) {
        toast.error("Name and Email are required.");
        return s;
      }
      toast.success("Faculty account created.");
      return { ...s, faculty: [{ ...f, id: uid("f"), status: "Active", lastActive: "Just now" }, ...s.faculty], showAddFaculty: false };
    });
  }, []);
  const deleteFaculty = useCallback((id: string) => {
    setState((s) => {
      if (s.role !== "super_admin") {
        toast.error("Only Super Admins can remove faculty.");
        return s;
      }
      return { ...s, faculty: s.faculty.filter((x) => x.id !== id) };
    });
  }, []);

  const setSettingsTab = useCallback((t: SettingsTab) => setState((s) => ({ ...s, settingsTab: t })), []);
  const setNewBranchField = useCallback(
    (key: keyof AppState["newBranch"], val: string) => setState((s) => ({ ...s, newBranch: { ...s.newBranch, [key]: val } })),
    [],
  );
  const addBranch = useCallback(() => {
    setState((s) => {
      if (!s.newBranch.name.trim()) {
        toast.error("Branch name required.");
        return s;
      }
      toast.success("Branch added.");
      return { ...s, branches: [...s.branches, { ...s.newBranch, id: uid("b") }], newBranch: { name: "", code: "", address: "" } };
    });
  }, []);
  const deleteBranch = useCallback((id: string) => setState((s) => ({ ...s, branches: s.branches.filter((x) => x.id !== id) })), []);
  const setSelectedBranchForCourses = useCallback((id: string) => setState((s) => ({ ...s, selectedBranchForCourses: id })), []);
  const setNewCourseField = useCallback(
    (key: keyof AppState["newCourse"], val: string | number) => setState((s) => ({ ...s, newCourse: { ...s.newCourse, [key]: val } })),
    [],
  );
  const addCourse = useCallback(() => {
    setState((s) => {
      const branchId = s.selectedBranchForCourses || (s.branches[0] && s.branches[0].id);
      const c = s.newCourse;
      if (!c.name.trim()) {
        toast.error("Course name required.");
        return s;
      }
      toast.success("Course added.");
      return {
        ...s,
        courses: [...s.courses, { ...c, id: uid("c"), branchId, totalYears: Number(c.totalYears) || 4, semestersPerYear: 2 }],
        newCourse: { name: "", code: "", totalYears: 4 },
      };
    });
  }, []);
  const deleteCourse = useCallback((id: string) => setState((s) => ({ ...s, courses: s.courses.filter((x) => x.id !== id) })), []);
  const updateCourseYears = useCallback(
    (id: string, val: string) => setState((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, totalYears: Number(val) || 1 } : c)) })),
    [],
  );
  const updateCourseSemesters = useCallback(
    (id: string, val: string) =>
      setState((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, semestersPerYear: Number(val) || 1 } : c)) })),
    [],
  );
  const setNewDivision = useCallback((v: string) => setState((s) => ({ ...s, newDivision: v })), []);
  const addDivision = useCallback(() => {
    setState((s) => {
      const v = s.newDivision.trim().toUpperCase();
      if (!v) return s;
      if (s.divisions.includes(v)) {
        toast.error("Division already exists.");
        return s;
      }
      return { ...s, divisions: [...s.divisions, v], newDivision: "" };
    });
  }, []);
  const deleteDivision = useCallback((d: string) => setState((s) => ({ ...s, divisions: s.divisions.filter((x) => x !== d) })), []);

  const setHistoryFilter = useCallback((v: string) => setState((s) => ({ ...s, historyFilter: v })), []);
  const setHistorySearch = useCallback((v: string) => setState((s) => ({ ...s, historySearch: v })), []);

  const actions = useMemo(
    () => ({
      setTab,
      setRole,
      setMsgField,
      toggleAudience,
      toggleAttachment,
      setScheduleMode,
      resetMsgForm,
      openPreview,
      closePreview,
      sendNotification,
      saveDraft,
      setStudentFilter,
      setStudentSearch,
      toggleStudentSelect,
      toggleSelectAllStudents,
      openAddStudent,
      openEditStudent,
      closeAddStudent,
      setStudentFormField,
      saveStudent,
      deleteStudent,
      bulkDeleteStudents,
      messageSelectedStudents,
      openImportStudents,
      closeImportStudents,
      importStudents,
      setParentFilter,
      setParentSearch,
      toggleParentSelect,
      toggleSelectAllParents,
      openAddParent,
      openEditParent,
      closeAddParent,
      setParentFormField,
      saveParent,
      deleteParent,
      bulkDeleteParents,
      messageSelectedParents,
      openImportParents,
      closeImportParents,
      importParents,
      openAddFaculty,
      closeAddFaculty,
      setFacultyFormField,
      saveFaculty,
      deleteFaculty,
      setSettingsTab,
      setNewBranchField,
      addBranch,
      deleteBranch,
      setSelectedBranchForCourses,
      setNewCourseField,
      addCourse,
      deleteCourse,
      updateCourseYears,
      updateCourseSemesters,
      setNewDivision,
      addDivision,
      deleteDivision,
      setHistoryFilter,
      setHistorySearch,
    }),
    [
      setTab, setRole, setMsgField, toggleAudience, toggleAttachment, setScheduleMode, resetMsgForm, openPreview, closePreview,
      sendNotification, saveDraft, setStudentFilter, setStudentSearch, toggleStudentSelect, toggleSelectAllStudents, openAddStudent,
      openEditStudent, closeAddStudent, setStudentFormField, saveStudent, deleteStudent, bulkDeleteStudents, messageSelectedStudents,
      openImportStudents, closeImportStudents, importStudents, setParentFilter, setParentSearch, toggleParentSelect,
      toggleSelectAllParents, openAddParent, openEditParent, closeAddParent, setParentFormField, saveParent, deleteParent,
      bulkDeleteParents, messageSelectedParents, openImportParents, closeImportParents, importParents, openAddFaculty,
      closeAddFaculty, setFacultyFormField, saveFaculty, deleteFaculty, setSettingsTab, setNewBranchField, addBranch, deleteBranch,
      setSelectedBranchForCourses, setNewCourseField, addCourse, deleteCourse, updateCourseYears, updateCourseSemesters,
      setNewDivision, addDivision, deleteDivision, setHistoryFilter, setHistorySearch,
    ],
  );

  return { state, actions };
}

type DashboardContextValue = ReturnType<typeof useDashboardState>;

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useDashboardState();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
