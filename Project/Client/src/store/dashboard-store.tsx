import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  branchService,
  courseService,
  studentsService,
  parentsService,
  facultyService,
  templateService,
  notificationService,
  uploadService,
  ApiClientError,
} from "@/services";
import type {
  ApiFaculty,
  ApiNotificationTemplate,
  ApiParent,
  ApiStudent,
  EntityStatus as ApiEntityStatus,
  RecipientType,
  StudentStatus as ApiStudentStatus,
  TemplateCategory,
} from "@/services";
import type {
  Branch,
  Course,
  FacultyForm,
  HistoryRow,
  MessageForm,
  ParentForm,
  Role,
  SettingsTab,
  StudentForm,
  Tab,
} from "@/lib/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

function emptyStudentForm(): StudentForm {
  return {
    rollNo: "",
    name: "",
    phone: "",
    email: "",
    branchId: "",
    courseId: "",
    year: "",
    semester: "",
    division: "",
    gender: "",
    status: "ACTIVE",
  };
}
function emptyParentForm(): ParentForm {
  return { name: "", phone: "", email: "", relation: "", linkedStudentId: "", status: "ACTIVE" };
}
export function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%*";
  const all = upper + lower + digits + symbols;
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const rest = Array.from({ length: 8 }, () => pick(all));
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols), ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
function emptyFacultyForm(): FacultyForm {
  return { name: "", email: "", password: generatePassword(), branchId: "", role: "FACULTY" };
}
function emptyMsgForm(): MessageForm {
  return {
    notifType: "",
    templateId: "",
    title: "",
    message: "",
    attachment: null,
    ctaLabel: "",
    ctaUrl: "",
    branchId: "all",
    courseId: "all",
    year: "all",
    semester: "all",
    audience: { students: false, parents: false },
    scheduleMode: "now",
    scheduleDate: "",
    scheduleTime: "",
  };
}

interface NewTemplateForm {
  name: string;
  whatsappTemplateName: string;
  category: TemplateCategory;
  variablesText: string;
  attachmentAllowed: boolean;
  buttonAllowed: boolean;
}
function emptyNewTemplate(): NewTemplateForm {
  return { name: "", whatsappTemplateName: "", category: "UTILITY", variablesText: "", attachmentAllowed: false, buttonAllowed: false };
}

interface AppState {
  activeTab: Tab;
  role: Role;
  branches: Branch[];
  branchesLoading: boolean;
  courses: Course[];
  coursesLoading: boolean;
  students: ApiStudent[];
  studentsLoading: boolean;
  studentsSaving: boolean;
  studentsImporting: boolean;
  parents: ApiParent[];
  parentsLoading: boolean;
  parentsSaving: boolean;
  faculty: ApiFaculty[];
  facultyLoading: boolean;
  facultySaving: boolean;
  facultyFilters: { branchId: string; status: string };
  templates: ApiNotificationTemplate[];
  templatesLoading: boolean;
  newTemplate: NewTemplateForm;
  history: HistoryRow[];
  historyLoading: boolean;
  sendingNotification: boolean;
  attachmentUploading: boolean;
  selectedStudents: string[];
  selectedParents: string[];
  studentSearch: string;
  studentFilters: { branchId: string; courseId: string; year: string; semester: string; status: string };
  parentSearch: string;
  parentFilters: { branchId: string; relation: string; status: string };
  showAddStudent: boolean;
  editingStudentId: string | null;
  studentForm: StudentForm;
  showImportStudents: boolean;
  showAddParent: boolean;
  editingParentId: string | null;
  parentForm: ParentForm;
  showAddFaculty: boolean;
  editingFacultyId: string | null;
  facultyForm: FacultyForm;
  showPreview: boolean;
  settingsTab: SettingsTab;
  newBranch: { name: string; code: string; address: string };
  selectedBranchForCourses: string | null;
  newCourse: { name: string; code: string; totalYears: number; semestersPerYear: number };
  historyFilter: string;
  historySearch: string;
  msgForm: MessageForm;
}

function initialState(role: Role): AppState {
  return {
    activeTab: "messages",
    role,
    branches: [],
    branchesLoading: true,
    courses: [],
    coursesLoading: true,
    students: [],
    studentsLoading: true,
    studentsSaving: false,
    studentsImporting: false,
    parents: [],
    parentsLoading: true,
    parentsSaving: false,
    faculty: [],
    facultyLoading: true,
    facultySaving: false,
    facultyFilters: { branchId: "all", status: "all" },
    templates: [],
    templatesLoading: true,
    newTemplate: emptyNewTemplate(),
    history: [],
    historyLoading: true,
    sendingNotification: false,
    attachmentUploading: false,
    selectedStudents: [],
    selectedParents: [],
    studentSearch: "",
    studentFilters: { branchId: "all", courseId: "all", year: "all", semester: "all", status: "all" },
    parentSearch: "",
    parentFilters: { branchId: "all", relation: "all", status: "all" },
    showAddStudent: false,
    editingStudentId: null,
    studentForm: emptyStudentForm(),
    showImportStudents: false,
    showAddParent: false,
    editingParentId: null,
    parentForm: emptyParentForm(),
    showAddFaculty: false,
    editingFacultyId: null,
    facultyForm: emptyFacultyForm(),
    showPreview: false,
    settingsTab: "branches",
    newBranch: { name: "", code: "", address: "" },
    selectedBranchForCourses: null,
    newCourse: { name: "", code: "", totalYears: 4, semestersPerYear: 2 },
    historyFilter: "All",
    historySearch: "",
    msgForm: emptyMsgForm(),
  };
}

function useDashboardState(initialRole: Role) {
  const [state, setState] = useState<AppState>(() => initialState(initialRole));

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
  const uploadMsgAttachment = useCallback(async (file: File) => {
    setState((s) => ({ ...s, attachmentUploading: true }));
    try {
      const result = await uploadService.uploadAttachment(file);
      setState((s) => ({
        ...s,
        msgForm: { ...s.msgForm, attachment: { name: file.name, url: result.url, mimeType: result.mimeType } },
        attachmentUploading: false,
      }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to upload attachment."));
      setState((s) => ({ ...s, attachmentUploading: false }));
    }
  }, []);
  const removeMsgAttachment = useCallback(() => setState((s) => ({ ...s, msgForm: { ...s.msgForm, attachment: null } })), []);
  const setScheduleMode = useCallback(
    (mode: MessageForm["scheduleMode"]) => setState((s) => ({ ...s, msgForm: { ...s.msgForm, scheduleMode: mode } })),
    [],
  );
  const resetMsgForm = useCallback(() => setState((s) => ({ ...s, msgForm: emptyMsgForm() })), []);
  const openPreview = useCallback(() => setState((s) => ({ ...s, showPreview: true })), []);
  const closePreview = useCallback(() => setState((s) => ({ ...s, showPreview: false })), []);

  const refreshTemplates = useCallback(async () => {
    setState((s) => ({ ...s, templatesLoading: true }));
    try {
      const { data } = await templateService.listTemplates(1, 100);
      setState((s) => ({ ...s, templates: data, templatesLoading: false }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load templates."));
      setState((s) => ({ ...s, templatesLoading: false }));
    }
  }, []);

  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);

  const refreshHistory = useCallback(async () => {
    setState((s) => ({ ...s, historyLoading: true }));
    try {
      const { data: notifications } = await notificationService.listNotifications(1, 50);
      const rows = await Promise.all(
        notifications.map(async (n): Promise<HistoryRow> => {
          const template = state.templates.find((t) => t.id === n.templateId);
          const report = await notificationService.getDeliveryReport(n.id).catch(() => null);
          const audienceLabels = n.audience
            .map((a) => (a === "STUDENT" ? "Students" : "Parents"))
            .join(", ");
          return {
            id: n.id,
            date: new Date(n.createdAt).toLocaleString(),
            title: n.title,
            type: template?.category ?? "—",
            audience: audienceLabels || "—",
            recipients: report?.total ?? 0,
            status: n.status,
            delivered: report?.delivered ?? 0,
            read: report?.read ?? 0,
            failed: report?.failed ?? 0,
          };
        }),
      );
      setState((s) => ({ ...s, history: rows, historyLoading: false }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load message history."));
      setState((s) => ({ ...s, historyLoading: false }));
    }
  }, [state.templates]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const sendNotification = useCallback(async () => {
    const f = state.msgForm;
    if (!f.templateId) {
      toast.error("Select a WhatsApp template.");
      return;
    }
    if (!f.title.trim() || !f.message.trim()) {
      toast.error("Fill in Title and Message.");
      return;
    }
    if (!f.audience.students && !f.audience.parents) {
      toast.error("Select at least one Target Audience.");
      return;
    }
    if (f.scheduleMode === "schedule" && (!f.scheduleDate || !f.scheduleTime)) {
      toast.error("Set a schedule date and time.");
      return;
    }

    const audience: RecipientType[] = [];
    if (f.audience.students) audience.push("STUDENT");
    if (f.audience.parents) audience.push("PARENT");
    const scheduledAt = f.scheduleMode === "schedule" ? new Date(`${f.scheduleDate}T${f.scheduleTime}`).toISOString() : undefined;

    setState((s) => ({ ...s, sendingNotification: true }));
    try {
      await notificationService.createNotification({
        templateId: f.templateId,
        title: f.title,
        message: f.message,
        attachmentUrl: f.attachment?.url,
        attachmentType: f.attachment?.mimeType,
        buttonLabel: f.ctaLabel || undefined,
        buttonUrl: f.ctaUrl || undefined,
        branchId: f.branchId === "all" ? undefined : f.branchId,
        courseId: f.courseId === "all" ? undefined : f.courseId,
        targetYear: f.year === "all" ? undefined : Number(f.year),
        targetSemester: f.semester === "all" ? undefined : Number(f.semester),
        audience,
        scheduledAt,
      });
      toast.success(scheduledAt ? `Notification scheduled for ${f.scheduleDate} ${f.scheduleTime}.` : "Notification queued for sending.");
      setState((s) => ({ ...s, msgForm: emptyMsgForm(), sendingNotification: false }));
      await refreshHistory();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to send notification."));
      setState((s) => ({ ...s, sendingNotification: false }));
    }
  }, [state.msgForm, refreshHistory]);

  const saveDraft = useCallback(() => {
    toast.error("Saving drafts isn't available yet — send now or schedule instead.");
  }, []);

  const setStudentFilter = useCallback(
    (key: keyof AppState["studentFilters"], val: string) =>
      setState((s) => ({
        ...s,
        studentFilters:
          key === "branchId"
            ? { ...s.studentFilters, branchId: val, courseId: "all" }
            : { ...s.studentFilters, [key]: val },
      })),
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
    (row: ApiStudent) =>
      setState((s) => ({
        ...s,
        showAddStudent: true,
        editingStudentId: row.id,
        studentForm: {
          rollNo: row.rollNo,
          name: row.name,
          phone: row.phone,
          email: row.email ?? "",
          branchId: row.branchId,
          courseId: row.courseId,
          year: String(row.year),
          semester: String(row.semester),
          division: row.division ?? "",
          gender: row.gender ?? "",
          status: row.status,
        },
      })),
    [],
  );
  const closeAddStudent = useCallback(() => setState((s) => ({ ...s, showAddStudent: false })), []);
  const setStudentFormField = useCallback(
    <K extends keyof StudentForm>(key: K, val: StudentForm[K]) =>
      setState((s) => ({ ...s, studentForm: { ...s.studentForm, [key]: val } })),
    [],
  );

  const buildStudentListQuery = useCallback(() => {
    const sf = state.studentFilters;
    return {
      branchId: sf.branchId === "all" ? undefined : sf.branchId,
      courseId: sf.courseId === "all" ? undefined : sf.courseId,
      year: sf.year === "all" ? undefined : Number(sf.year),
      semester: sf.semester === "all" ? undefined : Number(sf.semester),
      status: sf.status === "all" ? undefined : (sf.status as ApiStudentStatus),
      search: state.studentSearch.trim() || undefined,
    };
  }, [state.studentFilters, state.studentSearch]);

  const refreshStudents = useCallback(async () => {
    setState((s) => ({ ...s, studentsLoading: true }));
    try {
      const { data } = await studentsService.listStudents(1, 100, buildStudentListQuery());
      setState((s) => ({ ...s, students: data, studentsLoading: false }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load students."));
      setState((s) => ({ ...s, studentsLoading: false }));
    }
  }, [buildStudentListQuery]);

  useEffect(() => {
    const handle = setTimeout(refreshStudents, 300);
    return () => clearTimeout(handle);
  }, [refreshStudents]);

  const saveStudent = useCallback(async () => {
    const f = state.studentForm;
    if (!f.rollNo.trim() || !f.name.trim() || !f.phone.trim()) {
      toast.error("Roll No, Name and Phone are required.");
      return;
    }
    if (/\d/.test(f.name.trim())) {
      toast.error("Name cannot contain numbers.");
      return;
    }
    if (!/^\d+$/.test(f.phone.trim())) {
      toast.error("Phone number cannot contain character.");
      return;
    }
    if (f.phone.trim().length != 10) {
      toast.error("Invalid Phone number.");
      return;
    }
    if (!f.branchId) {
      toast.error("Select a college.");
      return;
    }
    if (!f.courseId) {
      toast.error("Select a course.");
      return;
    }
    if (!f.year || !f.semester) {
      toast.error("Select year and semester.");
      return;
    }

    setState((s) => ({ ...s, studentsSaving: true }));
    try {
      if (state.editingStudentId) {
        await studentsService.updateStudent(state.editingStudentId, {
          rollNo: f.rollNo,
          name: f.name,
          phone: f.phone,
          email: f.email || undefined,
          courseId: f.courseId,
          year: Number(f.year),
          semester: Number(f.semester),
          division: f.division || undefined,
          gender: f.gender || undefined,
          status: f.status,
        });
        toast.success("Student updated.");
      } else {
        await studentsService.createStudent({
          rollNo: f.rollNo,
          name: f.name,
          phone: f.phone,
          email: f.email || undefined,
          branchId: f.branchId,
          courseId: f.courseId,
          year: Number(f.year),
          semester: Number(f.semester),
          division: f.division || undefined,
          gender: f.gender || undefined,
        });
        toast.success("Student added.");
      }
      setState((s) => ({ ...s, showAddStudent: false, studentsSaving: false }));
      await refreshStudents();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save student."));
      setState((s) => ({ ...s, studentsSaving: false }));
    }
  }, [state.studentForm, state.editingStudentId, refreshStudents]);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      await studentsService.deleteStudent(id);
      setState((s) => ({
        ...s,
        students: s.students.filter((x) => x.id !== id),
        selectedStudents: s.selectedStudents.filter((x) => x !== id),
      }));
      toast.success("Student deleted.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete student."));
    }
  }, []);
  const bulkDeleteStudents = useCallback(async () => {
    const ids = state.selectedStudents;
    if (ids.length === 0) return;
    try {
      await studentsService.bulkDeleteStudents(ids);
      setState((s) => ({ ...s, students: s.students.filter((x) => !ids.includes(x.id)), selectedStudents: [] }));
      toast.success("Selected students removed.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete students."));
    }
  }, [state.selectedStudents]);
  const messageSelectedStudents = useCallback(() => {
    setState((s) => ({ ...s, activeTab: "messages", msgForm: { ...s.msgForm, audience: { ...s.msgForm.audience, students: true } } }));
    toast.success("Composing message to selected students.");
  }, []);
  const openImportStudents = useCallback(() => setState((s) => ({ ...s, showImportStudents: true })), []);
  const closeImportStudents = useCallback(() => setState((s) => ({ ...s, showImportStudents: false })), []);
  const importStudents = useCallback(
    async (file: File) => {
      setState((s) => ({ ...s, studentsImporting: true }));
      try {
        const result = await studentsService.importStudents(file);
        if (result.imported > 0) {
          toast.success(`${result.imported} student(s) imported.` + (result.failed ? ` ${result.failed} row(s) failed.` : ""));
        }
        if (result.failed > 0) {
          const first = result.errors[0];
          toast.error(`${result.failed} row(s) failed.` + (first ? ` Row ${first.row}: ${first.message}` : ""));
        }
        setState((s) => ({ ...s, showImportStudents: false }));
        await refreshStudents();
      } catch (err) {
        toast.error(apiErrorMessage(err, "Import failed."));
      } finally {
        setState((s) => ({ ...s, studentsImporting: false }));
      }
    },
    [refreshStudents],
  );

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
    (row: ApiParent) =>
      setState((s) => ({
        ...s,
        showAddParent: true,
        editingParentId: row.id,
        parentForm: {
          name: row.name,
          phone: row.phone,
          email: row.email ?? "",
          relation: row.relation ?? "",
          linkedStudentId: row.linkedStudentId,
          status: row.status,
        },
      })),
    [],
  );
  const closeAddParent = useCallback(() => setState((s) => ({ ...s, showAddParent: false })), []);
  const setParentFormField = useCallback(
    <K extends keyof ParentForm>(key: K, val: ParentForm[K]) => setState((s) => ({ ...s, parentForm: { ...s.parentForm, [key]: val } })),
    [],
  );

  const buildParentListQuery = useCallback(() => {
    const pf = state.parentFilters;
    return {
      branchId: pf.branchId === "all" ? undefined : pf.branchId,
      status: pf.status === "all" ? undefined : (pf.status as ApiEntityStatus),
      search: state.parentSearch.trim() || undefined,
    };
  }, [state.parentFilters, state.parentSearch]);

  const refreshParents = useCallback(async () => {
    setState((s) => ({ ...s, parentsLoading: true }));
    try {
      const { data } = await parentsService.listParents(1, 100, buildParentListQuery());
      const relation = state.parentFilters.relation;
      const filtered = relation === "all" ? data : data.filter((p) => p.relation === relation);
      setState((s) => ({ ...s, parents: filtered, parentsLoading: false }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load parents."));
      setState((s) => ({ ...s, parentsLoading: false }));
    }
  }, [buildParentListQuery, state.parentFilters.relation]);

  useEffect(() => {
    const handle = setTimeout(refreshParents, 300);
    return () => clearTimeout(handle);
  }, [refreshParents]);

  const saveParent = useCallback(async () => {
    const f = state.parentForm;
    if (!f.name.trim() || !f.phone.trim() || !f.relation) {
      toast.error("Name, Phone number and Relation required.");
      return;
    }
    if (/\d/.test(f.name.trim())) {
      toast.error("Name cannot contain numbers.");
      return;
    }
    if (!/^\d+$/.test(f.phone.trim())) {
      toast.error("Phone number cannot contain character.");
      return;
    }
    if (f.phone.trim().length != 10) {
      toast.error("Invalid Phone number.");
      return;
    }
    if (!f.linkedStudentId) {
      toast.error("Select the linked student.");
      return;
    }

    setState((s) => ({ ...s, parentsSaving: true }));
    try {
      if (state.editingParentId) {
        await parentsService.updateParent(state.editingParentId, {
          name: f.name,
          phone: f.phone,
          email: f.email || undefined,
          relation: f.relation,
          linkedStudentId: f.linkedStudentId,
          status: f.status,
        });
        toast.success("Parent updated.");
      } else {
        await parentsService.createParent({
          name: f.name,
          phone: f.phone,
          email: f.email || undefined,
          relation: f.relation,
          linkedStudentId: f.linkedStudentId,
        });
        toast.success("Parent added.");
      }
      setState((s) => ({ ...s, showAddParent: false, parentsSaving: false }));
      await refreshParents();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save parent."));
      setState((s) => ({ ...s, parentsSaving: false }));
    }
  }, [state.parentForm, state.editingParentId, refreshParents]);

  const deleteParent = useCallback(async (id: string) => {
    try {
      await parentsService.deleteParent(id);
      setState((s) => ({
        ...s,
        parents: s.parents.filter((x) => x.id !== id),
        selectedParents: s.selectedParents.filter((x) => x !== id),
      }));
      toast.success("Parent deleted.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete parent."));
    }
  }, []);
  const bulkDeleteParents = useCallback(async () => {
    const ids = state.selectedParents;
    if (ids.length === 0) return;
    try {
      await parentsService.bulkDeleteParents(ids);
      setState((s) => ({ ...s, parents: s.parents.filter((x) => !ids.includes(x.id)), selectedParents: [] }));
      toast.success("Selected parents removed.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete parents."));
    }
  }, [state.selectedParents]);
  const messageSelectedParents = useCallback(() => {
    setState((s) => ({ ...s, activeTab: "messages", msgForm: { ...s.msgForm, audience: { ...s.msgForm.audience, parents: true } } }));
    toast.success("Composing message to selected parents.");
  }, []);
  const openImportParents = useCallback(() => {
    toast.error("Parent import from Excel isn't available yet — add parents individually for now.");
  }, []);

  const buildFacultyListQuery = useCallback(() => {
    const ff = state.facultyFilters;
    return {
      branchId: ff.branchId === "all" ? undefined : ff.branchId,
      status: ff.status === "all" ? undefined : (ff.status as ApiEntityStatus),
    };
  }, [state.facultyFilters]);

  const refreshFaculty = useCallback(async () => {
    setState((s) => ({ ...s, facultyLoading: true }));
    try {
      const q = buildFacultyListQuery();
      const { data } = await facultyService.listFaculty(1, 100, q.branchId, q.status);
      setState((s) => ({ ...s, faculty: data, facultyLoading: false }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load faculty."));
      setState((s) => ({ ...s, facultyLoading: false }));
    }
  }, [buildFacultyListQuery]);

  useEffect(() => {
    refreshFaculty();
  }, [refreshFaculty]);

  const setFacultyFilter = useCallback(
    (key: keyof AppState["facultyFilters"], val: string) => setState((s) => ({ ...s, facultyFilters: { ...s.facultyFilters, [key]: val } })),
    [],
  );

  const openAddFaculty = useCallback(() => {
    setState((s) => {
      if (s.role !== "super_admin") {
        toast.error("Only Super Admins can add faculty.");
        return s;
      }
      return { ...s, showAddFaculty: true, editingFacultyId: null, facultyForm: emptyFacultyForm() };
    });
  }, []);
  const openEditFaculty = useCallback(
    (row: ApiFaculty) =>
      setState((s) => ({
        ...s,
        showAddFaculty: true,
        editingFacultyId: row.id,
        facultyForm: { name: row.name, email: row.email, password: "", branchId: row.branchId ?? "", role: row.role },
      })),
    [],
  );
  const closeAddFaculty = useCallback(() => setState((s) => ({ ...s, showAddFaculty: false })), []);
  const setFacultyFormField = useCallback(
    <K extends keyof FacultyForm>(key: K, val: FacultyForm[K]) => setState((s) => ({ ...s, facultyForm: { ...s.facultyForm, [key]: val } })),
    [],
  );
  const regenerateFacultyPassword = useCallback(
    () => setState((s) => ({ ...s, facultyForm: { ...s.facultyForm, password: generatePassword() } })),
    [],
  );
  const saveFaculty = useCallback(async () => {
    const f = state.facultyForm;
    if (!f.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (/\d/.test(f.name.trim())) {
      toast.error("Name cannot contain numbers.");
      return;
    }
    if (!state.editingFacultyId && (!f.email.trim())) {
      toast.error("Email is required.");
      return;
    }
    if (!state.editingFacultyId && (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(f.email.trim()))) {
      toast.error("Invalid Email.");
      return;
    }
    if (!state.editingFacultyId && (f.password.length < 8)) {
      toast.error("Password is required and must be at least 8 characters.");
      return;
    }
    // Faculty accounts are branch-scoped everywhere else in the app; Super
    // Admins see every branch, so a college isn't required for them.
    if (f.role === "FACULTY" && !f.branchId) {
      toast.error("Select a college.");
      return;
    }

    setState((s) => ({ ...s, facultySaving: true }));
    try {
      if (state.editingFacultyId) {
        await facultyService.updateFaculty(state.editingFacultyId, {
          name: f.name,
          branchId: f.branchId || undefined,
          role: f.role,
        });
        toast.success("Faculty account updated.");
      } else {
        await facultyService.createFaculty({ name: f.name, email: f.email, password: f.password, branchId: f.branchId });
        toast.success("Faculty account created.");
      }
      setState((s) => ({ ...s, showAddFaculty: false, facultySaving: false }));
      await refreshFaculty();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save faculty account."));
      setState((s) => ({ ...s, facultySaving: false }));
    }
  }, [state.facultyForm, state.editingFacultyId, refreshFaculty]);

  const toggleFacultyStatus = useCallback(
    async (row: ApiFaculty) => {
      if (state.role !== "super_admin") {
        toast.error("Only Super Admins can change faculty status.");
        return;
      }
      const nextStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      try {
        await facultyService.setFacultyStatus(row.id, nextStatus);
        toast.success(nextStatus === "ACTIVE" ? "Faculty account activated." : "Faculty account deactivated.");
        await refreshFaculty();
      } catch (err) {
        toast.error(apiErrorMessage(err, "Failed to update faculty status."));
      }
    },
    [state.role, refreshFaculty],
  );
  const resetFacultyPassword = useCallback(
    async (id: string, newPassword: string) => {
      if (state.role !== "super_admin") {
        toast.error("Only Super Admins can reset faculty passwords.");
        return false;
      }
      try {
        await facultyService.resetFacultyPassword(id, newPassword);
        toast.success("Password reset.");
        return true;
      } catch (err) {
        toast.error(apiErrorMessage(err, "Failed to reset password."));
        return false;
      }
    },
    [state.role],
  );
  const deleteFaculty = useCallback(
    async (id: string) => {
      if (state.role !== "super_admin") {
        toast.error("Only Super Admins can delete faculty.");
        return;
      }
      try {
        await facultyService.deleteFaculty(id);
        setState((s) => ({ ...s, faculty: s.faculty.filter((x) => x.id !== id) }));
        toast.success("Faculty account deleted.");
      } catch (err) {
        toast.error(apiErrorMessage(err, "Failed to delete faculty account."));
      }
    },
    [state.role],
  );

  const refreshBranches = useCallback(async () => {
    setState((s) => ({ ...s, branchesLoading: true }));
    try {
      const { data } = await branchService.listBranches(1, 100);
      const branches: Branch[] = data.map((b) => ({ id: b.id, name: b.name, code: b.code, address: b.address ?? "" }));
      setState((s) => ({ ...s, branches, branchesLoading: false }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load branches."));
      setState((s) => ({ ...s, branchesLoading: false }));
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    setState((s) => ({ ...s, coursesLoading: true }));
    try {
      const { data } = await courseService.listCourses(1, 100);
      setState((s) => ({ ...s, courses: data, coursesLoading: false }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load courses."));
      setState((s) => ({ ...s, coursesLoading: false }));
    }
  }, []);

  useEffect(() => {
    refreshBranches();
    refreshCourses();
  }, [refreshBranches, refreshCourses]);

  const setSettingsTab = useCallback((t: SettingsTab) => setState((s) => ({ ...s, settingsTab: t })), []);
  const setNewBranchField = useCallback(
    (key: keyof AppState["newBranch"], val: string) => setState((s) => ({ ...s, newBranch: { ...s.newBranch, [key]: val } })),
    [],
  );
  const addBranch = useCallback(async () => {
    const { name, code, address } = state.newBranch;
    if (!name.trim() || !code.trim()) {
      toast.error("Branch name and code are required.");
      return;
    }
    try {
      const branch = await branchService.createBranch({ name, code, address: address || undefined });
      setState((s) => ({
        ...s,
        branches: [...s.branches, { id: branch.id, name: branch.name, code: branch.code, address: branch.address ?? "" }],
        newBranch: { name: "", code: "", address: "" },
      }));
      toast.success("Branch added.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to add branch."));
    }
  }, [state.newBranch]);
  const deleteBranch = useCallback(async (id: string) => {
    try {
      await branchService.deleteBranch(id);
      setState((s) => ({ ...s, branches: s.branches.filter((x) => x.id !== id) }));
      toast.success("Branch deleted.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete branch."));
    }
  }, []);
  const setSelectedBranchForCourses = useCallback((id: string) => setState((s) => ({ ...s, selectedBranchForCourses: id })), []);
  const setNewCourseField = useCallback(
    (key: keyof AppState["newCourse"], val: string | number) => setState((s) => ({ ...s, newCourse: { ...s.newCourse, [key]: val } })),
    [],
  );
  const addCourse = useCallback(async () => {
    const branchId = state.selectedBranchForCourses || state.branches[0]?.id;
    const c = state.newCourse;
    if (!branchId) {
      toast.error("Add a branch first.");
      return;
    }
    if (!c.name.trim() || !c.code.trim()) {
      toast.error("Course name and code are required.");
      return;
    }
    try {
      const course = await courseService.createCourse({
        branchId,
        name: c.name,
        code: c.code,
        totalYears: Number(c.totalYears) || 4,
        semestersPerYear: Number(c.semestersPerYear) || 2,
      });
      setState((s) => ({
        ...s,
        courses: [...s.courses, course],
        newCourse: { name: "", code: "", totalYears: 4, semestersPerYear: 2 },
      }));
      toast.success("Course added.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to add course."));
    }
  }, [state.selectedBranchForCourses, state.branches, state.newCourse]);
  const deleteCourse = useCallback(async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      setState((s) => ({ ...s, courses: s.courses.filter((x) => x.id !== id) }));
      toast.success("Course deleted.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete course."));
    }
  }, []);
  const updateCourseYears = useCallback(async (id: string, val: string) => {
    const totalYears = Number(val) || 1;
    try {
      const course = await courseService.updateCourse(id, { totalYears });
      setState((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? course : c)) }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update course years."));
    }
  }, []);
  const updateCourseSemesters = useCallback(async (id: string, val: string) => {
    const semestersPerYear = Number(val) || 1;
    try {
      const course = await courseService.updateCourse(id, { semestersPerYear });
      setState((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? course : c)) }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update course semesters."));
    }
  }, []);
  const setNewTemplateField = useCallback(
    <K extends keyof NewTemplateForm>(key: K, val: NewTemplateForm[K]) =>
      setState((s) => ({ ...s, newTemplate: { ...s.newTemplate, [key]: val } })),
    [],
  );
  const addTemplate = useCallback(async () => {
    const t = state.newTemplate;
    if (!t.name.trim() || !t.whatsappTemplateName.trim()) {
      toast.error("Name and WhatsApp template name are required.");
      return;
    }
    const variables = t.variablesText
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    try {
      const created = await templateService.createTemplate({
        name: t.name,
        whatsappTemplateName: t.whatsappTemplateName,
        category: t.category,
        variables,
        attachmentAllowed: t.attachmentAllowed,
        buttonAllowed: t.buttonAllowed,
      });
      setState((s) => ({ ...s, templates: [created, ...s.templates], newTemplate: emptyNewTemplate() }));
      toast.success("Template added.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to add template."));
    }
  }, [state.newTemplate]);
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await templateService.deleteTemplate(id);
      setState((s) => ({ ...s, templates: s.templates.filter((x) => x.id !== id) }));
      toast.success("Template deleted.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete template."));
    }
  }, []);

  const setHistoryFilter = useCallback((v: string) => setState((s) => ({ ...s, historyFilter: v })), []);
  const setHistorySearch = useCallback((v: string) => setState((s) => ({ ...s, historySearch: v })), []);

  const actions = useMemo(
    () => ({
      setTab,
      setRole,
      setMsgField,
      toggleAudience,
      uploadMsgAttachment,
      removeMsgAttachment,
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
      setFacultyFilter,
      openAddFaculty,
      openEditFaculty,
      closeAddFaculty,
      setFacultyFormField,
      regenerateFacultyPassword,
      saveFaculty,
      toggleFacultyStatus,
      resetFacultyPassword,
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
      setNewTemplateField,
      addTemplate,
      deleteTemplate,
      setHistoryFilter,
      setHistorySearch,
    }),
    [
      setTab, setRole, setMsgField, toggleAudience, uploadMsgAttachment, removeMsgAttachment, setScheduleMode, resetMsgForm, openPreview, closePreview,
      sendNotification, saveDraft, setStudentFilter, setStudentSearch, toggleStudentSelect, toggleSelectAllStudents, openAddStudent,
      openEditStudent, closeAddStudent, setStudentFormField, saveStudent, deleteStudent, bulkDeleteStudents, messageSelectedStudents,
      openImportStudents, closeImportStudents, importStudents, setParentFilter, setParentSearch, toggleParentSelect,
      toggleSelectAllParents, openAddParent, openEditParent, closeAddParent, setParentFormField, saveParent, deleteParent,
      bulkDeleteParents, messageSelectedParents, openImportParents, setFacultyFilter, openAddFaculty, openEditFaculty,
      closeAddFaculty, setFacultyFormField, regenerateFacultyPassword, saveFaculty, toggleFacultyStatus, resetFacultyPassword, deleteFaculty, setSettingsTab, setNewBranchField, addBranch, deleteBranch,
      setSelectedBranchForCourses, setNewCourseField, addCourse, deleteCourse, updateCourseYears, updateCourseSemesters,
      setNewTemplateField, addTemplate, deleteTemplate, setHistoryFilter, setHistorySearch,
    ],
  );

  return { state, actions };
}

type DashboardContextValue = ReturnType<typeof useDashboardState>;

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children, initialRole }: { children: ReactNode; initialRole: Role }) {
  const value = useDashboardState(initialRole);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
