import { useState, useEffect } from "react";
import { GameCard } from "@/components/GameCard";
import { GameButton } from "@/components/GameButton";
import { ArrowLeft, Users, Play, Clock, QrCode, Copy, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePartyLobby } from "@/hooks/usePartyLobby";
import QRCode from "qrcode";

interface PartyLobbyScreenProps {
  code?: string;
  isGuest?: boolean;
  onBack: () => void;
  onStartMatch: (settings: any) => void;
}

export const PartyLobbyScreen = ({ code, isGuest, onBack, onStartMatch }: PartyLobbyScreenProps) => {
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showJoinForm, setShowJoinForm] = useState(!code);
  
  const { 
    lobbyCode, 
    participants, 
    isHost, 
    isLoading, 
    error,
    settings,
    qrUrl,
    createPartyLobby,
    joinAsGuest,
    joinAsUser,
    updateSettings,
    startMatch,
    leaveLobby,
    isInLobby
  } = usePartyLobby();

  // Handle party start event
  useEffect(() => {
    const handlePartyStart = (event: CustomEvent) => {
      if (event.detail) {
        onStartMatch({
          duration: event.detail.settings.duration,
          questionCount: event.detail.settings.questionCount,
          gameMode: event.detail.gameMode,
          isPrivate: true,
          seed: event.detail.seed,
          startTime: event.detail.startTime,
          isSurvival: event.detail.gameMode === 'survival-30s'
        });
      }
    };

    window.addEventListener('party-start' as any, handlePartyStart);
    return () => {
      window.removeEventListener('party-start' as any, handlePartyStart);
    };
  }, [onStartMatch]);

  // Auto-join if code provided
  useEffect(() => {
    if (code && !isInLobby) {
      if (isGuest) {
        setShowJoinForm(true);
      } else {
        joinAsUser(code);
      }
    }
  }, [code, isGuest, isInLobby]);

  // Generate QR code
  useEffect(() => {
    if (qrUrl) {
      QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [qrUrl]);

  const handleCreateParty = async () => {
    const newCode = await createPartyLobby();
    if (newCode) {
      updateSettings({ allowGuests: true, gameMode: 'survival-30s' });
      toast({
        title: "Party Created!",
        description: `Share code: ${newCode}`
      });
    }
  };

  const handleJoinAsGuest = async () => {
    const targetCode = code || joinCode;
    if (!targetCode || !guestName.trim()) return;
    
    const success = await joinAsGuest(targetCode, guestName);
    if (success) {
      setShowJoinForm(false);
      toast({
        title: "Joined!",
        description: "You've joined the party"
      });
    }
  };

  const handleJoinAsUser = async () => {
    const targetCode = code || joinCode;
    if (!targetCode) return;
    
    const success = await joinAsUser(targetCode);
    if (success) {
      setShowJoinForm(false);
      toast({
        title: "Joined!",
        description: "You've joined the party"
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
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      toast({
        title: "Copied!",
        description: "Party code copied to clipboard"
      });
    }
  };

  const copyLink = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      toast({
        title: "Copied!",
        description: "Party link copied to clipboard"
      });
    }
  };

  const handleBack = () => {
    leaveLobby();
    onBack();
  };

  // Show join form for guests
  if (showJoinForm && (isGuest || !lobbyCode)) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center mb-8">
          <GameButton onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </GameButton>
          <h1 className="text-3xl font-bold">Join Party</h1>
        </div>

        <GameCard className="max-w-md mx-auto">
          <div className="text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            {isGuest ? (
              <>
                <h3 className="text-xl font-bold mb-2">Enter Your Name</h3>
                <p className="text-muted-foreground mb-6">
                  Join the party without signing in
                </p>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 mb-4 text-center text-xl bg-background border rounded"
                  maxLength={20}
                  autoFocus
                />
                {!code && (
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Party code"
                    className="w-full px-4 py-2 mb-4 text-center text-xl font-mono bg-background border rounded"
                    maxLength={6}
                  />
                )}
                <GameButton
                  variant="primary"
                  size="lg"
                  onClick={handleJoinAsGuest}
                  disabled={isLoading || !guestName.trim() || (!code && !joinCode)}
                  className="w-full"
                >
                  Join as Guest
                </GameButton>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">Join Party</h3>
                <p className="text-muted-foreground mb-6">
                  Enter the party code to join
                </p>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Party code"
                  className="w-full px-4 py-2 mb-4 text-center text-xl font-mono bg-background border rounded"
                  maxLength={6}
                  autoFocus
                />
                <GameButton
                  variant="primary"
                  size="lg"
                  onClick={handleJoinAsUser}
                  disabled={isLoading || !joinCode}
                  className="w-full"
                >
                  Join Party
                </GameButton>
              </>
            )}
          </div>
        </GameCard>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Show create party screen
  if (!isInLobby) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center mb-8">
          <GameButton onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </GameButton>
          <h1 className="text-3xl font-bold">Party Mode</h1>
        </div>

        <GameCard className="mb-6">
          <div className="text-center">
            <QrCode className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Host a Party</h3>
            <p className="text-muted-foreground mb-6">
              Create a game that anyone can join by scanning a QR code
            </p>
            <GameButton
              variant="primary"
              size="lg"
              onClick={handleCreateParty}
              disabled={isLoading}
              className="w-full"
            >
              Create Party Room
            </GameButton>
          </div>
        </GameCard>

        <GameCard>
          <div className="text-center">
            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Join Party</h3>
            <p className="text-muted-foreground mb-6">
              Enter a code to join an existing party
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="w-full px-4 py-2 mb-4 text-center text-xl font-mono bg-background border rounded"
              maxLength={6}
            />
            <GameButton
              variant="secondary"
              size="lg"
              onClick={isGuest ? handleJoinAsGuest : handleJoinAsUser}
              disabled={isLoading || !joinCode}
              className="w-full"
            >
              Join Party
            </GameButton>
          </div>
        </GameCard>
      </div>
    );
  }

  // Show lobby with QR code and participants
  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center mb-8">
        <GameButton onClick={handleBack} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
        <h1 className="text-3xl font-bold">Party: {lobbyCode}</h1>
      </div>

      {/* QR Code for host */}
      {isHost && qrDataUrl && (
        <GameCard className="mb-6" glow>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Scan to Join</h3>
            <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-4" />
            <div className="flex gap-2">
              <GameButton onClick={copyCode} size="sm" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </GameButton>
              <GameButton onClick={copyLink} size="sm" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </GameButton>
            </div>
          </div>
        </GameCard>
      )}

      {/* Game Mode Selector */}
      {isHost && (
        <GameCard className="mb-6">
          <h3 className="text-xl font-bold mb-4">Game Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            <GameButton
              variant={settings.gameMode === 'classic' ? 'primary' : 'secondary'}
              onClick={() => updateSettings({ gameMode: 'classic' })}
              className="w-full"
            >
              Classic
              <span className="block text-xs mt-1">Keep your streak</span>
            </GameButton>
            <GameButton
              variant={settings.gameMode === 'survival-30s' ? 'primary' : 'secondary'}
              onClick={() => updateSettings({ gameMode: 'survival-30s' })}
              className="w-full"
            >
              Survival 30s
              <span className="block text-xs mt-1">One mistake = out</span>
            </GameButton>
          </div>
        </GameCard>
      )}

      {/* Participants */}
      <GameCard className="mb-6">
        <h3 className="text-xl font-bold mb-4">Players ({participants.length})</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
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
                <div className="font-bold flex items-center gap-2">
                  {player.display_name}
                  {player.isGuest && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Guest</span>
                  )}
                </div>
                {player.isHost && (
                  <div className="text-xs text-primary">Host</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </GameCard>

      {/* Start button or waiting message */}
      {isHost ? (
        <GameButton
          variant="primary"
          size="lg"
          onClick={handleStartGame}
          disabled={participants.length < 2}
          className="w-full flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start {settings.gameMode === 'survival-30s' ? 'Survival' : 'Classic'} Mode
        </GameButton>
      ) : (
        <div className="text-center p-4 bg-muted rounded">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Waiting for host to start...</p>
          <p className="text-sm mt-2">Mode: {settings.gameMode === 'survival-30s' ? 'Survival 30s' : 'Classic'}</p>
        </div>
      )}
    </div>
  );
};