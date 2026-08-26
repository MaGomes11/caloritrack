CREATE DATABASE IF NOT EXISTS caloritrack;
USE caloritrack;

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  weight DECIMAL(5,1) NOT NULL DEFAULT 0,
  height DECIMAL(5,1) NOT NULL DEFAULT 0,
  age INT NOT NULL DEFAULT 0,
  sex ENUM('M', 'F') NOT NULL DEFAULT 'M',
  goal ENUM('lose', 'maintain', 'gain') NOT NULL DEFAULT 'maintain',
  daily_calories INT NOT NULL DEFAULT 2000,
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE foods (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  calories DECIMAL(6,1) NOT NULL,
  protein DECIMAL(5,1) NOT NULL DEFAULT 0,
  carbs DECIMAL(5,1) NOT NULL DEFAULT 0,
  fat DECIMAL(5,1) NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  user_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE meals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  food_id VARCHAR(36) NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'snack', 'dinner') NOT NULL,
  quantity DECIMAL(6,1) NOT NULL,
  calories DECIMAL(7,1) NOT NULL,
  protein DECIMAL(6,1) NOT NULL DEFAULT 0,
  carbs DECIMAL(6,1) NOT NULL DEFAULT 0,
  fat DECIMAL(6,1) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_user ON foods(user_id, is_default);
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  cakto_subscription_id VARCHAR(255),
  cakto_order_id VARCHAR(255),
  status ENUM('active','inactive','canceled','expired','paused','trial') NOT NULL DEFAULT 'inactive',
  amount DECIMAL(10,2) NOT NULL DEFAULT 19.90,
  payment_method VARCHAR(50),
  next_payment_date DATETIME,
  current_period INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO foods (id, name, calories, protein, carbs, fat, is_default) VALUES
('f001', 'Arroz branco', 130, 2.7, 28.2, 0.3, TRUE),
('f002', 'Feijão carioca', 76, 4.8, 13.6, 0.5, TRUE),
('f003', 'Frango grelhado', 165, 31, 0, 3.6, TRUE),
('f004', 'Carne bovina (patinho)', 134, 24, 0, 3.5, TRUE),
('f005', 'Carne moída', 212, 18.6, 0, 15.1, TRUE),
('f006', 'Ovo inteiro', 155, 12.6, 1.1, 10.6, TRUE),
('f007', 'Clara de ovo', 52, 10.9, 0.7, 0.2, TRUE),
('f008', 'Leite integral', 61, 3.2, 4.8, 3.3, TRUE),
('f009', 'Leite desnatado', 34, 3.4, 5, 0.1, TRUE),
('f010', 'Queijo minas', 264, 17.4, 3.1, 20.4, TRUE),
('f011', 'Queijo cottage', 98, 11.7, 3.4, 4.3, TRUE),
('f012', 'Banana', 89, 1.1, 22.8, 0.3, TRUE),
('f013', 'Maçã', 52, 0.3, 13.8, 0.2, TRUE),
('f014', 'Laranja', 47, 0.9, 11.8, 0.1, TRUE),
('f015', 'Abacate', 160, 2, 8.5, 14.7, TRUE),
('f016', 'Batata inglesa', 77, 2, 17, 0.1, TRUE),
('f017', 'Batata doce', 86, 1.6, 20.1, 0.1, TRUE),
('f018', 'Mandioca', 125, 1.2, 30.1, 0.2, TRUE),
('f019', 'Pão francês', 300, 8.5, 57, 3.5, TRUE),
('f020', 'Pão integral', 247, 13, 41, 3.4, TRUE),
('f021', 'Aveia', 389, 16.9, 66.3, 6.9, TRUE),
('f022', 'Macarrão cozido', 157, 5.8, 31, 0.9, TRUE),
('f023', 'Brócolis', 34, 2.8, 7, 0.4, TRUE),
('f024', 'Cenoura', 41, 0.9, 9.6, 0.2, TRUE),
('f025', 'Tomate', 18, 0.9, 3.9, 0.2, TRUE),
('f026', 'Alface', 15, 1.4, 2.9, 0.2, TRUE),
('f027', 'Pepino', 16, 0.7, 3.6, 0.1, TRUE),
('f028', 'Mandioca frita', 331, 1.5, 79, 1.3, TRUE),
('f029', 'Batata frita', 312, 3.4, 41, 15, TRUE),
('f030', 'Peixe tilápia', 96, 20.1, 0, 1.7, TRUE),
('f031', 'Sardinha', 208, 24.6, 0, 11.4, TRUE),
('f032', 'Atum (conserva)', 128, 29, 0, 0.6, TRUE),
('f033', 'Café sem açúcar', 2, 0.3, 0, 0, TRUE),
('f034', 'Suco de laranja', 45, 0.7, 10.4, 0.2, TRUE),
('f035', 'Requeijão', 302, 7.2, 4.1, 28.8, TRUE),
('f036', 'Manteiga', 717, 0.9, 0.1, 81, TRUE),
('f037', 'Azeite de oliva', 884, 0, 0, 100, TRUE),
('f038', 'Mel', 304, 0.3, 82.4, 0, TRUE),
('f039', 'Whey protein', 120, 24, 3, 1.5, TRUE);
