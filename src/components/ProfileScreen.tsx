import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { PlayerStats } from "@/types/game";
import { ArrowLeft, Trophy, Target, Zap, Calendar } from "lucide-react";

interface ProfileScreenProps {
  onBack: () => void;
  stats?: PlayerStats;
}

export const ProfileScreen = ({ onBack, stats }: ProfileScreenProps) => {
  // Mock data for now - will be replaced with real data from Supabase
  const mockStats: PlayerStats = stats || {
    id: "player1",
    username: "MathMaster",
    totalGames: 45,
    gamesWon: 28,
    highestScore: 18,
    averageAccuracy: 85.2,
    fastestAnswer: 0.8,
    currentStreak: 3,
    longestStreak: 7
  };

  const winRate = mockStats.totalGames > 0 
    ? ((mockStats.gamesWon / mockStats.totalGames) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center mb-8">
        <GameButton onClick={onBack} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h1 className="text-3xl font-bold">Player Profile</h1>
      </div>

      {/* Profile Card */}
      <GameCard className="mb-6" glow>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              {mockStats.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{mockStats.username}</h2>
          <p className="text-muted-foreground">Math Battle Champion</p>
        </div>
      </GameCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GameCard className="text-center">
          <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{mockStats.gamesWon}</div>
          <div className="text-sm text-muted-foreground">Games Won</div>
          <div className="text-xs text-accent">{winRate}% win rate</div>
        </GameCard>

        <GameCard className="text-center">
          <Target className="w-8 h-8 text-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{mockStats.highestScore}</div>
          <div className="text-sm text-muted-foreground">Best Score</div>
          <div className="text-xs text-success">Personal best</div>
        </GameCard>

        <GameCard className="text-center">
          <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{mockStats.averageAccuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-xs text-secondary">Average</div>
        </GameCard>

        <GameCard className="text-center">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{mockStats.currentStreak}</div>
          <div className="text-sm text-muted-foreground">Win Streak</div>
          <div className="text-xs text-muted-foreground">Best: {mockStats.longestStreak}</div>
        </GameCard>
      </div>

      {/* Detailed Stats */}
      <GameCard>
        <h3 className="text-xl font-bold mb-4">Detailed Statistics</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Games Played</span>
            <span className="font-semibold">{mockStats.totalGames}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fastest Answer</span>
            <span className="font-semibold">{mockStats.fastestAnswer}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Win Rate</span>
            <span className="font-semibold">{winRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Longest Win Streak</span>
            <span className="font-semibold">{mockStats.longestStreak} games</span>
          </div>
        </div>
      </GameCard>

      {/* Achievements Preview */}
      <GameCard className="mt-6">
        <h3 className="text-xl font-bold mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Trophy className="w-6 h-6 text-accent" />
            <div>
              <div className="font-semibold">Speed Demon</div>
              <div className="text-sm text-muted-foreground">Answer 10 questions in under 1 second each</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Target className="w-6 h-6 text-success" />
            <div>
              <div className="font-semibold">Perfect Game</div>
              <div className="text-sm text-muted-foreground">Score 100% accuracy in a game</div>
            </div>
          </div>
        </div>
      </GameCard>
    </div>
  );
};