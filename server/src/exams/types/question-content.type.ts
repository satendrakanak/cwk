export interface QuestionOptionContent {
  id: string;
  text: string;
  isCorrect?: boolean;
  matchKey?: string;
  weight?: number;
  feedback?: string;
}

export interface MatchingPairContent {
  id: string;
  left: string;
  right: string;
}

export interface NumericalAnswerContent {
  value: number;
  tolerance?: number;
}

export interface QuestionContent {
  options?: QuestionOptionContent[];
  matchingPairs?: MatchingPairContent[];
  acceptedAnswers?: string[];
  numericalAnswers?: NumericalAnswerContent[];
  rubric?: string;
}

export interface ExamAnswerPayload {
  questionId: number;
  answer: string | number | boolean | string[] | Record<string, string> | null;
}

export interface ExamQuestionResultPayload {
  questionId: number;
  score: number;
  maxScore: number;
  isCorrect?: boolean;
  needsManualGrading?: boolean;
  feedback?: string;
}

export interface ExamAttemptQuestionConfigPayload {
  questionId: number;
  points: number;
  negativeMarks: number;
  weight: number;
  ruleId?: number;
}
