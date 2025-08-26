import { useState, useEffect } from "react";
import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { ArrowLeft, Users, Copy, Share, UserCircle, Play, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLobby } from "@/hooks/useLobby";

interface LobbyScreenProps {
  code?: string;
  onBack: () => void;
  onStartMatch: (settings: any) => void;
}

export const LobbyScreen = ({ code, onBack, onStartMatch }: LobbyScreenProps) => {
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState("");
  const { 
    lobby, 
    participants, 
    isHost, 
    isLoading, 
    error,
    createLobby,
    joinLobby,
    startMatch,
    leaveLobby
  } = useLobby(code);

  useEffect(() => {
    const handleLobbyStart = (event: CustomEvent) => {
      if (event.detail) {
        onStartMatch({
          duration: 30,
          questionCount: 20,
          gameMode: '1v1',
          isPrivate: true,
          seed: event.detail.seed,
          startTime: event.detail.startTime
        });
      }
    };

    window.addEventListener('lobby-start' as any, handleLobbyStart);
    return () => {
      window.removeEventListener('lobby-start' as any, handleLobbyStart);
    };
  }, [onStartMatch]);

  const handleCreateLobby = async () => {
    const newCode = await createLobby();
    if (newCode) {
      toast({
        title: "Lobby Created!",
        description: `Share code: ${newCode}`
      });
    }
  };

  const handleJoinLobby = async () => {
    if (!joinCode) return;
    const success = await joinLobby(joinCode);
    if (success) {
      toast({
        title: "Joined!",
        description: "You've joined the lobby"
      });
    }
  };

  const handleStartGame = () => {
    if (participants.length < 2) {
      toast({
        title: "Need more players",
        description: "At least 2 players required to start",
        variant: "destructive"
      });
      return;
    }
    startMatch();
  };

  const copyCode = () => {
    if (lobby?.code) {
      navigator.clipboard.writeText(lobby.code);
      toast({
        title: "Copied!",
        description: "Lobby code copied to clipboard"
      });
    }
  };

  const handleBack = () => {
    leaveLobby();
    onBack();
  };

  if (!lobby) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center mb-8">
          <GameButton onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </GameButton>
          <h1 className="text-3xl font-bold">Multiplayer Lobby</h1>
        </div>

        <GameCard className="mb-6">
          <div className="text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Create Lobby</h3>
            <p className="text-muted-foreground mb-6">
              Host a game and invite friends
            </p>
            <GameButton
              variant="primary"
              size="lg"
              onClick={handleCreateLobby}
              disabled={isLoading}
              className="w-full"
            >
              Create New Lobby
            </GameButton>
          </div>
        </GameCard>

        <GameCard>
          <div className="text-center">
            <Share className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Join Lobby</h3>
            <p className="text-muted-foreground mb-6">
              Enter a code to join a friend's game
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="w-full px-4 py-2 mb-4 text-center text-xl font-mono bg-background border rounded"
              maxLength={8}
            />
            <GameButton
              variant="secondary"
              size="lg"
              onClick={handleJoinLobby}
              disabled={isLoading || !joinCode}
              className="w-full"
            >
              Join Lobby
            </GameButton>
          </div>
        </GameCard>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center mb-8">
        <GameButton onClick={handleBack} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h1 className="text-3xl font-bold">Lobby: {lobby.code}</h1>
      </div>

      <GameCard className="mb-6" glow>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Invite Code</h3>
          <GameButton onClick={copyCode} size="sm">
            <Copy className="w-4 h-4" />
          </GameButton>
        </div>
        <div className="text-3xl font-mono font-bold text-center bg-muted p-4 rounded">
          {lobby.code}
        </div>
      </GameCard>

      <GameCard className="mb-6">
        <h3 className="text-xl font-bold mb-4">Players ({participants.length})</h3>
        <div className="space-y-3">
          {participants.map((player) => (
            <div key={player.id} className="flex items-center gap-3">
              {player.avatar_url ? (
                <img
                  src={player.avatar_url}
                  alt={player.display_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <UserCircle className="w-10 h-10 text-muted-foreground" />
              )}
              <div className="flex-1">
                <div className="font-bold">{player.display_name}</div>
                {player.id === lobby.owner_user_id && (
                  <div className="text-xs text-primary">Host</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </GameCard>

      {isHost ? (
        <GameButton
          variant="primary"
          size="lg"
          onClick={handleStartGame}
          disabled={participants.length < 2}
          className="w-full flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start Match
        </GameButton>
      ) : (
        <div className="text-center p-4 bg-muted rounded">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Waiting for host to start...</p>
        </div>
      )}
    </div>
  );
};