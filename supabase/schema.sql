-- ============================================
-- CaloriTrack - Supabase Schema
-- ============================================

-- Tabela de perfis (extend auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('M', 'F')),
  goal TEXT NOT NULL CHECK (goal IN ('lose', 'maintain', 'gain')),
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de alimentos
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de refeições
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL,
  food_name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  quantity NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário só vê/edita o próprio
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Foods: alimentos padrão visíveis para todos, pessoais só pelo dono
CREATE POLICY "Anyone can view default foods"
  ON foods FOR SELECT
  USING (is_default = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own foods"
  ON foods FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own foods"
  ON foods FOR DELETE
  USING (user_id = auth.uid());

-- Meals: refeições só visíveis pelo dono
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- Índices para performance
-- ============================================

CREATE INDEX idx_foods_name ON foods USING gin (name gin_trgm_ops);
CREATE INDEX idx_meals_user_date ON meals (user_id, date);
CREATE INDEX idx_meals_user_id ON meals (user_id);

-- ============================================
-- Alimentos padrão (seed)
-- ============================================

INSERT INTO foods (name, calories, protein, carbs, fat, is_default) VALUES
  ('Arroz branco', 130, 2.7, 28.2, 0.3, true),
  ('Feijão carioca', 76, 4.8, 13.6, 0.5, true),
  ('Frango grelhado', 165, 31, 0, 3.6, true),
  ('Carne bovina (patinho)', 134, 24, 0, 3.5, true),
  ('Carne moída', 212, 18.6, 0, 15.1, true),
  ('Ovo inteiro', 155, 12.6, 1.1, 10.6, true),
  ('Clara de ovo', 52, 10.9, 0.7, 0.2, true),
  ('Leite integral', 61, 3.2, 4.8, 3.3, true),
  ('Leite desnatado', 34, 3.4, 5, 0.1, true),
  ('Queijo minas', 264, 17.4, 3.1, 20.4, true),
  ('Queijo cottage', 98, 11.7, 3.4, 4.3, true),
  ('Banana', 89, 1.1, 22.8, 0.3, true),
  ('Maçã', 52, 0.3, 13.8, 0.2, true),
  ('Laranja', 47, 0.9, 11.8, 0.1, true),
  ('Abacate', 160, 2, 8.5, 14.7, true),
  ('Batata inglesa', 77, 2, 17, 0.1, true),
  ('Batata doce', 86, 1.6, 20.1, 0.1, true),
  ('Mandioca', 125, 1.2, 30.1, 0.2, true),
  ('Pão francês', 300, 8.5, 57, 3.5, true),
  ('Pão integral', 247, 13, 41, 3.4, true),
  ('Aveia', 389, 16.9, 66.3, 6.9, true),
  ('Macarrão cozido', 157, 5.8, 31, 0.9, true),
  ('Brócolis', 34, 2.8, 7, 0.4, true),
  ('Cenoura', 41, 0.9, 9.6, 0.2, true),
  ('Tomate', 18, 0.9, 3.9, 0.2, true),
  ('Alface', 15, 1.4, 2.9, 0.2, true),
  ('Pepino', 16, 0.7, 3.6, 0.1, true),
  ('Mandioca frita', 331, 1.5, 79, 1.3, true),
  ('Batata frita', 312, 3.4, 41, 15, true),
  ('Peixe tilápia', 96, 20.1, 0, 1.7, true),
  ('Sardinha', 208, 24.6, 0, 11.4, true),
  ('Atum (conserva)', 128, 29, 0, 0.6, true),
  ('Café sem açúcar', 2, 0.3, 0, 0, true),
  ('Suco de laranja', 45, 0.7, 10.4, 0.2, true),
  ('Requeijão', 302, 7.2, 4.1, 28.8, true),
  ('Manteiga', 717, 0.9, 0.1, 81, true),
  ('Azeite de oliva', 884, 0, 0, 100, true),
  ('Mel', 304, 0.3, 82.4, 0, true),
  ('Whey protein', 120, 24, 3, 1.5, true);
