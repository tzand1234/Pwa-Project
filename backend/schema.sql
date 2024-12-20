-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  profilePicture TEXT,
  bio TEXT
);

-- Create the workouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY,
  exercise TEXT NOT NULL,
  description TEXT,
  date TEXT,
  imageUrl TEXT,
  userId INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id)
);

-- Create the reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  workoutId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  review TEXT,
  reviewDate TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workoutId) REFERENCES workouts (id),
  FOREIGN KEY (userId) REFERENCES users (id)
);