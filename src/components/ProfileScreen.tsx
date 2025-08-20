import { useState, useEffect } from "react";
import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { ArrowLeft, Trophy, Target, Zap, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProfileScreenProps {
  onBack: () => void;
}

interface UserStats {
  username: string;
  display_name: string;
  total_games: number;
  games_won: number;
  highest_score: number;
  current_win_streak: number;
  longest_win_streak: number;
  total_correct_answers: number;
  total_questions_answered: number;
  fastest_answer_time: number;
}

export const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('get_user_stats', {
          target_user_id: user.id
        });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setUserStats(data[0]);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-lg">Profile data not available</div>
      </div>
    );
  }

  const winRate = userStats.total_games > 0 
    ? ((userStats.games_won / userStats.total_games) * 100).toFixed(1)
    : "0";
  
  const accuracy = userStats.total_questions_answered > 0
    ? ((userStats.total_correct_answers / userStats.total_questions_answered) * 100).toFixed(1)
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
              {userStats.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{userStats.display_name || userStats.username}</h2>
          <p className="text-muted-foreground">Math Battle Champion</p>
        </div>
      </GameCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GameCard className="text-center">
          <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{userStats.games_won}</div>
          <div className="text-sm text-muted-foreground">Games Won</div>
          <div className="text-xs text-accent">{winRate}% win rate</div>
        </GameCard>

        <GameCard className="text-center">
          <Target className="w-8 h-8 text-success mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{userStats.highest_score}</div>
          <div className="text-sm text-muted-foreground">Best Score</div>
          <div className="text-xs text-success">Personal best</div>
        </GameCard>

        <GameCard className="text-center">
          <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-xs text-secondary">Average</div>
        </GameCard>

        <GameCard className="text-center">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-primary">{userStats.current_win_streak}</div>
          <div className="text-sm text-muted-foreground">Win Streak</div>
          <div className="text-xs text-muted-foreground">Best: {userStats.longest_win_streak}</div>
        </GameCard>
      </div>

      {/* Detailed Stats */}
      <GameCard>
        <h3 className="text-xl font-bold mb-4">Detailed Statistics</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Games Played</span>
            <span className="font-semibold">{userStats.total_games}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fastest Answer</span>
            <span className="font-semibold">{userStats.fastest_answer_time ? userStats.fastest_answer_time.toFixed(2) + 's' : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Win Rate</span>
            <span className="font-semibold">{winRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Longest Win Streak</span>
            <span className="font-semibold">{userStats.longest_win_streak} games</span>
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