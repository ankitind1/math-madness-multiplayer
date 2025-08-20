import { MathProblem } from "@/types/game";

export const generateMathProblem = (id: string): MathProblem => {
  // Generate two random numbers for addition
  const num1 = Math.floor(Math.random() * 20) + 1; // 1-20
  const num2 = Math.floor(Math.random() * 20) + 1; // 1-20
  const correctSum = num1 + num2;
  
  // 50% chance to show correct answer, 50% chance to show wrong answer
  const showCorrect = Math.random() < 0.5;
  
  let displayedAnswer: number;
  if (showCorrect) {
    displayedAnswer = correctSum;
  } else {
    // Generate a wrong answer (close to correct but different)
    const offset = Math.floor(Math.random() * 6) - 3; // -3 to +3
    displayedAnswer = correctSum + (offset === 0 ? 1 : offset);
    
    // Ensure it's positive and different from correct answer
    if (displayedAnswer <= 0) displayedAnswer = correctSum + Math.floor(Math.random() * 3) + 1;
    if (displayedAnswer === correctSum) displayedAnswer = correctSum + 1;
  }

  return {
    id,
    question: `${num1} + ${num2} = ${displayedAnswer}`,
    correctAnswer: showCorrect
  };
};

export const generateGameProblems = (count: number): MathProblem[] => {
  return Array.from({ length: count }, (_, i) => 
    generateMathProblem(`problem-${i + 1}`)
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