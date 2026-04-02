-- ============================================
-- WK Poule 2026 - Elloro X Recranet
-- Database Schema for Supabase
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  stage TEXT NOT NULL,
  group_name TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_flag TEXT,
  away_flag TEXT,
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

-- Predictions table
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  home_score INTEGER NOT NULL CHECK (home_score >= 0),
  away_score INTEGER NOT NULL CHECK (away_score >= 0),
  points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all predictions for finished matches"
  ON predictions FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM matches WHERE matches.id = predictions.match_id AND matches.status = 'FINISHED'
    )
  );

CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions before match starts"
  ON predictions FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = predictions.match_id
      AND matches.match_date > NOW()
    )
  );

-- Bonus predictions
CREATE TABLE bonus_predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_key TEXT NOT NULL,
  answer TEXT NOT NULL,
  points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_key)
);

ALTER TABLE bonus_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all bonus predictions"
  ON bonus_predictions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own bonus predictions"
  ON bonus_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bonus predictions before tournament"
  ON bonus_predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to calculate points for a prediction
CREATE OR REPLACE FUNCTION calculate_points(
  pred_home INTEGER,
  pred_away INTEGER,
  actual_home INTEGER,
  actual_away INTEGER
) RETURNS INTEGER AS $$
BEGIN
  -- Exact score: 5 points
  IF pred_home = actual_home AND pred_away = actual_away THEN
    RETURN 5;
  END IF;

  -- Correct goal difference: 3 points
  IF (pred_home - pred_away) = (actual_home - actual_away) THEN
    RETURN 3;
  END IF;

  -- Correct winner/draw: 2 points
  IF SIGN(pred_home - pred_away) = SIGN(actual_home - actual_away) THEN
    RETURN 2;
  END IF;

  -- Nothing correct: 0 points
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-calculate points when match result is updated
CREATE OR REPLACE FUNCTION update_prediction_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'FINISHED' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    UPDATE predictions
    SET points = calculate_points(predictions.home_score, predictions.away_score, NEW.home_score, NEW.away_score)
    WHERE match_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_result_updated
  AFTER UPDATE OF home_score, away_score, status ON matches
  FOR EACH ROW EXECUTE FUNCTION update_prediction_points();

-- Leaderboard view
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
