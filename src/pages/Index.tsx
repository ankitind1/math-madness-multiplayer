import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUrlParams } from "@/hooks/useUrlParams";
import { AuthScreen } from "@/components/AuthScreen";
import { ResetPasswordScreen } from "@/components/ResetPasswordScreen";
import { MainMenu } from "@/components/MainMenu";
import { GameScreen } from "@/components/GameScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { LeaderboardScreen } from "@/components/LeaderboardScreen";
import { MultiplayerScreen } from "@/components/MultiplayerScreen";
import { MatchResult } from "@/components/MatchResult";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MatchSettings, RoundResult } from "@/types/game";

type Screen = "menu" | "game" | "profile" | "leaderboard" | "multiplayer" | "match-result" | "reset-password";

const Index = () => {
  const { user, loading } = useAuth();
  const { getParam } = useUrlParams();
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [matchSettings, setMatchSettings] = useState<MatchSettings | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(1);
  const challengeToastShown = useRef(false);

  const getTotalRounds = useCallback((mode: MatchSettings["gameMode"] | undefined) => {
    switch (mode) {
      case "best-of-3":
        return 3;
      case "best-of-5":
        return 5;
      case "best-of-10":
        return 10;
      default:
        return 1;
    }
  }, []);


  const handleStartMatch = useCallback((settings: MatchSettings) => {
    setMatchSettings(settings);
    setTotalRounds(getTotalRounds(settings.gameMode));
    setRoundResults([]);
    setCurrentRound(0);
    setCurrentScreen("game");
  }, [getTotalRounds]);

  useEffect(() => {
    // Check for URL parameters on mount
    const challenge = getParam('challenge');
    const seed = getParam('seed');
    const start = getParam('start');
    const resetPassword = getParam('type') === 'recovery';

    if (challenge && !challengeToastShown.current) {
      challengeToastShown.current = true;
      setChallengeCode(challenge);
      toast.success(`Challenge received! Code: ${challenge}`);
      if (user && seed && start) {
        handleStartMatch({
          duration: 30,
          questionCount: 20,
          gameMode: '1v1',
          isPrivate: true,
          seed,
          startTime: parseInt(start, 10)
        });
        return;
      }
      if (user) {
        setCurrentScreen("multiplayer");
      }
    }

    if (resetPassword) {
      setCurrentScreen("reset-password");
    }
  }, [getParam, user, handleStartMatch]);

  const handleStartGame = () => {
    handleStartMatch({ duration: 30, questionCount: 20 });
  };

  const handleGameEnd = (result: RoundResult) => {
    setRoundResults(prev => [...prev, result]);
    if (currentRound + 1 < totalRounds) {
      setCurrentRound(prev => prev + 1);
      toast.success(`Round ${currentRound + 1} finished!`);
      setTimeout(() => setCurrentScreen("game"), 1000);
    } else {
      setCurrentScreen("match-result");
    }
  };

  const handlePlayAgain = () => {
    if (matchSettings) {
      handleStartMatch(matchSettings);
    }
  };

  const handleMainMenu = () => {
    setCurrentScreen("menu");
    setRoundResults([]);
    setCurrentRound(0);
    setTotalRounds(1);
    setMatchSettings(null);
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
            duration={matchSettings?.duration ?? 30}
            questionCount={matchSettings?.questionCount ?? 20}
            seed={matchSettings?.seed}
            startTime={matchSettings?.startTime}
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
            onStartMatch={handleStartMatch}
          />
        );
      
      case "match-result":
        return (
          <MatchResult
            rounds={roundResults}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
          />
        );
      
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
