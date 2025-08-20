import { useState } from "react";
import { MainMenu } from "@/components/MainMenu";
import { GameScreen } from "@/components/GameScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { LeaderboardScreen } from "@/components/LeaderboardScreen";
import { MultiplayerScreen } from "@/components/MultiplayerScreen";
import { GameResult } from "@/components/GameResult";

type Screen = "menu" | "game" | "profile" | "leaderboard" | "multiplayer" | "result";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [gameResult, setGameResult] = useState<any>(null);

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
      
      default:
        return <div>Screen not found</div>;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default Index;
