import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import type { RoundResult } from "@/types/game";

interface MatchResultProps {
  rounds: RoundResult[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const MatchResult = ({ rounds, onPlayAgain, onMainMenu }: MatchResultProps) => {
  const totalScore = rounds.reduce((sum, r) => sum + r.score, 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
      <GameCard className="w-full max-w-md text-center" glow>
        <h2 className="text-3xl font-bold mb-4">Match Summary</h2>
        <div className="space-y-2 mb-4">
          {rounds.map((r, i) => (
            <div key={i} className="flex justify-between">
              <span>Round {i + 1}</span>
              <span className="font-bold">{r.score}</span>
            </div>
          ))}
        </div>
        <div className="text-lg font-bold">Total Score: {totalScore}</div>
      </GameCard>
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
