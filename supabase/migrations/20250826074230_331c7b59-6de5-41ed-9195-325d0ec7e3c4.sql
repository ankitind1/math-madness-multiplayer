-- Fix Security Definer View issue
-- Drop the existing view first
DROP VIEW IF EXISTS public.leaderboard_stats;

-- Recreate the view with SECURITY INVOKER (default, but explicit for clarity)
-- This ensures the view respects the RLS policies of the querying user
CREATE VIEW public.leaderboard_stats 
WITH (security_invoker = true) AS
SELECT 
  p.user_id,  -- Changed from 'id' to 'user_id' for clarity
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

-- Grant appropriate permissions
-- Since this is a leaderboard that should be publicly visible,
-- we grant SELECT to authenticated and anon users
GRANT SELECT ON public.leaderboard_stats TO authenticated;
GRANT SELECT ON public.leaderboard_stats TO anon;

-- Add a comment explaining the security model
COMMENT ON VIEW public.leaderboard_stats IS 
'Public leaderboard view showing player statistics. Uses SECURITY INVOKER to respect RLS policies. Only shows data from profiles table where the "Anyone can view profiles" policy allows access.';