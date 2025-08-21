import { MathProblem } from "@/types/game";

/**
 * Creates a deterministic pseudo-random number generator based on a seed.
 * The same seed will always produce the same sequence of numbers, which
 * allows multiplayer games to share identical questions.
 */
const createSeededRandom = (seed: string) => {
  // FNV-1a 32-bit hash
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getRandomGenerator = (seed?: string) => {
  return seed ? createSeededRandom(seed) : Math.random;
};

export const generateMathProblem = (id: string, rand: () => number): MathProblem => {
  // Generate two random numbers for addition
  const num1 = Math.floor(rand() * 20) + 1; // 1-20
  const num2 = Math.floor(rand() * 20) + 1; // 1-20
  const correctSum = num1 + num2;

  // 50% chance to show correct answer, 50% chance to show wrong answer
  const showCorrect = rand() < 0.5;

  let displayedAnswer: number;
  if (showCorrect) {
    displayedAnswer = correctSum;
  } else {
    // Generate a wrong answer (close to correct but different)
    const offset = Math.floor(rand() * 6) - 3; // -3 to +3
    displayedAnswer = correctSum + (offset === 0 ? 1 : offset);

    // Ensure it's positive and different from correct answer
    if (displayedAnswer <= 0) {
      displayedAnswer = correctSum + Math.floor(rand() * 3) + 1;
    }
    if (displayedAnswer === correctSum) {
      displayedAnswer = correctSum + 1;
    }
  }

  return {
    id,
    question: `${num1} + ${num2} = ${displayedAnswer}`,
    correctAnswer: showCorrect
  };
};

export const generateGameProblems = (count: number, seed?: string): MathProblem[] => {
  const rand = getRandomGenerator(seed);
  return Array.from({ length: count }, (_, i) =>
    generateMathProblem(`problem-${i + 1}`, rand)
  );
};

export const calculateScore = (problems: MathProblem[]): {
  score: number;
  accuracy: number;
  averageTime: number;
  correctAnswers: number;
} => {
  const answeredProblems = problems.filter(p => p.userAnswer !== undefined);
  const correctAnswers = answeredProblems.filter(p => p.isCorrect).length;
  const totalTime = answeredProblems.reduce((sum, p) => sum + (p.timeToAnswer || 0), 0);

  return {
    score: correctAnswers,
    accuracy: answeredProblems.length > 0 ? (correctAnswers / answeredProblems.length) * 100 : 0,
    averageTime: answeredProblems.length > 0 ? totalTime / answeredProblems.length : 0,
    correctAnswers
  };
};

