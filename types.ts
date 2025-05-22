
export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

export interface AnswerOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: AnswerOption[];
  type: QuestionType;
  correctAnswers: string[]; // Array von AnswerOption IDs
  explanation?: string; // Optionale Erklärung
}

export interface UserAnswer {
  questionId: string;
  selectedAnswers: string[];
}

export enum QuizStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  TIME_UP = 'TIME_UP',
}

export interface QuestionResult extends Question {
  userSelectedAnswers: string[];
  isCorrect: boolean;
}
