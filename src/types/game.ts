export interface MathProblem {
  id: string;
  question: string;
  correctAnswer: boolean;
  userAnswer?: boolean;
  isCorrect?: boolean;
  timeToAnswer?: number;
}

export interface GameState {
  currentProblem: number;
  problems: MathProblem[];
  score: number;
  timeLeft: number;
  isGameActive: boolean;
  isGameFinished: boolean;
  startTime: number;
}

export interface PlayerStats {
  id: string;
  username: string;
  totalGames: number;
  gamesWon: number;
  highestScore: number;
  averageAccuracy: number;
  fastestAnswer: number;
  currentStreak: number;
  longestStreak: number;
}

export interface GameResult {
  playerId: string;
  score: number;
  accuracy: number;
  averageTime: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface MatchSettings {
  duration: number; // seconds
  questionCount: number;
  gameMode: "1v1" | "best-of-3" | "best-of-5" | "best-of-10";
  isPrivate: boolean;
  inviteCode?: string;
}