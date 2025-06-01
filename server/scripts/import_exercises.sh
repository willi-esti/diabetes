#!/bin/bash

echo "Creating temporary directory for exercises import..."
mkdir -p "../$(dirname "$0")/tmp"
cd "../$(dirname "$0")/tmp"
echo "Getting exercises from free-exercise-db repository..."

# Clone the free-exercise-db repository
# If the repository already exists, pull the latest changes
if [ -d "free-exercise-db" ]; then
  cd free-exercise-db
  git pull
else
  git clone https://github.com/yuhonas/free-exercise-db.git
  cd free-exercise-db 
fi
if [ -d "exercises" ]; then
  echo "The exercises directory already exists."
else
  echo "The exercises directory does not exist."
  exit 1
fi

# Copy images to public directory and import JSON to database
PUBLIC_DIR="../../public"
if [ ! -d "$PUBLIC_DIR" ]; then
  echo "Public directory does not exist. Creating it..."
  mkdir -p "$PUBLIC_DIR"
fi
DB_URL="${DATABASE_URL:-postgres://user:password@localhost:5432/diabetes}"
HTTP_SERVER_URL=$(grep HTTP_SERVER_URL $(dirname "$0")/../../.env | cut -d '=' -f2)

# Copy all exercise image folders to public/images
echo "Copying images to $PUBLIC_DIR/images..."
mkdir -p "$PUBLIC_DIR/images"
cp -r exercises/* "$PUBLIC_DIR/images/"
rm -rf "$PUBLIC_DIR/images/*.json"
echo "Images copied to $PUBLIC_DIR/images"

read -p "Do you want to run the command sed -i \"s/'/''/g\" *json ? (y/n): " run_sed
if [ "$run_sed" == "y" ]; then
  echo "Running sed command to escape single quotes in JSON files..."
  sed -i "s/'/''/g" exercises/*.json
  echo "sed command completed."
else
  echo "Skipping sed command."
fi

# Use psql from the official postgres Docker image
for json_file in `ls exercises/*.json`; do
  id=$(basename "$json_file" .json | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
  echo "Processing JSON file: $id"
  if [ ! -f "$json_file" ]; then
    echo "JSON file $json_file does not exist. Skipping..."
    continue
  fi
  echo "Processing exercise: $id"

  name=$(jq -r '.name' "$json_file")
  if [ -z "$name" ]; then
    echo "Name is empty for $json_file. Skipping..."
    continue
  fi
  force=$(jq -r '.force' "$json_file")
  level=$(jq -r '.level' "$json_file")
  mechanic=$(jq -r '.mechanic' "$json_file")
  equipment=$(jq -r '.equipment' "$json_file")
  primary_muscles=$(jq -c '.primaryMuscles' "$json_file"  | sed 's/\"/'\''/g' | sed "s/\\\'/\"/g")
  secondary_muscles=$(jq -c '.secondaryMuscles' "$json_file" | sed 's/\"/'\''/g' | sed "s/\\\'/\"/g")
  instructions=$(jq -c '.instructions' "$json_file" | sed 's/\"/'\''/g' | sed "s/\\\'/\"/g")
  category=$(jq -r '.category' "$json_file")
  images=$(jq -c '.images' "$json_file" | sed 's/\"/'\''/g' | sed "s/\\\'/\"/g")
  if [ -z "$images" ]; then
    echo "Images are empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$id" ]; then
    echo "ID is empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$force" ]; then
    echo "Force is empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$level" ]; then
    echo "Level is empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$mechanic" ]; then
    echo "Mechanic is empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$equipment" ]; then
    echo "Equipment is empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$primary_muscles" ]; then
    echo "Primary muscles are empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$secondary_muscles" ]; then
    echo "Secondary muscles are empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$instructions" ]; then
    echo "Instructions are empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$category" ]; then
    echo "Category is empty for $json_file. Skipping..."
    continue
  fi
  if [ -z "$images" ]; then
    echo "Images are empty for $json_file. Skipping..."
    continue
  fi
  : '
  echo "All fields are valid for $json_file"
  echo "ID: $id"
  echo "Name: $name"
  echo "Force: $force"
  echo "Level: $level"
  echo "Mechanic: $mechanic"
  echo "Equipment: $equipment"
  echo "Primary Muscles: $primary_muscles"
  echo "Secondary Muscles: $secondary_muscles"
  echo "Instructions: $instructions"
  echo "Category: $category"
  echo "Images: $images"
  echo "Preparing SQL insert for $json_file..."
  '
  # Convert JSON to SQL insert statement using jq
  echo "Converting JSON to SQL insert statement for $json_file..."
  if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Please install jq to run this script."
    exit 1
  fi
  if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker to run this script."
    exit 1
  fi
  if [ -z "$DB_URL" ]; then
    echo "DATABASE_URL is not set. Please set it to run this script."
    exit 1
  fi
  if [ -z "$HTTP_SERVER_URL" ]; then
    echo "HTTP_SERVER_URL is not set. Please set it to run this script."
    exit 1
  fi
  echo "All checks passed. Proceeding with SQL insert for $json_file..."
  echo "Using DATABASE_URL: $DB_URL"
  echo "Using HTTP_SERVER_URL: $HTTP_SERVER_URL"
  echo "Creating SQL insert statement for $json_file..."
  sql="INSERT INTO exercise_library (
    id, name, force, level, mechanic, equipment,
    primary_muscles, secondary_muscles, instructions,
    category, images
  ) VALUES (
    '$id',
    '$name',
    '$force',
    '$level',
    '$mechanic',
    '$equipment',
    ARRAY$primary_muscles::text[],
    ARRAY$secondary_muscles::text[],
    ARRAY$instructions::text[],
    '$category',
    ARRAY$images::text[]
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    force = EXCLUDED.force,
    level = EXCLUDED.level,
    mechanic = EXCLUDED.mechanic,
    equipment = EXCLUDED.equipment,
    primary_muscles = EXCLUDED.primary_muscles,
    secondary_muscles = EXCLUDED.secondary_muscles,
    instructions = EXCLUDED.instructions,
    category = EXCLUDED.category,
    images = EXCLUDED.images;"
  echo $sql
  echo $sql | docker exec -i db psql "$DB_URL" | grep  "ERROR" && {
    read -p "Error (y) :"
    continue
  }
  #exit
done


