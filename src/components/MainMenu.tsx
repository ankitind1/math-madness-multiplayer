import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { Trophy, Users, User, Settings } from "lucide-react";

interface MainMenuProps {
  onStartGame: () => void;
  onViewProfile: () => void;
  onViewLeaderboard: () => void;
  onMultiplayer: () => void;
}

export const MainMenu = ({ 
  onStartGame, 
  onViewProfile, 
  onViewLeaderboard,
  onMultiplayer 
}: MainMenuProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Math Battle
        </h1>
        <p className="text-xl text-muted-foreground">
          Fast math, faster thinking!
        </p>
      </div>

      {/* Main Menu Card */}
      <GameCard className="w-full max-w-md space-y-6" glow>
        <GameButton 
          variant="primary" 
          size="lg" 
          onClick={onStartGame}
          className="w-full"
        >
          🚀 Quick Match
        </GameButton>
        
        <GameButton 
          variant="secondary" 
          size="lg" 
          onClick={onMultiplayer}
          className="w-full flex items-center justify-center gap-3"
        >
          <Users className="w-6 h-6" />
          Multiplayer
        </GameButton>
        
        <div className="grid grid-cols-2 gap-4">
          <GameButton 
            variant="secondary" 
            onClick={onViewProfile}
            className="flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Profile
          </GameButton>
          
          <GameButton 
            variant="secondary" 
            onClick={onViewLeaderboard}
            className="flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </GameButton>
        </div>
      </GameCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <GameCard className="text-center py-4">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Games Won</div>
        </GameCard>
        
        <GameCard className="text-center py-4">
          <div className="text-2xl font-bold text-secondary">0</div>
          <div className="text-sm text-muted-foreground">Best Score</div>
        </GameCard>
        
        <GameCard className="text-center py-4">
          <div className="text-2xl font-bold text-accent">0</div>
          <div className="text-sm text-muted-foreground">Win Streak</div>
        </GameCard>
      </div>
    </div>
  );
};