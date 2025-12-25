-- Database Schema for Shared Reality App

CREATE DATABASE IF NOT EXISTS shared_reality;
USE shared_reality;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  level INT DEFAULT 1,
  xp_points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_login TIMESTAMP,
  role ENUM('user', 'admin') DEFAULT 'user'
);

-- Daily drills table
CREATE TABLE IF NOT EXISTS daily_drills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  drill_type ENUM('observation', 'third_thing', 'co_creation', 'silence'),
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  drill_date DATE,
  score INT DEFAULT 0, -- 1-4 points for the drill
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_drill (user_id, drill_date)
);

-- Conversation simulations
CREATE TABLE IF NOT EXISTS simulations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  simulation_type ENUM('world1', 'world2', 'world3', 'toolkit'),
  scenario TEXT,
  user_response TEXT,
  ai_response TEXT,
  score INT, -- Shared Reality score 1-4
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User's journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  title VARCHAR(255),
  content TEXT,
  world_type ENUM('memory_palace', 'parallel_universe', 'meaning_lab', 'other'),
  tools_used JSON, -- Stores array of tools used
  connection_score INT, -- Self-assessment 1-10
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Conversation tools library
CREATE TABLE IF NOT EXISTS conversation_tools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tool_name VARCHAR(100),
  tool_type ENUM('non_question', 'world_builder', 'technique'),
  description TEXT,
  formula TEXT,
  example TEXT,
  difficulty_level INT
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  tool_id INT,
  times_used INT DEFAULT 0,
  success_rate DECIMAL(5,2),
  last_used TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tool_id) REFERENCES conversation_tools(id)
);

-- Simulation messages for persistence
CREATE TABLE IF NOT EXISTS simulation_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  role ENUM('user', 'ai') NOT NULL,
  content TEXT NOT NULL,
  feedback TEXT,
  options JSON,
  score INT DEFAULT NULL, -- 1-4 points for this turn
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- FontAwesome icon name
  xp_reward INT DEFAULT 100
);

-- User Achievements (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  achievement_id INT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Seed some achievements
INSERT IGNORE INTO achievements (name, description, icon, xp_reward) VALUES 
('First Co-Creation', 'Complete your first successful AI simulation.', 'fa-star', 100),
('Journalist', 'Record 5 entries in your connection journal.', 'fa-book', 150),
('Master Observer', 'Reach Level 5 in the Observation tool.', 'fa-eye', 200),
('Shared Reality Pro', 'Achieve a perfect 4-point score in a simulation.', 'fa-crown', 300);

-- Shared Worlds Wall
CREATE TABLE IF NOT EXISTS shared_worlds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  scenario_context TEXT,
  transcript JSON, -- Full conversation turns
  final_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Weekly Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  goal_type ENUM('simulation', 'journal', 'drill') NOT NULL,
  goal_count INT DEFAULT 1,
  xp_reward INT DEFAULT 100,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_challenges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  challenge_id INT,
  current_progress INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  earned_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Seed initial challenge
INSERT INTO challenges (title, description, goal_type, goal_count, xp_reward, start_date, end_date) 
VALUES ('Shared Reality Explorer', 'Complete 3 simulations with SARA this week.', 'simulation', 3, 150, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY));

-- Seed more initial tools for variety
INSERT INTO conversation_tools (tool_name, tool_type, description, formula, example, difficulty_level) VALUES 
('Observation + Wonder', 'non_question', 'Make an observation and follow it with a curiosity.', 'I notice [observation]... I wonder [curiosity]...', 'I notice you have that focus look. I wonder if you are planning something fun.', 1),
('The Third Thing', 'technique', 'Talk about something you are both experiencing.', 'Identify X -> Explore X together', 'This rain is either romantic or inconvenient. What do you think?', 2),
('Hypothetical Scenario', 'world_builder', 'Imagine a scenario together.', 'Imagine if [scenario]...', 'Imagine if we could read minds right now. What would be surprising?', 2),
('Mutual Assumption', 'world_builder', 'Assume a shared truth or background.', 'Since we both [assume X]...', 'Since we both clearly love overpriced coffee, let''s decide which one here is the most pretentious.', 2),
('Shared Confusion', 'non_question', 'Express a shared state of not knowing.', 'I''m a bit lost on [X]... are you?', 'I''m a bit lost on how this line works... are you as confused as I am?', 1),
('Perspective Swap', 'technique', 'Look at something from a different angle.', 'To [X], this must look like [Y].', 'To that barista, we probably look like NPCs in a very slow video game.', 3),
('Co-Created Story', 'world_builder', 'Start a narrative that they can finish.', 'Once upon a time [X]... and then?', 'Once upon a time, this cafe was actually a spaceship, and then...?', 3);
