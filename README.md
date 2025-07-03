# 🚛 Trip Tracker - Truck Driver Logbook App

Hey there! 👋 I built this little app to help truck drivers plan their trips and generate proper ELD logs. It's a full-stack app that takes your trip details and creates route instructions and daily log sheets - hopefully making the paperwork a bit easier!

## What it does

- **Input**: Current location, pickup/dropoff locations, and current cycle hours
- **Output**: Route map with stops/rests + properly filled daily log sheets
- **Assumptions**: Property-carrying driver, 70hrs/8days, fueling every 1,000 miles, 1 hour for pickup/dropoff

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Django + Django Ninja
- **Package Managers**: pnpm (frontend) + uv (backend)
- **API**: openapi-typescript + openapi-fetch for type-safe API calls

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.13+
- pnpm (`npm install -g pnpm`)
- uv (`pip install uv`)

### Quick Start (Recommended)

Use the bootstrap script to set up everything automatically:

```bash
./bootstrap.sh  # Sets up and starts both backend and frontend
```

This will:

- Install all dependencies
- Set up the database and load fixtures
- Generate API types
- Start both services in the background

To stop all services:

```bash
./stop.sh
```

### Manual Setup

#### Backend Setup

```bash
cd backend
uv sync  # Install dependencies
uv run python manage.py migrate  # Set up database
uv run python manage.py runserver  # Start Django server (port 8000)
```

#### Frontend Setup

```bash
cd frontend
pnpm install  # Install dependencies
pnpm dev  # Start Vite dev server (port 5173)
```

#### Generate API Types (Optional)

```bash
cd frontend
pnpm generate-types  # Generates TypeScript types from Django API
```

## Development

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- API docs available at `http://localhost:8000/api/docs`

## Features

- 🗺️ Interactive route mapping
- 📝 Automated ELD log generation
- ⏰ Rest break calculations
- 🚛 Multiple log sheets for longer trips
- 🎨 Clean, modern UI

---
