import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";

interface LobbyParticipant {
  id: string;
  display_name: string;
  avatar_url?: string;
  presence_ref?: string;
}

interface LobbyData {
  id: string;
  code: string;
  owner_user_id: string;
  status: 'waiting' | 'starting' | 'in_progress' | 'finished';
  settings?: any;
  seed?: string;
  start_time?: number;
}

interface UseLobbyReturn {
  lobby: LobbyData | null;
  participants: LobbyParticipant[];
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  createLobby: () => Promise<string | null>;
  joinLobby: (code: string) => Promise<boolean>;
  startMatch: () => Promise<void>;
  leaveLobby: () => Promise<void>;
}

export const useLobby = (code?: string): UseLobbyReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHost = lobby?.owner_user_id === user?.id;

  // Generate a random lobby code
  const generateCode = () => {
    return 'GAME' + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  // Create a new lobby
  const createLobby = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newCode = generateCode();
      
      // Create lobby in database
      const { data, error } = await supabase
        .from('lobbies')
        .insert({
          code: newCode,
          owner_user_id: user.id,
          status: 'waiting',
          settings: {
            duration: 30,
            questionCount: 20,
            gameMode: '1v1'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Join as participant
      await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: data.id,
          user_id: user.id
        });

      setLobby(data as LobbyData);
      return newCode;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to create lobby",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Join an existing lobby
  const joinLobby = useCallback(async (joinCode: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find lobby by code
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('code', joinCode.toUpperCase())
        .single();

      if (lobbyError) throw new Error('Lobby not found');

      // Check if lobby is joinable
      if (lobbyData.status !== 'waiting') {
        throw new Error('Game already in progress');
      }

      // Join as participant
      const { error: joinError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobbyData.id,
          user_id: user.id
        });

      if (joinError && joinError.code !== '23505') { // Ignore duplicate key error
        throw joinError;
      }

      setLobby(lobbyData as LobbyData);
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

  // Start the match (host only)
  const startMatch = useCallback(async () => {
    if (!isHost || !lobby || !user) return;

    try {
      const seed = Math.random().toString(36).slice(2);
      const startTime = Date.now() + 3000; // 3 second countdown

      // Update lobby status
      const { error } = await supabase
        .from('lobbies')
        .update({
          status: 'starting',
          seed,
          start_time: startTime
        })
        .eq('id', lobby.id);

      if (error) throw error;

      // Broadcast start event
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'start',
          payload: {
            seed,
            startTime,
            settings: lobby.settings
          }
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to start match",
        variant: "destructive"
      });
    }
  }, [isHost, lobby, user, channel, toast]);

  // Leave the lobby
  const leaveLobby = useCallback(async () => {
    if (!user || !lobby) return;

    try {
      // Remove from participants
      await supabase
        .from('lobby_participants')
        .delete()
        .eq('lobby_id', lobby.id)
        .eq('user_id', user.id);

      // If host, delete the lobby
      if (isHost) {
        await supabase
          .from('lobbies')
          .delete()
          .eq('id', lobby.id);
      }

      // Clean up channel
      if (channel) {
        await supabase.removeChannel(channel);
        setChannel(null);
      }

      setLobby(null);
      setParticipants([]);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to leave lobby",
        variant: "destructive"
      });
    }
  }, [user, lobby, isHost, channel, toast]);

  // Set up realtime presence and listeners
  useEffect(() => {
    if (!lobby || !user) return;

    const setupChannel = async () => {
      // Get user profile for display
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const channelName = `lobby:${lobby.code}`;
      const newChannel = supabase.channel(channelName, {
        config: {
          presence: {
            key: user.id
          },
          broadcast: {
            self: true
          }
        }
      });

      // Track presence
      newChannel
        .on('presence', { event: 'sync' }, () => {
          const state = newChannel.presenceState() as RealtimePresenceState<any>;
          const users: LobbyParticipant[] = [];
          
          for (const [key, presences] of Object.entries(state)) {
            if (presences && presences.length > 0) {
              const presence = presences[0];
              users.push({
                id: key,
                display_name: presence.display_name || 'Player',
                avatar_url: presence.avatar_url,
                presence_ref: key
              });
            }
          }
          
          setParticipants(users);
        })
        .on('broadcast', { event: 'start' }, ({ payload }) => {
          // Handle game start
          if (payload && window.location.pathname === '/') {
            const event = new CustomEvent('lobby-start', {
              detail: {
                seed: payload.seed,
                startTime: payload.startTime,
                settings: payload.settings
              }
            });
            window.dispatchEvent(event);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await newChannel.track({
              id: user.id,
              display_name: profile?.display_name || user.email?.split('@')[0] || 'Player',
              avatar_url: profile?.avatar_url
            });
          }
        });

      setChannel(newChannel);
    };

    setupChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [lobby?.code, user?.id]); // Only depend on lobby code and user id

  // Load lobby data if code is provided
  useEffect(() => {
    if (code && user && !lobby) {
      joinLobby(code);
    }
  }, [code, user, !lobby]);

  return {
    lobby,
    participants,
    isHost,
    isLoading,
    error,
    createLobby,
    joinLobby,
    startMatch,
    leaveLobby
  };
};