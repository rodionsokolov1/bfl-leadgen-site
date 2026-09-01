export type QuizAnswerOption = { id: string; label: string; nextQuestionId?: string; metadata?: Record<string, string> };
export type QuizQuestion = { id: string; question: string; options: QuizAnswerOption[] };
export type QuizResult = { id: string; title: string; description?: string };
export type QuizConfig = { startQuestionId: string; questions: QuizQuestion[]; results: QuizResult[] };
export type QuizAnswers = Record<string, string>;
