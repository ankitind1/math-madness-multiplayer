-- Create profiles table with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_games INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  fastest_answer_time REAL,
  current_win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create lobbies table
CREATE TABLE IF NOT EXISTS public.lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'in_progress', 'finished')),
  settings JSONB,
  seed TEXT,
  start_time BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lobby_participants table
CREATE TABLE IF NOT EXISTS public.lobby_participants (
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (lobby_id, user_id)
);

-- Enable RLS on lobbies and participants
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_participants ENABLE ROW LEVEL SECURITY;

-- Lobbies policies
CREATE POLICY "Participants and owner can read lobby" 
ON public.lobbies FOR SELECT 
USING (
  owner_user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.lobby_participants 
    WHERE lobby_id = lobbies.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create lobbies" 
ON public.lobbies FOR INSERT 
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owners can update their lobbies" 
ON public.lobbies FOR UPDATE 
USING (owner_user_id = auth.uid());

CREATE POLICY "Owners can delete their lobbies" 
ON public.lobbies FOR DELETE 
USING (owner_user_id = auth.uid());

-- Lobby participants policies
CREATE POLICY "Participants can view lobby members" 
ON public.lobby_participants FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lobby_participants lp 
    WHERE lp.lobby_id = lobby_participants.lobby_id 
    AND lp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join lobbies" 
ON public.lobby_participants FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave lobbies" 
ON public.lobby_participants FOR DELETE 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.lobbies 
    WHERE id = lobby_participants.lobby_id 
    AND owner_user_id = auth.uid()
  )
);

-- Create or replace the handle_new_user function to properly set display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    avatar_url,
    username
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'Player'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard_stats AS
SELECT 
  p.id AS user_id,
  p.display_name,
  p.avatar_url,
  p.total_games,
  p.games_won,
  p.highest_score,
  p.total_correct_answers,
  p.total_questions_answered,
  CASE 
    WHEN p.total_questions_answered > 0 
    THEN ROUND((p.total_correct_answers::numeric / p.total_questions_answered::numeric * 100)::numeric, 1)
    ELSE 0
  END AS accuracy,
  p.current_win_streak,
  p.longest_win_streak,
  p.fastest_answer_time,
  p.updated_at AS last_played
FROM public.profiles p
WHERE p.total_games > 0
ORDER BY p.games_won DESC, p.highest_score DESC;

-- Grant access to the view
GRANT SELECT ON public.leaderboard_stats TO anon, authenticated;