export type ExamHistoryCourse = {
  id: number;
  title: string;
  slug: string;
};

export type ExamHistoryRecord = {
  course: ExamHistoryCourse;
  attemptsCount: number;
  bestScore: number;
  latestScore: number;
  latestMaxScore: number;
  latestPercentage: number;
  passed: boolean;
  lastAttemptedAt: string;
};

export type AdminExamRecentAttempt = {
  id: number;
  source?: "legacy" | "advanced";
  learnerName: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string | null;
};

export type AdminExamTopCourse = {
  courseId: number;
  courseTitle: string;
  attempts: number;
  passCount: number;
  averageScore: number;
};

export type AdminExamOverview = {
  totalAttempts: number;
  uniqueLearners: number;
  passedAttempts: number;
  certificatesIssued: number;
  averageScore: number;
  passRate: number;
  recentAttempts: AdminExamRecentAttempt[];
  topCourses: AdminExamTopCourse[];
};

export type UserExamAccessOverview = {
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  examMode?: "legacy" | "advanced";
  baseAttempts: number | null;
  extraAttempts: number;
  effectiveAttempts: number | null;
  attemptsUsed: number;
  remainingAttempts: number | null;
  passed: boolean;
  bypassAttendanceRequirement: boolean;
  note: string;
};

export type QuestionType =
  | "mcq_single"
  | "mcq_multiple"
  | "true_false"
  | "short_answer"
  | "numerical"
  | "matching"
  | "essay";

export type ExamStatus = "draft" | "published" | "archived";

export type CorrectAnswerVisibility =
  | "never"
  | "after_submit"
  | "after_passing"
  | "after_exam_close";

export type ExamQuestionRuleType = "fixed_question" | "random_from_category";

export type QuestionOptionContent = {
  id: string;
  text: string;
  isCorrect?: boolean;
  matchKey?: string;
  weight?: number;
  feedback?: string;
};

export type QuestionContent = {
  options?: QuestionOptionContent[];
  matchingPairs?: { id: string; left: string; right: string }[];
  acceptedAnswers?: string[];
  numericalAnswers?: { value: number; tolerance?: number }[];
  rubric?: string;
};

export type QuestionBankCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  questionsCount?: number;
  parent?: QuestionBankCategory | null;
  createdAt: string;
  updatedAt: string;
};

export type Question = {
  id: number;
  title: string;
  prompt: string;
  type: QuestionType;
  content: QuestionContent;
  defaultPoints: string;
  defaultNegativeMarks: string;
  allowPartialMarking: boolean;
  isActive: boolean;
  explanation?: string | null;
  category?: QuestionBankCategory | null;
  createdAt: string;
  updatedAt: string;
};

export type ExamQuestionRule = {
  id: number;
  ruleType: ExamQuestionRuleType;
  question?: Question | null;
  category?: QuestionBankCategory | null;
  order: number;
  randomQuestionCount?: number | null;
  pointsOverride?: string | null;
  negativeMarksOverride?: string | null;
  weight: string;
  isRequired: boolean;
};

export type Exam = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  instructions?: string | null;
  status: ExamStatus;
  passingPercentage: string;
  durationMinutes?: number | null;
  attemptLimit?: number | null;
  randomizeQuestions: boolean;
  shuffleOptions: boolean;
  adaptiveMode: boolean;
  retryPenaltyPercentage: string;
  partialMarking: boolean;
  fullscreenRequired: boolean;
  allowedIpRanges?: string[] | null;
  serverTimerEnabled: boolean;
  autoSubmitEnabled: boolean;
  reminderBeforeMinutes?: number | null;
  cleanupExpiredAttemptsAfterDays?: number | null;
  perQuestionFeedbackEnabled: boolean;
  overallFeedback?: string | null;
  correctAnswerVisibility: CorrectAnswerVisibility;
  courses?: { id: number; title: string; slug: string }[];
  faculties?: { id: number; firstName: string; lastName?: string | null; email: string }[];
  questionRules?: ExamQuestionRule[];
  questionsCount?: number;
  attemptsCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuestionBankCategoryPayload = {
  name: string;
  description?: string;
  parentId?: number;
};

export type UpdateQuestionBankCategoryPayload =
  Partial<CreateQuestionBankCategoryPayload>;

export type CreateQuestionPayload = {
  title: string;
  prompt: string;
  type: QuestionType;
  content?: QuestionContent;
  defaultPoints?: number;
  defaultNegativeMarks?: number;
  allowPartialMarking?: boolean;
  isActive?: boolean;
  explanation?: string;
  categoryId?: number;
};

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;

export type CreateExamPayload = {
  title: string;
  description?: string;
  instructions?: string;
  status?: ExamStatus;
  passingPercentage?: number;
  durationMinutes?: number;
  attemptLimit?: number;
  randomizeQuestions?: boolean;
  shuffleOptions?: boolean;
  adaptiveMode?: boolean;
  retryPenaltyPercentage?: number;
  partialMarking?: boolean;
  fullscreenRequired?: boolean;
  allowedIpRanges?: string[];
  serverTimerEnabled?: boolean;
  autoSubmitEnabled?: boolean;
  reminderBeforeMinutes?: number;
  cleanupExpiredAttemptsAfterDays?: number;
  perQuestionFeedbackEnabled?: boolean;
  overallFeedback?: string;
  correctAnswerVisibility?: CorrectAnswerVisibility;
  courseIds?: number[];
  facultyIds?: number[];
};

export type UpdateExamPayload = Partial<CreateExamPayload>;

export type UpsertExamQuestionRulePayload = {
  id?: number;
  ruleType: ExamQuestionRuleType;
  questionId?: number;
  categoryId?: number;
  order?: number;
  randomQuestionCount?: number;
  pointsOverride?: number;
  negativeMarksOverride?: number;
  weight?: number;
  isRequired?: boolean;
};

export type ReplaceExamQuestionRulesPayload = {
  rules: UpsertExamQuestionRulePayload[];
};

export type LearnerExamQuestion = {
  id: number;
  title: string;
  prompt: string;
  type: QuestionType;
  points: number;
  allowPartialMarking: boolean;
  options: { id: string; text: string; matchKey?: string; isCorrect?: boolean }[];
  matchingPairs: { id: string; left: string; right: string }[];
  acceptedAnswers?: string[];
  numericalAnswers?: { value: number; tolerance?: number }[];
  explanation?: string | null;
};

export type LearnerExamSummary = {
  id: number;
  title: string;
  description?: string | null;
  instructions?: string | null;
  passingPercentage: number;
  durationMinutes?: number | null;
  attemptLimit?: number | null;
  randomizeQuestions: boolean;
  shuffleOptions: boolean;
  fullscreenRequired: boolean;
  serverTimerEnabled: boolean;
  autoSubmitEnabled: boolean;
  perQuestionFeedbackEnabled?: boolean;
  overallFeedback?: string | null;
  correctAnswerVisibility: CorrectAnswerVisibility;
};

export type LearnerExamAttempt = {
  id: number;
  status: string;
  startedAt: string;
  expiresAt?: string | null;
  submittedAt?: string | null;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  needsManualGrading: boolean;
  questions?: LearnerExamQuestion[];
  answers?: { questionId: number; answer: unknown }[];
  questionResults?: {
    questionId: number;
    score: number;
    maxScore: number;
    isCorrect?: boolean;
    needsManualGrading?: boolean;
    feedback?: string;
  }[];
};

export type LearnerCourseExamPayload = {
  exam: LearnerExamSummary;
  activeAttempt: LearnerExamAttempt | null;
  attempts: LearnerExamAttempt[];
  attemptsUsed: number;
  extraAttempts?: number;
  effectiveAttemptLimit?: number | null;
  attemptsRemaining: number | null;
  canAttempt: boolean;
  isPassed: boolean;
  isUnlocked: boolean;
  unlockProgress: number;
  unlockMessage: string;
} | null;
