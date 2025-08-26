import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Upsert profile on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          const displayName = 
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            'Player';
            
          const { error } = await supabase
            .from('profiles')
            .upsert({
              user_id: session.user.id,
              display_name: displayName,
              avatar_url: session.user.user_metadata?.avatar_url,
              username: session.user.user_metadata?.username || `Player_${session.user.id.substring(0, 8)}`
            }, {
              onConflict: 'user_id'
            });
            
          if (error) {
            console.error('Error upserting profile:', error);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Upsert profile for existing session
      if (session?.user) {
        const displayName = 
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'Player';
          
        await supabase
          .from('profiles')
          .upsert({
            user_id: session.user.id,
            display_name: displayName,
            avatar_url: session.user.user_metadata?.avatar_url,
            username: session.user.user_metadata?.username || `Player_${session.user.id.substring(0, 8)}`
          }, {
            onConflict: 'user_id'
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};