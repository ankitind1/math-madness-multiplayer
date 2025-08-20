import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { Trophy, Target, Zap, Clock } from "lucide-react";

interface GameResultProps {
  score: number;
  accuracy: number;
  averageTime: number;
  correctAnswers: number;
  totalQuestions: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameResult = ({
  score,
  accuracy,
  averageTime,
  correctAnswers,
  totalQuestions,
  onPlayAgain,
  onMainMenu
}: GameResultProps) => {
  const isExcellent = accuracy >= 90;
  const isGood = accuracy >= 70;

  const getPerformanceMessage = () => {
    if (isExcellent) return "🎉 Excellent!";
    if (isGood) return "👏 Great job!";
    return "💪 Keep practicing!";
  };

  const getPerformanceColor = () => {
    if (isExcellent) return "text-success";
    if (isGood) return "text-primary";
    return "text-accent";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
      {/* Main Result Card */}
      <GameCard className="text-center w-full max-w-md" glow>
        <div className={`text-3xl font-bold mb-2 ${getPerformanceColor()}`}>
          {getPerformanceMessage()}
        </div>
        
        <div className="text-6xl font-bold text-primary mb-4">
          {score}
        </div>
        
        <div className="text-lg text-muted-foreground mb-6">
          out of {totalQuestions} questions
        </div>

        {/* Performance Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          isExcellent ? 'bg-success/10 text-success' :
          isGood ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
        }`}>
          <Trophy className="w-5 h-5" />
          <span className="font-semibold">
            {accuracy.toFixed(1)}% Accuracy
          </span>
        </div>
      </GameCard>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <GameCard className="text-center">
          <Target className="w-8 h-8 text-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{correctAnswers}</div>
          <div className="text-sm text-muted-foreground">Correct</div>
        </GameCard>

        <GameCard className="text-center">
          <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{averageTime.toFixed(1)}s</div>
          <div className="text-sm text-muted-foreground">Avg. Time</div>
        </GameCard>
      </div>

      {/* Progress Indicators */}
      <GameCard className="w-full max-w-md">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Accuracy</span>
              <span>{accuracy.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-full bg-gradient-success rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(accuracy, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Speed Score</span>
              <span>{averageTime < 2 ? "Fast" : averageTime < 4 ? "Good" : "Steady"}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-full bg-gradient-secondary rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (6 - averageTime) / 6 * 100))}%` 
                }}
              />
            </div>
          </div>
        </div>
      </GameCard>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full max-w-md">
        <GameButton
          variant="primary"
          size="lg"
          onClick={onPlayAgain}
          className="flex-1"
        >
          Play Again
        </GameButton>
        <GameButton
          variant="secondary"
          size="lg"
          onClick={onMainMenu}
          className="flex-1"
        >
          Main Menu
        </GameButton>
      </div>
    </div>
  );
};