import { useState, useEffect, useRef } from "react";
import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { Timer } from "@/components/Timer";
import { useToast } from "@/hooks/use-toast";
import { generateDeterministicProblems, DeterministicProblem } from "@/utils/deterministicQuestions";
import { X, CheckCircle } from "lucide-react";

interface SurvivalGameScreenProps {
  onGameEnd: (result: any) => void;
  duration?: number;
  seed: string;
  startTime: number;
  gameMode?: 'classic' | 'survival-30s';
}

interface SurvivalGameState {
  currentProblemIndex: number;
  problems: DeterministicProblem[];
  correctCount: number;
  isEliminated: boolean;
  eliminatedAt?: number;
  isGameActive: boolean;
  isGameFinished: boolean;
  startTime: number;
}

export const SurvivalGameScreen = ({
  onGameEnd,
  duration = 30,
  seed,
  startTime,
  gameMode = 'survival-30s'
}: SurvivalGameScreenProps) => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<SurvivalGameState>({
    currentProblemIndex: 0,
    problems: [],
    correctCount: 0,
    isEliminated: false,
    isGameActive: false,
    isGameFinished: false,
    startTime
  });

  const [answerAnimation, setAnswerAnimation] = useState<string>("");
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const answeredProblems = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Generate deterministic problems from seed
    const problems = generateDeterministicProblems(seed, 1000);
    setGameState(prev => ({
      ...prev,
      problems
    }));

    const now = Date.now();
    const delay = Math.max(0, startTime - now);
    
    if (delay > 0) {
      setTimeUntilStart(Math.ceil(delay / 1000));
      const countdownInterval = setInterval(() => {
        const remaining = Math.max(0, startTime - Date.now());
        setTimeUntilStart(Math.ceil(remaining / 1000));
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          setGameState(prev => ({
            ...prev,
            isGameActive: true,
            startTime
          }));
        }
      }, 100);

      return () => clearInterval(countdownInterval);
    } else {
      setGameState(prev => ({
        ...prev,
        isGameActive: true,
        startTime
      }));
    }
  }, [seed, startTime]);

  const handleAnswer = (answer: boolean) => {
    if (gameState.isEliminated || gameState.isGameFinished || !gameState.isGameActive) return;
    
    const currentProblem = gameState.problems[gameState.currentProblemIndex];
    if (!currentProblem || answeredProblems.current.has(gameState.currentProblemIndex)) return;
    
    answeredProblems.current.add(gameState.currentProblemIndex);
    const isCorrect = answer === currentProblem.correctAnswer;
    
    if (gameMode === 'survival-30s' && !isCorrect) {
      // Eliminated on wrong answer in survival mode
      setAnswerAnimation("wrong-shake");
      setGameState(prev => ({
        ...prev,
        isEliminated: true,
        eliminatedAt: prev.currentProblemIndex,
        isGameActive: false
      }));
      
      toast({
        title: "Eliminated!",
        description: `You got ${gameState.correctCount} correct before making a mistake`,
        variant: "destructive"
      });
      
      // End game immediately for eliminated player
      setTimeout(() => {
        endGame();
      }, 1500);
    } else if (isCorrect) {
      // Correct answer
      setAnswerAnimation("correct-pulse");
      setGameState(prev => ({
        ...prev,
        correctCount: prev.correctCount + 1,
        currentProblemIndex: prev.currentProblemIndex + 1
      }));
    } else if (gameMode === 'classic') {
      // Wrong answer in classic mode (just move to next)
      setAnswerAnimation("wrong-shake");
      setGameState(prev => ({
        ...prev,
        currentProblemIndex: prev.currentProblemIndex + 1
      }));
    }
    
    // Clear animation
    setTimeout(() => setAnswerAnimation(""), 300);
  };

  const handleTimeUp = () => {
    if (!gameState.isGameFinished) {
      endGame();
    }
  };

  const endGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      isGameFinished: true
    }));

    const result = {
      score: gameState.correctCount,
      accuracy: gameState.currentProblemIndex > 0 
        ? Math.round((gameState.correctCount / gameState.currentProblemIndex) * 100)
        : 0,
      averageTime: gameState.currentProblemIndex > 0
        ? duration / gameState.currentProblemIndex
        : 0,
      correctAnswers: gameState.correctCount,
      totalQuestions: gameState.currentProblemIndex,
      isEliminated: gameState.isEliminated,
      eliminatedAt: gameState.eliminatedAt,
      gameMode
    };

    toast({
      title: "Game Over!",
      description: `You got ${gameState.correctCount} correct!`
    });

    onGameEnd(result);
  };

  // Countdown before game starts
  if (timeUntilStart > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GameCard className="text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Get Ready!</h2>
          <div className="text-6xl font-bold text-primary animate-pulse">
            {timeUntilStart}
          </div>
          <p className="text-muted-foreground mt-4">
            {gameMode === 'survival-30s' 
              ? "One wrong answer = elimination!"
              : "Answer as many as you can!"}
          </p>
        </GameCard>
      </div>
    );
  }

  // Game over screen
  if (gameState.isGameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GameCard className="text-center max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
          <div className="text-5xl font-bold text-primary mb-2">
            {gameState.correctCount}
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Correct Answers
          </p>
          {gameState.isEliminated && (
            <p className="text-destructive mb-4">
              Eliminated at question #{(gameState.eliminatedAt || 0) + 1}
            </p>
          )}
          <div className="text-muted-foreground">
            Waiting for all players to finish...
          </div>
        </GameCard>
      </div>
    );
  }

  // Eliminated screen (waiting for timer)
  if (gameState.isEliminated && gameMode === 'survival-30s') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GameCard className="text-center max-w-md w-full">
          <X className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Eliminated!</h2>
          <div className="text-5xl font-bold text-primary mb-2">
            {gameState.correctCount}
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Correct Answers
          </p>
          <p className="text-muted-foreground">
            You were eliminated at question #{(gameState.eliminatedAt || 0) + 1}
          </p>
          <div className="mt-6">
            <Timer
              duration={duration}
              onTimeUp={handleTimeUp}
              isActive={true}
              startTime={startTime}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Waiting for round to end...
          </p>
        </GameCard>
      </div>
    );
  }

  const currentProblem = gameState.problems[gameState.currentProblemIndex];
  const progress = ((gameState.currentProblemIndex) / gameState.problems.length) * 100;

  return (
    <div className="min-h-screen p-4">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{gameState.correctCount}</div>
          <div className="text-sm text-muted-foreground">Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold">
            Question {gameState.currentProblemIndex + 1}
          </div>
          {gameMode === 'survival-30s' && (
            <div className="text-xs text-accent">One mistake = OUT!</div>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-secondary">
            {Math.round((gameState.correctCount / Math.max(1, gameState.currentProblemIndex)) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
      </div>

      {/* Timer */}
      <div className="mb-8">
        <Timer
          duration={duration}
          onTimeUp={handleTimeUp}
          isActive={gameState.isGameActive}
          startTime={startTime}
        />
      </div>

      {/* Question */}
      {currentProblem && (
        <GameCard className={`mb-8 ${answerAnimation}`} glow>
          <div className="text-center py-8">
            <div className="text-4xl md:text-5xl font-bold mb-8">
              {currentProblem.question}
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => handleAnswer(true)}
                className="flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Correct
              </GameButton>
              <GameButton
                variant="secondary"
                size="lg"
                onClick={() => handleAnswer(false)}
                className="flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <X className="w-5 h-5" />
                Wrong
              </GameButton>
            </div>
          </div>
        </GameCard>
      )}

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

    </div>
  );
};