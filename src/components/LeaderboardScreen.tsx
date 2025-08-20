import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { ArrowLeft, Trophy, Medal, Crown } from "lucide-react";
import { PlayerStats } from "@/types/game";

interface LeaderboardScreenProps {
  onBack: () => void;
}

export const LeaderboardScreen = ({ onBack }: LeaderboardScreenProps) => {
  // Mock leaderboard data - will be replaced with real data from Supabase
  const mockLeaderboard: (PlayerStats & { rank: number })[] = [
    {
      rank: 1,
      id: "player1",
      username: "SpeedMaster",
      totalGames: 120,
      gamesWon: 95,
      highestScore: 20,
      averageAccuracy: 95.8,
      fastestAnswer: 0.5,
      currentStreak: 12,
      longestStreak: 18
    },
    {
      rank: 2,
      id: "player2", 
      username: "MathWiz",
      totalGames: 89,
      gamesWon: 71,
      highestScore: 19,
      averageAccuracy: 92.3,
      fastestAnswer: 0.7,
      currentStreak: 5,
      longestStreak: 15
    },
    {
      rank: 3,
      id: "player3",
      username: "QuickThink",
      totalGames: 76,
      gamesWon: 58,
      highestScore: 18,
      averageAccuracy: 89.1,
      fastestAnswer: 0.6,
      currentStreak: 8,
      longestStreak: 12
    },
    {
      rank: 4,
      id: "player4",
      username: "CalcGuru",
      totalGames: 65,
      gamesWon: 48,
      highestScore: 17,
      averageAccuracy: 86.7,
      fastestAnswer: 0.9,
      currentStreak: 3,
      longestStreak: 9
    },
    {
      rank: 5,
      id: "player5",
      username: "NumberNinja",
      totalGames: 54,
      gamesWon: 38,
      highestScore: 16,
      averageAccuracy: 84.2,
      fastestAnswer: 1.1,
      currentStreak: 1,
      longestStreak: 7
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center mb-8">
        <GameButton onClick={onBack} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <GameButton variant="primary" size="sm" className="flex-1">
          Global
        </GameButton>
        <GameButton variant="secondary" size="sm" className="flex-1">
          Friends
        </GameButton>
        <GameButton variant="secondary" size="sm" className="flex-1">
          Weekly
        </GameButton>
      </div>

      {/* Top 3 Podium */}
      <GameCard className="mb-6" glow>
        <div className="flex justify-center items-end gap-4 mb-4">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-secondary rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-lg font-bold text-secondary-foreground">
                {mockLeaderboard[1].username.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <Medal className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <div className="font-bold">{mockLeaderboard[1].username}</div>
            <div className="text-sm text-muted-foreground">{mockLeaderboard[1].highestScore} pts</div>
          </div>

          {/* 1st Place - Taller */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">
                {mockLeaderboard[0].username.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-1" />
            <div className="font-bold text-lg">{mockLeaderboard[0].username}</div>
            <div className="text-sm text-muted-foreground">{mockLeaderboard[0].highestScore} pts</div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-accent rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-lg font-bold text-accent-foreground">
                {mockLeaderboard[2].username.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <Medal className="w-8 h-8 text-amber-600 mx-auto mb-1" />
            <div className="font-bold">{mockLeaderboard[2].username}</div>
            <div className="text-sm text-muted-foreground">{mockLeaderboard[2].highestScore} pts</div>
          </div>
        </div>
      </GameCard>

      {/* Full Leaderboard */}
      <div className="space-y-3">
        {mockLeaderboard.map((player) => (
          <GameCard key={player.id} className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              player.rank <= 3 ? 'bg-gradient-primary' : 'bg-muted'
            }`}>
              {player.rank <= 3 ? (
                getRankIcon(player.rank)
              ) : (
                <span className="font-bold text-muted-foreground">#{player.rank}</span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="font-bold">{player.username}</div>
              <div className="text-sm text-muted-foreground">
                {player.gamesWon}/{player.totalGames} wins • {player.averageAccuracy.toFixed(1)}% accuracy
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{player.highestScore}</div>
              <div className="text-sm text-muted-foreground">best score</div>
            </div>
          </GameCard>
        ))}
      </div>

      {/* Your Rank */}
      <GameCard className="mt-6 border-2 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary">
            <span className="font-bold text-primary-foreground">#42</span>
          </div>
          <div className="flex-1">
            <div className="font-bold">You (MathMaster)</div>
            <div className="text-sm text-muted-foreground">
              28/45 wins • 85.2% accuracy
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">18</div>
            <div className="text-sm text-muted-foreground">best score</div>
          </div>
        </div>
      </GameCard>
    </div>
  );
};