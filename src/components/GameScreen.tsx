import { useState, useEffect } from "react";
import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { Timer } from "@/components/Timer";
import { MathProblem, GameState, RoundResult } from "@/types/game";
import { generateGameProblems, calculateScore } from "@/utils/mathGenerator";
import { useToast } from "@/hooks/use-toast";

interface GameScreenProps {
  onGameEnd: (result: RoundResult) => void;
  duration?: number;
  questionCount?: number;
  seed?: string;
  startTime?: number;
}

export const GameScreen = ({
  onGameEnd,
  duration = 30,
  questionCount = 20,
  seed,
  startTime
}: GameScreenProps) => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    currentProblem: 0,
    problems: [],
    score: 0,
    timeLeft: duration,
    isGameActive: false,
    isGameFinished: false,
    startTime: Date.now()
  });

  const [answerAnimation, setAnswerAnimation] = useState<string>("");
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);

  useEffect(() => {
    // Initialize game with optional seeded randomness
    const problems = generateGameProblems(questionCount, seed);
    setGameState(prev => ({
      ...prev,
      problems
    }));

    const now = Date.now();
    const delay = startTime ? Math.max(0, startTime - now) : 0;
    if (delay === 0) {
      setGameState(prev => ({
        ...prev,
        isGameActive: true,
        startTime: Date.now()
      }));
      return;
    }

    setTimeUntilStart(delay);
    const startTimer = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isGameActive: true,
        startTime: Date.now()
      }));
      setTimeUntilStart(0);
    }, delay);

    const interval = setInterval(() => {
      setTimeUntilStart(Math.max(0, (startTime || 0) - Date.now()));
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, [questionCount, seed, startTime]);

  const handleAnswer = (answer: boolean) => {
    if (!gameState.isGameActive || gameState.isGameFinished) return;

    const currentProblem = gameState.problems[gameState.currentProblem];
    if (!currentProblem) return;

    const timeToAnswer = (Date.now() - gameState.startTime) / 1000;
    const isCorrect = answer === currentProblem.correctAnswer;

    // Update current problem
    const updatedProblems = [...gameState.problems];
    updatedProblems[gameState.currentProblem] = {
      ...currentProblem,
      userAnswer: answer,
      isCorrect,
      timeToAnswer
    };

    // Animation feedback
    setAnswerAnimation(isCorrect ? "correct-answer" : "wrong-answer");
    setTimeout(() => setAnswerAnimation(""), 600);

    const newScore = isCorrect ? gameState.score + 1 : gameState.score;
    const nextProblem = gameState.currentProblem + 1;

    setGameState(prev => ({
      ...prev,
      problems: updatedProblems,
      score: newScore,
      currentProblem: nextProblem,
      startTime: Date.now() // Reset for next question
    }));

    // Check if game should end
    if (nextProblem >= questionCount) {
      endGame(updatedProblems);
    }
  };

  const endGame = (finalProblems?: MathProblem[]) => {
    const problems = finalProblems || gameState.problems;
    const result = calculateScore(problems);
    
    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      isGameFinished: true
    }));

    toast({
      title: "Game Over!",
      description: `You scored ${result.score} out of ${questionCount}!`
    });

    onGameEnd(result);
  };

  const handleTimeUp = () => {
    endGame();
  };

  const currentProblem = gameState.problems[gameState.currentProblem];

  if (!currentProblem || gameState.isGameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GameCard className="text-center">
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
          <p className="text-xl text-muted-foreground">
            Final Score: {gameState.score}
          </p>
        </GameCard>
      </div>
    );
  }

  if (!gameState.isGameActive && timeUntilStart > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GameCard className="text-center">
          <h2 className="text-3xl font-bold">Game starts in {Math.ceil(timeUntilStart / 1000)}</h2>
        </GameCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-lg">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Score</div>
          <div className="text-2xl font-bold text-primary">{gameState.score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Question</div>
          <div className="text-2xl font-bold">
            {gameState.currentProblem + 1}/{questionCount}
          </div>
        </div>
      </div>

      {/* Timer */}
      <Timer 
        duration={duration}
        onTimeUp={handleTimeUp}
        isActive={gameState.isGameActive}
      />

      {/* Math Problem */}
      <GameCard className={`text-center max-w-lg w-full ${answerAnimation}`} glow>
        <div className="text-5xl font-bold text-primary mb-8">
          {currentProblem.question}
        </div>
        <div className="text-xl text-muted-foreground mb-8">
          Is this correct?
        </div>
        
        {/* Answer Buttons */}
        <div className="flex gap-6 justify-center">
          <GameButton
            variant="success"
            size="lg"
            onClick={() => handleAnswer(true)}
            className="min-w-[120px]"
          >
            ✓ Correct
          </GameButton>
          <GameButton
            variant="error"
            size="lg"
            onClick={() => handleAnswer(false)}
            className="min-w-[120px]"
          >
            ✗ Wrong
          </GameButton>
        </div>
      </GameCard>

      {/* Progress Bar */}
      <div className="w-full max-w-lg bg-muted rounded-full h-2">
        <div 
          className="h-full bg-gradient-primary rounded-full transition-all duration-300"
          style={{ 
            width: `${((gameState.currentProblem) / questionCount) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};