import { useState, useEffect } from "react";
import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { ArrowLeft, Trophy, Medal, Award, Timer, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardScreenProps {
  onBack: () => void;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  total_games: number;
  games_won: number;
  highest_score: number;
  accuracy: number;
  current_win_streak: number;
  longest_win_streak: number;
  fastest_answer_time?: number;
  last_played: string;
}

export const LeaderboardScreen = ({ onBack }: LeaderboardScreenProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .order('games_won', { ascending: false })
        .order('highest_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLeaderboard(data || []);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground">{rank}</span>;
    }
  };

  const formatLastPlayed = (date: string) => {
    const now = new Date();
    const lastPlayed = new Date(date);
    const diffMs = now.getTime() - lastPlayed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <GameButton onClick={onBack} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {loading ? (
          <GameCard>
            <div className="text-center py-8">
              <div className="animate-pulse">Loading leaderboard...</div>
            </div>
          </GameCard>
        ) : leaderboard.length === 0 ? (
          <GameCard>
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No players yet. Be the first!</p>
            </div>
          </GameCard>
        ) : (
          leaderboard.map((player, index) => (
            <GameCard 
              key={player.user_id}
              className="hover:scale-[1.02] transition-transform"
              glow={index < 3}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getMedalIcon(index + 1)}
                </div>

                {/* Avatar */}
                {player.avatar_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={player.avatar_url} 
                      alt={player.display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                )}

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">
                    {player.display_name || 'Player'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last played: {formatLastPlayed(player.last_played)}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right space-y-1">
                  <div className="flex items-center gap-2 justify-end">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold">{player.games_won} wins</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground">
                    <Target className="w-3 h-3" />
                    <span>{player.accuracy}% accuracy</span>
                  </div>
                  {player.current_win_streak > 0 && (
                    <div className="flex items-center gap-2 justify-end text-sm text-accent">
                      <Zap className="w-3 h-3" />
                      <span>{player.current_win_streak} streak</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Games</div>
                  <div className="font-bold">{player.total_games}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">High Score</div>
                  <div className="font-bold">{player.highest_score}</div>
                </div>
                {player.fastest_answer_time && (
                  <div>
                    <div className="text-sm text-muted-foreground">Fastest</div>
                    <div className="font-bold">{player.fastest_answer_time.toFixed(1)}s</div>
                  </div>
                )}
              </div>
            </GameCard>
          ))
        )}
      </div>
    </div>
  );
};