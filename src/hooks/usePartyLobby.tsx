import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";

interface PartyParticipant {
  id: string;
  display_name: string;
  avatar_url?: string;
  isGuest: boolean;
  isHost?: boolean;
  presence_ref?: string;
}

interface LobbySettings {
  duration: number;
  questionCount: number;
  gameMode: 'classic' | 'survival-30s';
  allowGuests?: boolean;
}

interface UsePartyLobbyReturn {
  lobbyCode: string | null;
  participants: PartyParticipant[];
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  settings: LobbySettings;
  qrUrl: string | null;
  createPartyLobby: () => Promise<string | null>;
  joinAsGuest: (code: string, displayName: string) => Promise<boolean>;
  joinAsUser: (code: string) => Promise<boolean>;
  updateSettings: (settings: Partial<LobbySettings>) => void;
  startMatch: () => Promise<void>;
  leaveLobby: () => Promise<void>;
  isInLobby: boolean;
}

export const usePartyLobby = (): UsePartyLobbyReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);
  const [participants, setParticipants] = useState<PartyParticipant[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<LobbySettings>({
    duration: 30,
    questionCount: 1000, // Many questions for survival mode
    gameMode: 'classic',
    allowGuests: false
  });
  const hostIdRef = useRef<string | null>(null);
  const myIdRef = useRef<string | null>(null);

  // Generate a random lobby code
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  // Create a new party lobby
  const createPartyLobby = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newCode = generateCode();
      const hostId = user?.id || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      hostIdRef.current = hostId;
      myIdRef.current = hostId;
      setIsHost(true);
      setLobbyCode(newCode);
      
      // Generate QR URL
      const baseUrl = window.location.origin;
      const qrLink = `${baseUrl}/?lobby=${newCode}&guest=1`;
      setQrUrl(qrLink);
      
      // Join the channel immediately
      await setupChannel(newCode, hostId, true);
      
      return newCode;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to create party lobby",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Join as guest (no authentication required)
  const joinAsGuest = useCallback(async (code: string, displayName: string): Promise<boolean> => {
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      myIdRef.current = guestId;
      setLobbyCode(code.toUpperCase());
      
      // Join the channel
      await setupChannel(code.toUpperCase(), guestId, false, {
        id: guestId,
        display_name: displayName,
        isGuest: true
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to join lobby",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Join as authenticated user
  const joinAsUser = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      myIdRef.current = user.id;
      setLobbyCode(code.toUpperCase());
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      // Join the channel
      await setupChannel(code.toUpperCase(), user.id, false, {
        id: user.id,
        display_name: profile?.display_name || user.email?.split('@')[0] || 'Player',
        avatar_url: profile?.avatar_url,
        isGuest: false
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to join lobby",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Update lobby settings (host only)
  const updateSettings = useCallback((newSettings: Partial<LobbySettings>) => {
    if (!isHost) return;
    
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Broadcast settings update
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'settings-update',
          payload: updated
        });
      }
      
      return updated;
    });
  }, [isHost, channel]);

  // Start the match (host only)
  const startMatch = useCallback(async () => {
    if (!isHost || !channel) return;

    try {
      const seed = Math.random().toString(36).slice(2);
      const startTime = Date.now() + 3000; // 3 second countdown

      // Broadcast start event
      channel.send({
        type: 'broadcast',
        event: 'start',
        payload: {
          seed,
          startTime,
          settings,
          gameMode: settings.gameMode
        }
      });

      // Trigger local start too
      const event = new CustomEvent('party-start', {
        detail: {
          seed,
          startTime,
          settings,
          gameMode: settings.gameMode
        }
      });
      window.dispatchEvent(event);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to start match",
        variant: "destructive"
      });
    }
  }, [isHost, channel, settings, toast]);

  // Setup Realtime channel
  const setupChannel = async (
    code: string, 
    userId: string, 
    asHost: boolean,
    userData?: any
  ) => {
    const channelName = `party:${code}`;
    const newChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId
        },
        broadcast: {
          self: true,
          ack: false
        }
      }
    });

    // Track presence
    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState() as RealtimePresenceState<any>;
        const users: PartyParticipant[] = [];
        
        for (const [key, presences] of Object.entries(state)) {
          if (presences && presences.length > 0) {
            const presence = presences[0];
            users.push({
              id: key,
              display_name: presence.display_name || 'Player',
              avatar_url: presence.avatar_url,
              isGuest: presence.isGuest || false,
              isHost: presence.isHost || false,
              presence_ref: key
            });
          }
        }
        
        // Check if we need to determine the host
        if (!hostIdRef.current && users.length > 0) {
          const hostUser = users.find(u => u.isHost);
          if (hostUser) {
            hostIdRef.current = hostUser.id;
            setIsHost(hostUser.id === myIdRef.current);
          }
        }
        
        setParticipants(users);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // If host left, close the lobby for everyone
        if (key === hostIdRef.current) {
          toast({
            title: "Lobby Closed",
            description: "The host has left the lobby",
            variant: "destructive"
          });
          leaveLobby();
        }
      })
      .on('broadcast', { event: 'start' }, ({ payload }) => {
        // Handle game start
        if (payload) {
          const event = new CustomEvent('party-start', {
            detail: payload
          });
          window.dispatchEvent(event);
        }
      })
      .on('broadcast', { event: 'settings-update' }, ({ payload }) => {
        // Handle settings update
        if (payload && !isHost) {
          setSettings(payload);
        }
      })
      .on('broadcast', { event: 'lobby-closed' }, () => {
        // Handle lobby closure
        toast({
          title: "Lobby Closed",
          description: "The lobby has been closed",
          variant: "destructive"
        });
        leaveLobby();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const trackData = userData || {
            id: userId,
            display_name: user?.email?.split('@')[0] || 'Player',
            isGuest: !user,
            isHost: asHost
          };
          
          await newChannel.track(trackData);
        }
      });

    setChannel(newChannel);
  };

  // Leave the lobby
  const leaveLobby = useCallback(async () => {
    try {
      // If host, broadcast lobby closure
      if (isHost && channel) {
        channel.send({
          type: 'broadcast',
          event: 'lobby-closed',
          payload: {}
        });
      }

      // Clean up channel
      if (channel) {
        await supabase.removeChannel(channel);
        setChannel(null);
      }

      // Reset state
      setLobbyCode(null);
      setParticipants([]);
      setIsHost(false);
      setQrUrl(null);
      hostIdRef.current = null;
      myIdRef.current = null;
    } catch (err: any) {
      console.error('Error leaving lobby:', err);
    }
  }, [channel, isHost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channel]);

  return {
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
    isInLobby: !!lobbyCode
  };
};