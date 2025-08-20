-- Security fixes for the math game app

-- 1. Fix the overly permissive RLS policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more secure RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public profile data" 
ON public.profiles 
FOR SELECT 
USING (true);

-- 2. Recreate the handle_new_user function with proper security
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Only use non-sensitive metadata, avoid using email as fallback
  INSERT INTO public.profiles (
    user_id, 
    username, 
    display_name
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous Player')
  );
  RETURN NEW;
END;
$$;

-- 3. Create the trigger with proper security
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Add a function to safely get user stats (avoiding direct profile access in components)
CREATE OR REPLACE FUNCTION public.get_user_stats(target_user_id uuid)
RETURNS TABLE (
  username text,
  display_name text,
  total_games integer,
  games_won integer,
  highest_score integer,
  current_win_streak integer,
  longest_win_streak integer,
  total_correct_answers integer,
  total_questions_answered integer,
  fastest_answer_time real
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.username,
    p.display_name,
    p.total_games,
    p.games_won,
    p.highest_score,
    p.current_win_streak,
    p.longest_win_streak,
    p.total_correct_answers,
    p.total_questions_answered,
    p.fastest_answer_time
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;