-- Add competition support to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS competition TEXT DEFAULT 'WC';

-- Update existing matches to WC
UPDATE matches SET competition = 'WC' WHERE competition IS NULL;

-- Update the leaderboard view to support filtering (or show all)
DROP VIEW IF EXISTS leaderboard;
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id,
  p.display_name,
  p.avatar_url,
  COALESCE(SUM(pr.points), 0) AS total_points,
  COUNT(pr.points) AS matches_scored,
  COUNT(CASE WHEN pr.points = 5 THEN 1 END) AS exact_scores,
  COUNT(CASE WHEN pr.points = 3 THEN 1 END) AS correct_differences,
  COUNT(CASE WHEN pr.points = 2 THEN 1 END) AS correct_winners,
  COALESCE(SUM(bp.points), 0) AS bonus_points,
  COALESCE(SUM(pr.points), 0) + COALESCE(SUM(bp.points), 0) AS grand_total
FROM profiles p
LEFT JOIN predictions pr ON p.id = pr.user_id
LEFT JOIN (
  SELECT user_id, SUM(points) as points
  FROM bonus_predictions
  GROUP BY user_id
) bp ON p.id = bp.user_id
GROUP BY p.id, p.display_name, p.avatar_url
ORDER BY grand_total DESC;
