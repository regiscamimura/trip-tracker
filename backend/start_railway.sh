#!/bin/bash

# Railway startup script for Trip Tracker
set -e

echo "🚛 Starting Trip Tracker on Railway..."

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Load fixtures
echo "Loading fixtures..."
python manage.py loaddata user_driver.json
python manage.py loaddata truck.json
python manage.py loaddata trailer.json

echo "Starting Django server..."
python manage.py runserver 0.0.0.0:${PORT:-8080} 