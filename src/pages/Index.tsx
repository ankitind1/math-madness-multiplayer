import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUrlParams } from "@/hooks/useUrlParams";
import { AuthScreen } from "@/components/AuthScreen";
import { ResetPasswordScreen } from "@/components/ResetPasswordScreen";
import { MainMenu } from "@/components/MainMenu";
import { GameScreen } from "@/components/GameScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { LeaderboardScreen } from "@/components/LeaderboardScreen";
import { MultiplayerScreen } from "@/components/MultiplayerScreen";
import { GameResult } from "@/components/GameResult";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Screen = "menu" | "game" | "profile" | "leaderboard" | "multiplayer" | "result" | "reset-password";

const Index = () => {
  const { user, loading } = useAuth();
  const { getParam } = useUrlParams();
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [gameResult, setGameResult] = useState<any>(null);
  const [challengeCode, setChallengeCode] = useState<string | null>(null);

  // Debug logging
  console.log('🎮 Index render - loading:', loading, 'user:', !!user, 'screen:', currentScreen);

  useEffect(() => {
    // Check for URL parameters on mount
    const challenge = getParam('challenge');
    const resetPassword = getParam('type') === 'recovery';
    
    if (challenge) {
      setChallengeCode(challenge);
      toast.success(`Challenge received! Code: ${challenge}`);
      // Auto-navigate to multiplayer if user is authenticated
      if (user) {
        setCurrentScreen("multiplayer");
      }
    }
    
    if (resetPassword) {
      setCurrentScreen("reset-password");
    }
  }, [getParam, user]);

  const handleStartGame = () => {
    setCurrentScreen("game");
  };

  const handleGameEnd = (result: any) => {
    setGameResult(result);
    setCurrentScreen("result");
  };

  const handlePlayAgain = () => {
    setCurrentScreen("game");
  };

  const handleMainMenu = () => {
    setCurrentScreen("menu");
    setGameResult(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "menu":
        return (
          <MainMenu
            onStartGame={handleStartGame}
            onViewProfile={() => setCurrentScreen("profile")}
            onViewLeaderboard={() => setCurrentScreen("leaderboard")}
            onMultiplayer={() => setCurrentScreen("multiplayer")}
          />
        );
      
      case "game":
        return (
          <GameScreen
            onGameEnd={handleGameEnd}
            duration={30}
            questionCount={20}
          />
        );
      
      case "profile":
        return (
          <ProfileScreen
            onBack={() => setCurrentScreen("menu")}
          />
        );
      
      case "leaderboard":
        return (
          <LeaderboardScreen
            onBack={() => setCurrentScreen("menu")}
          />
        );
      
      case "multiplayer":
        return (
          <MultiplayerScreen
            onBack={() => setCurrentScreen("menu")}
            onStartMatch={handleStartGame}
          />
        );
      
      case "result":
        return gameResult ? (
          <GameResult
            score={gameResult.score}
            accuracy={gameResult.accuracy}
            averageTime={gameResult.averageTime}
            correctAnswers={gameResult.correctAnswers}
            totalQuestions={20}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
          />
        ) : null;
      
      case "reset-password":
        return (
          <ResetPasswordScreen
            onComplete={() => setCurrentScreen("menu")}
          />
        );
      
      default:
        return <div>Screen not found</div>;
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth screen if not authenticated (unless it's a password reset)
  if (!user && currentScreen !== "reset-password") {
    return <AuthScreen onAuthSuccess={() => {
      setCurrentScreen("menu");
      // If there was a challenge code, show it and navigate to multiplayer
      if (challengeCode) {
        setTimeout(() => {
          setCurrentScreen("multiplayer");
          toast.success(`Ready to accept challenge: ${challengeCode}`);
        }, 1000);
      }
    }} />;
  }

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default Index;
