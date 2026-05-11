export type FacultyWorkspaceCourse = {
  id: number;
  title: string;
  slug: string;
  isPublished: boolean;
  mode?: string;
  duration?: string;
  studentsCount: number;
};

export type FacultyWorkspaceExam = {
  id: number;
  title: string;
  slug: string;
  status: string;
  courses: Array<{
    id: number;
    title: string;
    slug: string;
  }>;
  attemptsCount: number;
};

export type FacultyWorkspaceAttempt = {
  id: number;
  learnerName: string;
  courseTitle: string;
  examTitle: string;
  percentage: number;
  passed: boolean;
  status: string;
  submittedAt: string | null;
};

export type FacultyExamAttempt = FacultyWorkspaceAttempt & {
  learnerEmail?: string;
  score: number;
  maxScore: number;
  courseSlug?: string;
  manualGradedAt?: string | null;
  needsManualGrading: boolean;
  answers?: Array<{
    questionId: number;
    answer: unknown;
  }>;
  questionResults?: Array<{
    questionId: number;
    score: number;
    maxScore: number;
    isCorrect?: boolean;
    needsManualGrading?: boolean;
    feedback?: string;
  }>;
};

export type FacultyWorkspaceSession = {
  id: number;
  title: string;
  batchName: string;
  courseTitle: string;
  startsAt: string;
  endsAt: string;
  status: string;
  meetingUrl?: string | null;
  hasBbbMeeting?: boolean;
  bbbIsRunning?: boolean;
  bbbParticipantCount?: number;
  bbbModeratorCount?: number;
  bbbRecord?: boolean;
  allowRecordingAccess?: boolean;
  reminderOffsetsMinutes?: number[];
  sentReminderOffsetsMinutes?: number[];
};

export type FacultyWorkspaceBatchSummary = {
  id: number;
  name: string;
  status: string;
  rawStatus: string;
  courseTitle: string;
  startDate?: string | null;
  endDate?: string | null;
  studentsCount: number;
  sessionsCount: number;
};

export type FacultyBatchStudent = {
  id: number;
  status: string;
  joinedAt: string;
  student: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  };
};

export type FacultyClassRecording = {
  id: number;
  bbbRecordId: string;
  name: string;
  format: string;
  playbackUrl?: string | null;
  durationSeconds?: number | null;
  participants?: number | null;
  status: string;
  archiveError?: string | null;
  recordedAt?: string | null;
  syncedAt?: string | null;
  file?: {
    id: number;
    name: string;
    path: string;
    mime: string;
    size: number;
  } | null;
  session?: {
    id: number;
    title: string;
    startsAt: string;
    endsAt: string;
    status: string;
    allowRecordingAccess?: boolean;
  } | null;
  course?: {
    id: number;
    title: string;
    slug: string;
  } | null;
  batch?: {
    id: number;
    name: string;
  } | null;
  faculty?: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  } | null;
  access?: {
    learnerAccessAllowed: boolean;
    learnerVisible: boolean;
    readyForLearners: boolean;
    attendeeCount: number;
    reasons: string[];
  };
  attendees?: Array<{
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
    role: string;
    joinedAt: string;
    lastSeenAt: string;
  }>;
};

export type FacultyClassSession = {
  id: number;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  meetingUrl?: string | null;
  hasBbbMeeting?: boolean;
  bbbIsRunning?: boolean;
  bbbParticipantCount?: number;
  bbbModeratorCount?: number;
  bbbRecord?: boolean;
  allowRecordingAccess?: boolean;
  location?: string | null;
  status: string;
  attendance?: {
    attended: boolean;
    joinedAt?: string | null;
  };
  reminderBeforeMinutes: number;
  reminderOffsetsMinutes?: number[];
  sentReminderOffsetsMinutes?: number[];
  recordings?: FacultyClassRecording[];
  batch: {
    id: number;
    name: string;
  };
  course: {
    id: number;
    title: string;
    slug: string;
  };
  faculty?: {
    id: number;
    firstName: string;
    lastName?: string;
  };
};

export type FacultyCourseBatch = {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  capacity?: number | null;
  course: {
    id: number;
    title: string;
    slug: string;
  };
  faculty: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  };
  students: FacultyBatchStudent[];
  sessions: FacultyClassSession[];
  createdAt: string;
  updatedAt: string;
};

export type FacultyCourseStudent = {
  enrollmentId: number;
  progress: number;
  enrolledAt: string;
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    email: string;
  };
};

export type CreateFacultyBatchPayload = {
  name: string;
  code?: string;
  description?: string;
  courseId: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
};

export type CreateFacultySessionPayload = {
  batchId: number;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  timezone?: string;
  meetingUrl?: string;
  location?: string;
  status?: string;
  reminderBeforeMinutes?: number;
  reminderOffsetsMinutes?: number[];
  allowRecordingAccess?: boolean;
  bbbRecord?: boolean;
};

export type FacultyWorkspaceData = {
  summary: {
    assignedCourses: number;
    publishedCourses: number;
    selfLearningCourses: number;
    facultyLedCourses: number;
    hybridCourses: number;
    activeStudents: number;
    assignedExams: number;
    pendingManualReviews: number;
    upcomingClasses: number;
    activeBatches: number;
    upcomingBatches: number;
    pendingReminders: number;
  };
  courses: FacultyWorkspaceCourse[];
  exams: FacultyWorkspaceExam[];
  recentAttempts: FacultyWorkspaceAttempt[];
  upcomingSessions: FacultyWorkspaceSession[];
  batches: FacultyWorkspaceBatchSummary[];
};
