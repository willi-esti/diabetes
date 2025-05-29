-- This SQL script initializes the database schema for a health tracking application

-- Table for storing user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for logging blood sugar
CREATE TABLE blood_sugar_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    blood_sugar_mg_dl NUMERIC(5,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for logging blood pressure
CREATE TABLE blood_pressure_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    pulse INTEGER,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking workouts
CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    type VARCHAR(100) NOT NULL,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for kinds of workouts
CREATE TABLE workout_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking weight
CREATE TABLE weight_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for meal types
CREATE TABLE meal_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for logging meals
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL,
    meal_type INTEGER REFERENCES meal_types(id) ON DELETE SET NULL,
    description TEXT,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for menstruation tracking
CREATE TABLE menstruation_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    flow_level VARCHAR(20),
    symptoms TEXT,
    note TEXT
);

-- Table for insulin types
CREATE TABLE insulin_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for insulin tracking
CREATE TABLE insulin_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    insulin_type INTEGER REFERENCES insulin_types(id) ON DELETE SET NULL,
    dosage_units NUMERIC(5,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id) -- Prevent duplicate entries for the same user and time
);



-- Table for medication tracking
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for medication types
CREATE TABLE medication_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data into users
INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@gmail.com', '$2b$10$EIX/5z1Z3f8e1F9Q0j5uOe7k5Y6Z5a1m3d4c5b6c7d8e9f0g1h2i3j4k5l6'); -- Example hashed password

-- Insert initial data into workout types
INSERT INTO workout_types (name, description) VALUES
('Cardio', 'Aerobic exercises that increase heart rate'),
('Strength Training', 'Exercises focused on building muscle strength'),
('Flexibility', 'Exercises that improve flexibility and range of motion'),
('Balance', 'Exercises that enhance balance and stability');

-- Insert initial data into meal types
INSERT INTO meal_types (name, description) VALUES
('Breakfast', 'First meal of the day, typically eaten in the morning'),
('Lunch', 'Midday meal, usually eaten around noon'),
('Dinner', 'Main meal of the day, typically eaten in the evening'),
('Snack', 'Small meal or food item eaten between main meals');

-- Insert initial data into insulin types
INSERT INTO insulin_types (name, description) VALUES
('Rapid-acting', 'Insulin that starts working within minutes and lasts a few hours'),
('Short-acting', 'Insulin that takes about 30 minutes to start working and lasts 4-6 hours'),
('Intermediate-acting', 'Insulin that takes 2-4 hours to start working and lasts 12-18 hours'),
('Long-acting', 'Insulin that provides a steady level of insulin for up to 24 hours');

-- Insert initial data into medication types
INSERT INTO medication_types (name, description) VALUES
('Antidiabetic', 'Medications used to manage blood sugar levels in diabetes'),
('Antihypertensive', 'Medications used to manage high blood pressure'),
('Cholesterol-lowering', 'Medications that help reduce cholesterol levels'),
('Antidepressant', 'Medications used to treat depression and anxiety disorders'),
('Other', 'Any other type of medication not classified above');

-- Create indexes for performance optimization
-- CREATE INDEX idx_users_username ON users(username);
-- CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_blood_sugar_logs_user_id ON blood_sugar_logs(user_id);
CREATE INDEX idx_blood_pressure_logs_user_id ON blood_pressure_logs(user_id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_menstruation_logs_user_id ON menstruation_logs(user_id);
CREATE INDEX idx_insulin_logs_user_id ON insulin_logs(user_id);
CREATE INDEX idx_medications_user_id ON medications(user_id);
-- CREATE INDEX idx_medication_types_name ON medication_types(name);
-- CREATE INDEX idx_insulin_types_name ON insulin_types(name);
-- CREATE INDEX idx_workout_types_name ON workout_types(name);
-- CREATE INDEX idx_meal_types_name ON meal_types(name);




