import { useState, useEffect } from "react";
import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { ArrowLeft, Users, Copy, Share, ExternalLink, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLobby } from "@/hooks/useLobby";

interface MultiplayerScreenProps {
  onBack: () => void;
  onStartMatch: (settings: any) => void;
  onStartParty?: () => void;
}

export const MultiplayerScreen = ({ onBack, onStartMatch, onStartParty }: MultiplayerScreenProps) => {
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<"1v1" | "best-of-3" | "best-of-5" | "best-of-10">("1v1");
  const [inviteCode] = useState("MATH" + Math.random().toString(36).substr(2, 4).toUpperCase());
  // Start time 30 seconds in the future to allow friends to join
  const [startTime] = useState<number>(() => Date.now() + 30000);
  const challengeUrl = `${window.location.origin}/?challenge=${inviteCode}&seed=${inviteCode}&start=${startTime}`;

  const handleQuickMatch = () => {
    onStartMatch({
      duration: 30,
      questionCount: 20,
      gameMode: selectedMode,
      isPrivate: false,
      seed: Math.random().toString(36).slice(2),
      startTime: Date.now() + 3000
    });
  };

  const handlePrivateMatch = () => {
    onStartMatch({
      duration: 30,
      questionCount: 20,
      gameMode: selectedMode,
      isPrivate: true,
      inviteCode,
      seed: inviteCode,
      startTime
    });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard"
    });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(challengeUrl);
    toast({
      title: "Copied!",
      description: "Challenge link copied to clipboard"
    });
  };

  const shareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Math Battle Challenge',
        text: `Join my Math Battle game!`,
        url: challengeUrl
      });
    } else {
      copyInviteLink();
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center mb-8">
        <GameButton onClick={onBack} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h1 className="text-3xl font-bold">Multiplayer</h1>
      </div>

      {/* Game Mode Selection */}
      <GameCard className="mb-6">
        <h3 className="text-xl font-bold mb-4">Select Game Mode</h3>
        <div className="grid grid-cols-2 gap-3">
          <GameButton
            variant={selectedMode === "1v1" ? "primary" : "secondary"}
            onClick={() => setSelectedMode("1v1")}
            className="w-full"
          >
            1v1 Quick
          </GameButton>
          <GameButton
            variant={selectedMode === "best-of-3" ? "primary" : "secondary"}
            onClick={() => setSelectedMode("best-of-3")}
            className="w-full"
          >
            Best of 3
          </GameButton>
          <GameButton
            variant={selectedMode === "best-of-5" ? "primary" : "secondary"}
            onClick={() => setSelectedMode("best-of-5")}
            className="w-full"
          >
            Best of 5
          </GameButton>
          <GameButton
            variant={selectedMode === "best-of-10" ? "primary" : "secondary"}
            onClick={() => setSelectedMode("best-of-10")}
            className="w-full"
          >
            Best of 10
          </GameButton>
        </div>
      </GameCard>

      {/* Party Mode */}
      {onStartParty && (
        <GameCard className="mb-6" glow>
          <div className="text-center">
            <QrCode className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Party Mode</h3>
            <p className="text-muted-foreground mb-6">
              Host a game where guests can join without signing in
            </p>
            <GameButton
              variant="primary"
              size="lg"
              onClick={onStartParty}
              className="w-full"
            >
              🎉 Host Party (QR)
            </GameButton>
          </div>
        </GameCard>
      )}

      {/* Quick Match */}
      <GameCard className="mb-6">
        <div className="text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Quick Match</h3>
          <p className="text-muted-foreground mb-6">
            Get matched with a random player instantly
          </p>
          <GameButton
            variant="primary"
            size="lg"
            onClick={handleQuickMatch}
            className="w-full"
          >
            🚀 Find Match
          </GameButton>
        </div>
      </GameCard>

      {/* Private Match */}
      <GameCard>
        <div className="text-center">
          <Share className="w-12 h-12 text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Play with Friends</h3>
          <p className="text-muted-foreground mb-6">
            Create a private match and invite your friends
          </p>
          
          {/* Invite Code */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="text-sm text-muted-foreground mb-2">Invite Code</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-2xl font-mono font-bold bg-background rounded px-4 py-2">
                {inviteCode}
              </div>
              <GameButton onClick={copyInviteCode} size="sm">
                <Copy className="w-4 h-4" />
              </GameButton>
            </div>
          </div>

          {/* Challenge Link */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="text-sm text-muted-foreground mb-2">Challenge Link</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm bg-background rounded px-3 py-2 break-all">
                {challengeUrl}
              </div>
              <GameButton onClick={copyInviteLink} size="sm">
                <ExternalLink className="w-4 h-4" />
              </GameButton>
            </div>
          </div>

          <div className="flex gap-3">
            <GameButton
              variant="secondary"
              onClick={shareInvite}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </GameButton>
            <GameButton
              variant="primary"
              onClick={handlePrivateMatch}
              className="flex-1"
            >
              Create Match
            </GameButton>
          </div>
        </div>
      </GameCard>

      {/* Game Rules */}
      <GameCard className="mt-6">
        <h3 className="text-xl font-bold mb-4">Game Rules</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Each round lasts 30 seconds</li>
          <li>• Answer as many questions as possible</li>
          <li>• Both players see the same questions</li>
          <li>• Higher score wins the round</li>
          <li>• First to win the required rounds wins the match</li>
        </ul>
      </GameCard>
    </div>
  );
};